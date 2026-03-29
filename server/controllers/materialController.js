import Material from "../models/Material.js";
import User from "../models/User.js";
import { cloudinary, uploadToCloudinary } from "../config/cloudinary.js";

export const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find(
      {},
      "title batch mcaYear semester section subject exam materialType faculty tags description uploadedBy downloads upvotes createdAt fileUrl",
    )
      .populate("uploadedBy", "name batch rollNumber")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ materials, total: materials.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMaterials = async (req, res) => {
  try {
    const {
      batch,
      mcaYear,
      semester,
      section,
      subject,
      exam,
      materialType,
      q,
      sort = "newest",
      page = 1,
    } = req.query;

    const filter = {};
    if (batch) filter.batch = batch;
    if (mcaYear) filter.mcaYear = Number(mcaYear);
    if (semester) filter.semester = Number(semester);
    if (section) filter.section = section;
    if (subject) filter.subject = subject;
    if (exam) filter.exam = exam;
    if (materialType) filter.materialType = materialType;

    if (q) filter.$text = { $search: q };

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { downloads: -1 },
      upvoted: { upvotes: -1 },
    };

    const PAGE_SIZE = 20;
    const skip = (Number(page) - 1) * PAGE_SIZE;

    const [materials, total] = await Promise.all([
      Material.find(filter)
        .populate("uploadedBy", "name batch rollNumber")
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Material.countDocuments(filter),
    ]);

    res.json({
      materials,
      total,
      pages: Math.ceil(total / PAGE_SIZE),
      page: Number(page),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate(
      "uploadedBy",
      "name batch email",
    );
    if (!material)
      return res.status(404).json({ error: "Material not found." });

    res.json({ material });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createMaterial = async (req, res) => {
  try {
    const {
      title,
      batch,
      mcaYear,
      semester,
      section,
      subject,
      exam,
      materialType,
      faculty,
      tags,
      description,
    } = req.body;

    if (
      !title ||
      !batch ||
      !mcaYear ||
      !semester ||
      !section ||
      !subject ||
      !tags ||
      !exam ||
      !materialType
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required." });
    }

    const isGeneralNotes = exam === "General" && materialType === "Notes";

    let existing = null;

    if (isGeneralNotes) {
      existing = await Material.findOne({
        batch,
        mcaYear: Number(mcaYear),
        semester: Number(semester),
        section,
        subject,
        exam,
        materialType,
        title: title.trim(),
      });
    } else {
      existing = await Material.findOne({
        batch,
        mcaYear: Number(mcaYear),
        semester: Number(semester),
        section,
        subject,
        exam,
        materialType,
      });
    }

    if (existing) {
      return res.status(409).json({
        error: isGeneralNotes
          ? "A notes file with the same title already exists for this subject."
          : "A material with this batch/year/sem/subject/type already exists.",
        existingId: existing._id,
      });
    }

    const { url, public_id } = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
    );

    const parsedTags = tags
      ? tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    if (parsedTags.length === 0) {
      return res.status(400).json({ error: "At least one tag is required." });
    }

    const material = await Material.create({
      title,
      batch,
      mcaYear: Number(mcaYear),
      semester: Number(semester),
      section,
      subject,
      exam,
      materialType,
      faculty,
      tags: parsedTags,
      description,
      fileUrl: url,
      publicId: public_id,
      uploadedBy: req.user._id,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { uploadCount: 1 } });

    const populated = await material.populate(
      "uploadedBy",
      "name batch rollNumber",
    );

    res.status(201).json({ material: populated });
  } catch (err) {
    console.error("Upload error:", err.message);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ error: messages });
    }
    res.status(500).json({ error: err.message });
  }
};

export const trackDownload = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true },
    );

    if (!material)
      return res.status(404).json({ error: "Material not found." });

    const downloadUrl = material.fileUrl.replace(
      "/upload/",
      "/upload/fl_attachment/",
    );

    res.json({ downloads: material.downloads, fileUrl: downloadUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const upvoteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material)
      return res.status(404).json({ error: "Material not found." });

    const userId = req.user._id.toString();
    const alreadyUpvoted = material.upvotedBy
      .map((id) => id.toString())
      .includes(userId);

    if (alreadyUpvoted) {
      material.upvotedBy.pull(req.user._id);
      material.upvotes = Math.max(0, material.upvotes - 1);
    } else {
      material.upvotedBy.push(req.user._id);
      material.upvotes += 1;
    }

    await material.save();
    res.json({ upvotes: material.upvotes, upvoted: !alreadyUpvoted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const flagMaterial = async (req, res) => {
  try {
    const { reason } = req.body;
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      {
        flagged: true,
        flagReason: reason || "No reason provided",
        $addToSet: { flaggedBy: req.user._id },
      },
      { new: true },
    );

    if (!material)
      return res.status(404).json({ error: "Material not found." });

    res.json({ message: "Material flagged for review." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material)
      return res.status(404).json({ error: "Material not found." });

    const isOwner = material.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this material." });
    }

    try {
      await cloudinary.uploader.destroy(material.publicId, {
        resource_type: "raw",
      });
    } catch (cloudErr) {
      console.warn("Cloudinary delete failed:", cloudErr.message);
    }

    // material.isDeleted = true;
    // await material.save();

    // await User.findByIdAndUpdate(material.uploadedBy, {
    //   $inc: { uploadCount: -1 },
    // });

    // res.json({ message: "Material deleted successfully." });
    await Material.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(material.uploadedBy, {
      $inc: { uploadCount: -1 },
    });

    res.json({ message: "Material deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGaps = async (req, res) => {
  try {
    const { mcaYear, semester } = req.query;
    const pipeline = [
      {
        $match: {
          isDeleted: false,
          ...(mcaYear && { mcaYear: Number(mcaYear) }),
          ...(semester && { semester: Number(semester) }),
        },
      },
      {
        $group: {
          _id: {
            subject: "$subject",
            examType: "$examType",
            mcaYear: "$mcaYear",
            semester: "$semester",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.subject": 1 } },
    ];

    const existing = await Material.aggregate(pipeline);
    res.json({ gaps: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

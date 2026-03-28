// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { register } from "../api/index.js";
// import { useAuthStore } from "../store/authStore.js";

// // Parse roll number — format: 2 051 24 019
// // const parseRollNumber = (roll) => {
// //   if (!roll || roll.length !== 9) return null

// //   const program    = roll.substring(0, 1)  // "2" = PG
// //   const dept       = roll.substring(1, 4)  // "051" = Computer Applications
// //   const admYear    = roll.substring(4, 6)  // "24" = 2024
// //   const rollNo     = roll.substring(6, 9)  // "019"

// //   if (dept !== '051') return null          // only MCA students

// //   const admissionYear = 2000 + parseInt(admYear)
// //   const currentCalYear = new Date().getFullYear()
// //   const currentYear = Math.min(3, Math.max(1, currentCalYear - admissionYear + 1))
// //   const batch = `${admissionYear}-${String(admissionYear + 3).slice(2)}`

// //   return { admissionYear, currentYear, batch, rollNo, program }
// // }

// const parseRollNumber = (roll) => {
//   if (!roll || roll.length !== 9) return null;

//   const dept = roll.substring(1, 4);
//   const admYear = roll.substring(4, 6);
//   const rollNo = roll.substring(6, 9);

//   if (dept !== "051") return null;

//   const admissionYear = 2000 + parseInt(admYear);
//   const now = new Date();
//   const calYear = now.getFullYear();
//   const month = now.getMonth() + 1; // 1=Jan, 8=Aug

//   // Academic year starts in August
//   // Before August → still in previous academic year
//   // August onwards → new academic year has started
//   const academicYear = month >= 8 ? calYear : calYear - 1;

//   // How many academic years have passed since admission
//   const currentYear = Math.min(
//     3,
//     Math.max(1, academicYear - admissionYear + 1),
//   );

//   const batch = `${admissionYear}-${String(admissionYear + 3).slice(2)}`;

//   return { admissionYear, currentYear, batch, rollNo };
// };

// export default function RegisterPage() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     rollNumber: "",
//   });
//   const [parsed, setParsed] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const { setAuth } = useAuthStore();
//   const navigate = useNavigate();
//   const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

//   const handleRollChange = (v) => {
//     set("rollNumber", v);
//     if (v.length === 9) {
//       const result = parseRollNumber(v);
//       if (result) {
//         setParsed(result);
//       } else {
//         setParsed(null);
//         toast.error("Invalid roll number format or not an MCA student");
//       }
//     } else {
//       setParsed(null);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!parsed) return toast.error("Please enter a valid 9-digit roll number");

//     setLoading(true);
//     try {
//       const res = await register({
//         name: form.name,
//         email: form.email,
//         password: form.password,
//         rollNumber: form.rollNumber,
//         batch: parsed.batch,
//         currentYear: parsed.currentYear,
//       });
//       setAuth(res.data.token, res.data.user);
//       toast.success("Account created! Welcome.");
//       navigate("/");
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "var(--bg)",
//         backgroundImage:
//           "radial-gradient(ellipse at 40% 70%, rgba(124,111,255,0.07) 0%, transparent 60%)",
//       }}
//     >
//       <div style={{ width: "100%", maxWidth: 440, padding: "0 24px" }}>
//         <div style={{ marginBottom: 32, textAlign: "center" }}>
//           <h1
//             style={{
//               fontSize: 28,
//               fontWeight: 800,
//               marginBottom: 8,
//               letterSpacing: "-0.02em",
//             }}
//           >
//             Create account
//           </h1>
//           <p style={{ color: "var(--text2)", fontSize: 14 }}>
//             Join the MCA study repository
//           </p>
//         </div>

//         <div className="card" style={{ padding: "28px 24px" }}>
//           <form
//             onSubmit={handleSubmit}
//             style={{ display: "flex", flexDirection: "column", gap: 16 }}
//           >
//             <div className="form-group">
//               <label className="form-label">Full name</label>
//               <input
//                 placeholder="Rahul Sharma"
//                 value={form.name}
//                 onChange={(e) => set("name", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label className="form-label">Email</label>
//               <input
//                 type="email"
//                 placeholder="your@email.com"
//                 value={form.email}
//                 onChange={(e) => set("email", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label className="form-label">Password</label>
//               <input
//                 type="password"
//                 placeholder="Min. 6 characters"
//                 value={form.password}
//                 onChange={(e) => set("password", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label className="form-label">Roll number</label>
//               <input
//                 placeholder="e.g. 205124019"
//                 value={form.rollNumber}
//                 onChange={(e) =>
//                   handleRollChange(e.target.value.replace(/\D/g, ""))
//                 }
//                 maxLength={9}
//                 required
//               />
//               <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 5 }}>
//                 9-digit college roll number (e.g. 205124019)
//               </p>
//             </div>

//             {/* Auto-detected info */}
//             {parsed && (
//               <div
//                 style={{
//                   background: "var(--green-bg)",
//                   border: "1px solid rgba(34,197,94,0.2)",
//                   borderRadius: "var(--radius)",
//                   padding: "12px 14px",
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 6,
//                 }}
//               >
//                 <p
//                   style={{
//                     fontSize: 12,
//                     color: "var(--green)",
//                     fontWeight: 600,
//                     marginBottom: 2,
//                   }}
//                 >
//                   ✓ Roll number detected
//                 </p>
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "1fr 1fr 1fr",
//                     gap: 8,
//                   }}
//                 >
//                   <div>
//                     <p style={{ fontSize: 11, color: "var(--text3)" }}>Batch</p>
//                     <p
//                       style={{
//                         fontSize: 13,
//                         fontWeight: 600,
//                         color: "var(--text)",
//                       }}
//                     >
//                       {parsed.batch}
//                     </p>
//                   </div>
//                   <div>
//                     <p style={{ fontSize: 11, color: "var(--text3)" }}>
//                       Current year
//                     </p>
//                     <p
//                       style={{
//                         fontSize: 13,
//                         fontWeight: 600,
//                         color: "var(--text)",
//                       }}
//                     >
//                       Year {parsed.currentYear}
//                     </p>
//                   </div>
//                   <div>
//                     <p style={{ fontSize: 11, color: "var(--text3)" }}>
//                       Roll no.
//                     </p>
//                     <p
//                       style={{
//                         fontSize: 13,
//                         fontWeight: 600,
//                         color: "var(--text)",
//                       }}
//                     >
//                       #{parsed.rollNo}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <button
//               type="submit"
//               className="btn btn-primary"
//               style={{ justifyContent: "center", marginTop: 4 }}
//               disabled={loading || !parsed}
//             >
//               {loading ? "Creating account…" : "Create account →"}
//             </button>
//           </form>
//         </div>

//         <p
//           style={{
//             marginTop: 20,
//             textAlign: "center",
//             fontSize: 14,
//             color: "var(--text3)",
//           }}
//         >
//           Already have an account?{" "}
//           <Link to="/login" style={{ color: "var(--accent2)" }}>
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }



import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register } from '../api/index.js'

const parseRollNumber = (roll) => {
  if (!roll || roll.length !== 9) return null
  const dept    = roll.substring(1, 4)
  const admYear = roll.substring(4, 6)
  const rollNo  = roll.substring(6, 9)
  if (dept !== '051') return null
  const admissionYear = 2000 + parseInt(admYear)
  const now           = new Date()
  const month         = now.getMonth() + 1
  const academicYear  = month >= 8 ? now.getFullYear() : now.getFullYear() - 1
  const currentYear   = Math.min(3, Math.max(1, academicYear - admissionYear + 1))
  const batch         = `${admissionYear}-${String(admissionYear + 3).slice(2)}`
  return { admissionYear, currentYear, batch, rollNo }
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', rollNumber:'', password:'' })
  const [parsed, setParsed] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = (k, v) => setForm(p => ({...p, [k]: v}))
  const generatedEmail = form.rollNumber.length === 9 ? `${form.rollNumber}@nitt.edu` : ''

  const handleRollChange = (v) => {
    const clean = v.replace(/\D/g, '')
    set('rollNumber', clean)
    if (clean.length === 9) {
      const result = parseRollNumber(clean)
      if (result) setParsed(result)
      else { setParsed(null); toast.error('Invalid roll number or not an MCA student') }
    } else {
      setParsed(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!parsed) return toast.error('Please enter a valid 9-digit roll number')
    setLoading(true)
    try {
      const res = await register({
        name:        form.name,
        rollNumber:  form.rollNumber,
        password:    form.password,
        batch:       parsed.batch,
        currentYear: parsed.currentYear
      })
      toast.success(res.data.message || 'Account created. Please verify your email.')
      navigate('/login', {
        state: {
          pendingEmail: generatedEmail,
          notice: 'Check your email and verify your account before logging in.'
        }
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)',
      backgroundImage:'radial-gradient(ellipse at 40% 70%, rgba(124,111,255,0.07) 0%, transparent 60%)'
    }}>
      <div style={{width:'100%', maxWidth:440, padding:'0 24px'}}>
        <div style={{marginBottom:32, textAlign:'center'}}>
          <h1 style={{fontSize:28, fontWeight:800, marginBottom:8, letterSpacing:'-0.02em'}}>Create account</h1>
          <p style={{color:'var(--text2)', fontSize:14}}>Join the MCA Central Repository</p>
        </div>

        <div className="card" style={{padding:'28px 24px'}}>
          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:16}}>

            {/* 1. Full Name */}
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input placeholder="Arjun Singh Rajput" value={form.name}
                onChange={e => set('name', e.target.value)} required />
            </div>

            {/* 2. Roll Number */}
            <div className="form-group">
              <label className="form-label">Roll number</label>
              <input
                placeholder="e.g. 205124019"
                value={form.rollNumber}
                onChange={e => handleRollChange(e.target.value)}
                maxLength={9}
                required
              />
              <p style={{fontSize:12, color:'var(--text3)', marginTop:5}}>
              
              </p>
            </div>

            {/* Auto detected info */}
            {parsed && (
              <div style={{
                background:'var(--green-bg)', border:'1px solid rgba(34,197,94,0.2)',
                borderRadius:'var(--radius)', padding:'12px 14px'
              }}>
                <p style={{fontSize:12, color:'var(--green)', fontWeight:600, marginBottom:8}}>✓ Detected</p>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
                  <div>
                    <p style={{fontSize:11, color:'var(--text3)'}}>Batch</p>
                    <p style={{fontSize:13, fontWeight:600}}>{parsed.batch}</p>
                  </div>
                  <div>
                    <p style={{fontSize:11, color:'var(--text3)'}}>Year</p>
                    <p style={{fontSize:13, fontWeight:600}}>Year {parsed.currentYear}</p>
                  </div>
                  <div>
                    <p style={{fontSize:11, color:'var(--text3)'}}>Roll</p>
                    <p style={{fontSize:13, fontWeight:600}}>#{parsed.rollNo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. College Email */}
            <div className="form-group">
              <label className="form-label">College email</label>
              <input
                value={generatedEmail}
                placeholder="205124019@nitt.edu"
                disabled
              />
              <p style={{fontSize:12, color:'var(--text3)', marginTop:5}}>
                Your verification email will be sent only to your NITT webmail address.
              </p>
            </div>

            {/* 4. Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary"
              style={{justifyContent:'center', marginTop:4}}
              disabled={loading || !parsed}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>
        </div>

        <p style={{marginTop:20, textAlign:'center', fontSize:14, color:'var(--text3)'}}>
          Already have an account?{' '}
          <Link to="/login" style={{color:'var(--accent2)'}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

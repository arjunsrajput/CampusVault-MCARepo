export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY || !process.env.MAIL_FROM) {
    throw new Error("Email service is not configured.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: parseSender(process.env.MAIL_FROM),
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo email failed: ${errorText}`);
  }
};

const parseSender = (value) => {
  const match = value.match(/^(.*)<(.+)>$/);
  if (!match) return { email: value.trim() };

  return {
    name: match[1].trim(),
    email: match[2].trim(),
  };
};

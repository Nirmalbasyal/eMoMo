const nodemailer = require("nodemailer");
const dns = require("dns");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // force IPv4 resolution directly at the connection level —
  // Render can't route outbound IPv6 to Gmail's SMTP servers
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  },
});

exports.sendContactMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      message: "Please provide your name, email, and message",
    });
  }

  const mailOptions = {
    from: `"E-Momo Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER,
    replyTo: email,
    subject: subject ? `[E-Momo Contact] ${subject}` : "[E-Momo Contact] New message",
    html: `
      <h2>New message from the E-Momo contact form</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    res.status(500).json({
      message: "Failed to send your message. Please try again later.",
      error: error.message,
    });
  }
};

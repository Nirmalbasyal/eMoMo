const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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
    replyTo: email, // so hitting "Reply" in your inbox goes straight to the customer
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

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    message: "Message sent successfully",
  });
};

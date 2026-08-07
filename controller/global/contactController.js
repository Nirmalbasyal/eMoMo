const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendContactMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      message: "Please provide your name, email, and message",
    });
  }

  try {
    await resend.emails.send({
      from: "E-Momo Contact Form <onboarding@resend.dev>", // Resend's shared sender until you verify your own domain
      to: process.env.CONTACT_RECEIVER_EMAIL,
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
    });

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

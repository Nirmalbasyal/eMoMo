const nodemailer = require('nodemailer');

const sendEmail = async ({to, subject, text}) => {
  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({ 
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email app password
    },
  });

    // Define email options 
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: to, 
      subject: subject, 
      text: text, // Plain text body
    };

    // Send email
   await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
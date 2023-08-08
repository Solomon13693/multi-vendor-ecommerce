const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Configure the nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  // Specify your email service provider and authentication details
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password',
  },
});

async function sendEmail(to, subject, templateFile, templateData) {
  try {
    const templatePath = path.join(__dirname, 'templates', templateFile);

    // Render the email template using EJS
    const renderedTemplate = await ejs.renderFile(templatePath, templateData);

    const mailOptions = {
      from: 'your-email@gmail.com',
      to,
      subject,
      html: renderedTemplate,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function sendLowStockNotification(productName, stockQuantity, recipientEmail) {
  const templateData = {
    productName,
    stockQuantity,
  };

  await sendEmail(
    recipientEmail,
    'Low Stock Notification',
    'low-stock.ejs',
    templateData
  );
}

async function sendVerificationEmail(userEmail, verificationToken) {
  const templateData = {
    userEmail,
    verificationToken,
  };

  await sendEmail(
    userEmail,
    'Account Verification',
    'verification.ejs',
    templateData
  );
}

async function sendPasswordResetEmail(userEmail, resetToken) {
  const templateData = {
    userEmail,
    resetToken,
  };

  await sendEmail(
    userEmail,
    'Password Reset',
    'password-reset.ejs',
    templateData
  );
}

async function sendOrderNotification(orderData, recipientEmail) {
  const templateData = {
    orderData,
  };

  await sendEmail(
    recipientEmail,
    'New Order Notification',
    'order-notification.ejs',
    templateData
  );
}

module.exports = {
  sendLowStockNotification,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderNotification,
};

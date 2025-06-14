const nodemailer = require('nodemailer');

// Setup the transporter using your email service (Gmail in this case)
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Use your email service, e.g., 'gmail', 'smtp.mailtrap.io', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address from environment variables
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

async function sendOrderConfirmationEmail(email, orderDetails) {
  // Build the email content
  const { order_id, order_items, delivery_address } = orderDetails;

  let itemsList = '';
  order_items.forEach(item => {
    itemsList += `<li>${item.product_name} (x${item.quantity}) - $${item.product_price * item.quantity}</li>`;
  });

  const htmlContent = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order! Here are the details:</p>
    <p><strong>Order ID:</strong> ${order_id}</p>
    <p><strong>Delivery Address:</strong> ${delivery_address}</p>
    <h3>Order Items:</h3>
    <ul>
      ${itemsList}
    </ul>
    <p>If you have any questions about your order, please contact us.</p>
    <p>Thank you for shopping with us!</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: email,                    // Recipient address
    subject: `Order Confirmation - ${order_id}`, // Email subject
    html: htmlContent,            // HTML body content
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error('Failed to send order confirmation email');
  }
}

module.exports = { sendOrderConfirmationEmail };

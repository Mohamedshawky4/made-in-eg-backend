const transporter = require('../../config/mailer');

const sendOrderCustomerEmail = async (order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title_ar} / ${item.title_en}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">EGP ${item.price}</td>
    </tr>
  `
    )
    .join('');

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: order.shippingAddress.email,
    subject: `Order Confirmation - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50; text-align: center;">تم تأكيد طلبك / Order Confirmed</h2>
        <p>Dear ${order.shippingAddress.fullName},</p>
        <p>Thank you for shopping with Made in Egypt! Your order has been received successfully.</p>
        <p>شكراً لتسوقك من Made in Egypt! تم استلام طلبك بنجاح.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Order ID:</strong> ${order.orderId}<br>
          <strong>Total:</strong> EGP ${order.total}<br>
          <strong>Payment Method:</strong> ${order.paymentMethod}<br>
          <strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #eee;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
          Made in Egypt Store
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Customer email sent for order ${order.orderId}`);
  } catch (error) {
    console.error('Customer Email sending failed', error);
  }
};

const sendOrderAdminEmail = async (order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 5px;">${item.title_en}</td>
      <td style="padding: 5px;">${item.quantity}</td>
      <td style="padding: 5px;">EGP ${item.price}</td>
    </tr>
  `
    )
    .join('');

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: `🚨 New Order Received: ${order.orderId}`,
    html: `
      <h2>New Order Alert!</h2>
      <p><strong>Customer:</strong> ${order.shippingAddress.fullName} (${order.shippingAddress.phone})</p>
      <p><strong>Total:</strong> EGP ${order.total}</p>
      
      <h3>Items:</h3>
      <table border="1" cellpadding="5" cellspacing="0">
        ${itemsHtml}
      </table>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin alert email sent for order ${order.orderId}`);
  } catch (error) {
    console.error('Admin Email sending failed', error);
  }
};

exports.sendOrderEmails = async (order) => {
  // Non-blocking email sending
  sendOrderCustomerEmail(order);
  sendOrderAdminEmail(order);
};

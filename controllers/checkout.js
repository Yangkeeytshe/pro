const db = require("../config/db");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

exports.postCheckout = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    user_id,
    first_name,
    last_name,
    business_name = null,
    delivery_address,
    mobile_number,
    card_name,
    card_number,
    expiry_date,
    cvv,
    order_items,
  } = req.body;

  // Get email from body or session
  const email = req.body.email || req.session?.user?.email;
  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }

  let items;
  if (typeof order_items === "string") {
    try {
      items = JSON.parse(order_items);
    } catch {
      return res.status(400).json({ error: "Invalid order_items format" });
    }
  } else if (Array.isArray(order_items)) {
    items = order_items;
  } else {
    return res.status(400).json({ error: "order_items must be an array" });
  }

  if (!items.length) {
    return res.status(400).json({ error: "No items in the order" });
  }

  const query = (sql, params) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

  try {
    await query("START TRANSACTION");

    let subtotal = 0;
    for (const item of items) {
      if (
        !item.product_price ||
        !item.quantity ||
        !item.product_id ||
        !item.product_name
      ) {
        await query("ROLLBACK");
        return res.status(400).json({ error: "Invalid order item details" });
      }
      subtotal += item.product_price * item.quantity;
    }

    const shipping_cost = 0;
    const gst = subtotal * 0.1;
    const total_amount = subtotal + gst;

    const orderResult = await query(
      `INSERT INTO orders 
      (user_id, first_name, last_name, business_name, delivery_address, mobile_number, card_name, card_number, expiry_date, cvv, subtotal, shipping_cost, gst, total_amount, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id,
        first_name,
        last_name,
        business_name,
        delivery_address,
        mobile_number,
        card_name,
        card_number,
        expiry_date,
        cvv,
        subtotal,
        shipping_cost,
        gst,
        total_amount,
      ]
    );

    const order_id = orderResult.insertId;

    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, product_price, total_price, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          order_id,
          item.product_id,
          item.product_name,
          item.quantity,
          item.product_price,
          item.product_price * item.quantity,
        ]
      );
    }

    await query("COMMIT");

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Order Confirmation",
      html: `
        <h2>Thank you for your purchase!</h2>
        <p>Your order <strong>#${order_id}</strong> has been received and is being processed.</p>
        <p>Total Amount: <strong>$${total_amount.toFixed(2)}</strong></p>
        <p>We'll notify you when your order is on its way.</p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(" Error sending confirmation email:", err);
      } else {
        console.log(" Order confirmation email sent:", info.response);
      }
    });

    // Redirect user to success page with order ID in query string
    return res.redirect(`/order/success?orderId=${order_id}`);

  } catch (error) {
    await query("ROLLBACK");
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

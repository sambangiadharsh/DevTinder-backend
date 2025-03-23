const { userAuth } = require("../middlewares/auth");
const express = require("express");
const payment = require("../models/payment");
const razorpayInstance = require("../utils/razorpay");
const { membershipAmount } = require("../utils/constants");
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");
const user = require("../models/user");
const nodemailer = require("nodemailer"); // Import Nodemailer

const paymentRouter = express.Router();

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Or SMTP if using another provider
  auth: {
    user: "sambangialex@gmail.com", // Your email
    pass: process.env.NODEMAILER_PASS, // App password (NOT your Gmail password)
  },
});

// Send Email Function
const sendEmailNotification = async (userEmail, plan) => {
  try {
    const mailOptions = {
      from: "sambangialex@gmail.com",
      to: userEmail,
      subject: "🎉 Premium Membership Activated!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f3f4f6; padding: 20px;">
          <div style="max-width: 600px; background: white; padding: 20px; border-radius: 10px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">✅ Payment Successful!</h2>
            <p>Dear valued user,</p>
            <p>Thank you for subscribing to our <strong>${plan}</strong> plan. You now have access to exclusive features.</p>
            <p>If you have any questions, feel free to contact us!</p>
            <hr />
            <p style="font-size: 12px; color: #888;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email notification sent successfully!");
  } catch (error) {
    console.error("❗️ Error sending email:", error.message);
  }
};

// 🛒 Create Payment Order
paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType],
      currency: "INR",
      receipt: "recepient$1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    const newPayment = new payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      status: order.status,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await newPayment.save();
    res.json({ savedPayment, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// 🔥 Webhook to Handle Payment Success
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).json({
        msg: "❗️ Webhook is not valid",
      });
    }

    const paymentDetails = req.body.payload.payment.entity;

    const pay = await payment.findOne({
      orderId: paymentDetails.order_id,
    });
    if (!pay) {
      return res.status(404).json({ msg: "❗️ Payment record not found!" });
    }

    pay.status = paymentDetails.status;
    await pay.save();

    const paymentUser = await user.findById(pay.userId);
    if (paymentDetails.status === "captured") {
      paymentUser.isPremium = true;
      paymentUser.membershipType = pay.notes.membershipType;

      // Set membership duration based on type (Gold or Silver)
      let membershipDays = 0;
      switch (pay.notes.membershipType.toLowerCase()) {
        case "gold":
          membershipDays = 180; // 6 months for Gold
          break;
        case "silver":
          membershipDays = 90; // 3 months for Silver
          break;
        default:
          membershipDays = 30; // Default to 1 month if type is not specified
          break;
      }
      paymentUser.membershipValidity = new Date(
        Date.now() + membershipDays * 24 * 60 * 60 * 1000
      );

      await paymentUser.save();

      // 📨 Send Email Notification after Successful Payment
      await sendEmailNotification(pay.notes.emailId, pay.notes.membershipType);
    }

    res.status(200).json({ msg: "✅ Webhook received successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✔️ Verify Premium Membership
paymentRouter.get("/payment/verify", userAuth, (req, res) => {
  const User = req.user;
  if (User.isPremium) {
    return res.json({ isPremium: true ,User});
  }
  return res.json({ isPremium: false,User });
});

module.exports = paymentRouter;

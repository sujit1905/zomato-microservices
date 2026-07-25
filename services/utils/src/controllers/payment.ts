import { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import Stripe from "stripe";
import { razorpay } from "../config/razorpay.js";
import { verifyRazorpaySignature } from "../config/verifyRazorpay.js";

// Load env vars first so all keys are available when modules are initialized
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order id is required" });
    }

    const { data } = await axios.get(
      `${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    const razorpayOrder = await razorpay.orders.create({
      amount: Number(data.amount) * 100,
      currency: "INR",
      receipt: orderId,
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Razorpay order creation failed", error?.response?.data || error?.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const isValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    return res.status(400).json({
      message: "Payment verification failed — invalid signature",
    });
  }

  // Directly notify the restaurant service to mark the order as paid
  // (bypasses RabbitMQ so it works in local dev without a message broker)
  await axios.post(
    `${process.env.RESTAURANT_SERVICE}/api/order/internal/mark-paid`,
    { orderId, paymentId: razorpay_payment_id, provider: "razorpay" },
    { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
  );

  res.json({ message: "Payment verified successfully" });
};

export const payWithStripe = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order id is required" });
    }

    const { data } = await axios.get(
      `${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Tomato food order",
            },
            unit_amount: Number(data.amount) * 100,
          },
          quantity: 1,
        },
      ],

      metadata: {
        orderId,
      },

      success_url: `${process.env.FRONTEND_URL}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    });

    res.json({
      url: session.url,
    });
  } catch (error: any) {
    console.error("Stripe session creation failed", error?.response?.data || error?.message);
    res.status(500).json({
      message: "stripe payment failed",
    });
  }
};

export const verifyStripe = async (req: Request, res: Response) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return res.status(400).json({ message: "orderId not found in stripe session" });
    }

    // Directly notify the restaurant service to mark the order as paid
    await axios.post(
      `${process.env.RESTAURANT_SERVICE}/api/order/internal/mark-paid`,
      { orderId, paymentId: sessionId, provider: "stripe" },
      { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
    );

    res.json({ message: "Payment verified successfully" });
  } catch (error: any) {
    console.error("Stripe verify error:", error?.response?.data || error?.message);
    res.status(500).json({ message: "Stripe payment verification failed" });
  }
};

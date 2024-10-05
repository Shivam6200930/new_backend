import mongoose from "mongoose";

// Address Schema
const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  locality: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  landmark: { type: String },
  alternatePhone: { type: String },
  addressType: { type: String, enum: ["Home", "Work"], default: "Home" },
});

// Product Schema for Embedded Documents in Cart and Order History
const productSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true }, // Used in Order History
});

// Order History Schema
const orderHistorySchema = new mongoose.Schema({
  userEmail: { type: String, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user"},
  products: [productSchema], // Use product schema
  paymentStatus: {
    type: String,
    enum: ["Success", "Failed"],
    // required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Razorpay", "Paypal", "Stripe", "Cash On Delivery"],
    default: "Razorpay",
  },
  orderDate: { type: Date, default: Date.now },
  deliveryStatus: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Order Created"],
    default: "Pending",
  },
  address: addressSchema, // Reuse address schema
});

// Cart Schema
const cartSchema = new mongoose.Schema({
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
});

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please use a valid email address",
      ],
    },
    password: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
        "Please enter a valid phone number",
      ],
    },
    profileImageUrl: { type: String },
     orderHistory: [orderHistorySchema], 
    cart: cartSchema,
    role: { type: String, required: true, default: "user" }, // Correct spelling
    loggedIn: { type: Boolean, default: false }, // Correct spelling
    address: addressSchema, // Reuse address schema for user's address
  },
  { timestamps: true }
);

// Product Schema
const productSchemaForModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

const user = mongoose.model("user", userSchema);
const Product = mongoose.model("Product", productSchemaForModel);

export { user, Product };

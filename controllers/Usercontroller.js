import { user, Product , productSchemaForModel ,Order} from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
import mongoose from 'mongoose'
class Usercontroller {
static UserRegistration = async (req, res) => {
    const { name, email, password, password_confirm, phone } = req.body;
    try {
      const User = await user.findOne({ email: email });
      if (User) {
        res.send({ status: "failed", message: "User already exists" });
      } else {
        if (name && email && password && password_confirm) {
          if (password === password_confirm) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const role = email === "mandalshivam962@gmail.com" ? "admin" : "user";
            const doc = new user({
              name: name,
              email: email,
              password: hashPassword,
              phone: phone,
              role,
            });
            await doc.save();
            const saved_user = await user.findOne({ email: email });
            console.log("user saved", saved_user);
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.jwt_secret_key,
              { expiresIn: "7d" }
            );
            res.cookie("shivam", token, {
              httpOnly: true,
              secure: true,
              maxAge: 1000 * 60 * 60 * 24 * 7,
              path: "/",
              sameSite: "none",
            });
  
            const mailOptions = {
              from: process.env.EMAILFROM,
              to: saved_user.email,
              subject: "Welcome to Shivam Mart!",
              html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                  <h1 style="color: #4CAF50;">Welcome to Shivam Mart, ${name}!</h1>
                  <p>We're thrilled to have you as a member of our community.</p>
                  <p>At Shivam Mart, we offer a wide range of products just for you. Explore our collections and enjoy exclusive deals.</p>
                  <p><strong>Your account details:</strong></p>
                  <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone:</strong> ${phone}</li>
                  </ul>
                  <p>To get started, simply <a href="https://front-mart-seven.vercel.app/login" style="color: #4CAF50;">log in to your account</a> and start shopping!</p>
                  <p>If you have any questions, feel free to <a href="https://front-mart-seven.vercel.app/" style="color: #4CAF50;">contact us</a>.</p>
                  <p>Best regards,<br/>The Shivam Mart Team</p>
                  <div style="margin-top: 20px;">
                    <a href="https://front-mart-seven.vercel.app/" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Shivam Mart</a>
                  </div>
                </div>
              `,
            };
            console.log("mailOption");
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });;
          }
        } else {
          res.send({ status: "failed", message: "All fields are required" });
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      res.status(400).json(err.errors);
    }
  };
  

  static UserLogin = async (req, res) => {
    const { email, password, loggedIn } = req.body;
    try {
      if (email && password) {
        const User = await user.findOne({ email: email });
        if (User != null) {
          const isMatch = await bcrypt.compare(password, User.password);
          if (User.email === email && isMatch) {
            const token = jwt.sign(
              { userID: User._id },
              process.env.jwt_secret_key,
              { expiresIn: "7d" }
            );
            res.cookie("shivam", token, {
              httpOnly: true,
              secure: true,
              maxAge: 1000 * 60 * 60 * 24 * 7,
              path: "/",
              sameSite: "none",
            });
            User.loggedExpire = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
            User.save();
            res
              .status(200)
              .json({ message: "Login Sucessfull", user: User, token: token });
          } else {
            res.status(400).json({ message: "Invalid email or password" });
          }
        } else {
          res.send({ status: "failed", message: "you didn't regesister" });
        }
      } else {
        res.send({ status: "failed", message: "all Field are requried" });
      }
    } catch (err) {
      res.status(400).json({ message: "something went wrong" });
      console.log(err);
    }
  };

  static changeUserpassword = async (req, res) => {
    const { password, password_confirm } = req.body;
    const foundUser = await user.findById(req.user._id);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (password && password_confirm) {
      if (password === password_confirm) {
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);
        await user.findByIdAndUpdate(req.user._id, {
          $set: { password: hashpassword },
        });

        const mailOptions = {
          from: process.env.EMAILFROM,
          to: foundUser.email,
          subject: "🔐 Your Shivam Mart Password Has Been Changed",
                    html: `
                      <div style="max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background: #f9f9f9; font-family: Arial, sans-serif; text-align: center; border: 1px solid #ddd;">
                          <h2 style="color: #333;">🔔 Password Change Alert</h2>
                          <p style="font-size: 16px; color: #555;">Dear <strong>${foundUser.name}</strong>,</p>
                          <p style="font-size: 16px; color: #555;">We wanted to let you know that your Shivam Mart account password has been successfully changed.</p>
                          <p style="font-size: 16px; color: #555;">If you made this change, you can safely ignore this email.</p>
                          
                          <div style="margin: 20px 0;">
                              <p style="font-size: 16px; color: #d9534f; font-weight: bold;">Didn’t request this change?</p>
                              <p style="font-size: 14px; color: #555;">If you did not request this password change, please secure your account immediately by resetting your password.</p>
                              <a href="${process.env.FRONTEND_URL}/forgetpassword" style="background-color: #ff4d4d; color: white; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">🔄 Reset Password</a>
                          </div>

                          <hr style="margin: 20px 0;">
                          <p style="font-size: 14px; color: #777;">If you need help, please contact our <a href="${process.env.FRONTEND_URL}/support" style="color: #007bff; text-decoration: none;">Support Team</a>.</p>
                          <p style="font-size: 14px; color: #777;">Thank you for using <strong>Shivam Mart</strong>! 🛍️</p>
                      </div>
                    `,
         };
        console.log("mailOption");
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        res.status(200).json({
          message: "password are changed",
          mail: "you sucesfully change your password",
        });
      } else {
        res
          .status(400)
          .json({ message: "password and re-enter aren't match " });
      }
    } else {
      res.status(400).json({ message: "all field are requried" });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static resetPassword = async (req, res) => {
    try {
      const { email } = req.body;

      if (email) {
        const User = await user.findOne({ email: email });

        if (User) {
          const secret = User._id + process.env.JWT_SECRET_KEY;
          const token = jwt.sign({ userID: User._id }, secret, {
            expiresIn: "10m",
          });

          const link = `${process.env.FRONTEND_URL}/api/users/resetPassword/${User._id}/${token}`;
          const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: User.email,
            subject: "🔒 Reset Your Password - Shivam Mart",
            html: `
            <div style="max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background: #f9f9f9; font-family: Arial, sans-serif; text-align: center; border: 1px solid #ddd;">
              <h2 style="color: #333;">🔐 Password Reset Request</h2>
              <p style="font-size: 16px; color: #555;">Hello <strong>${User.name}</strong>,</p>
              <p style="font-size: 16px; color: #555;">We received a request to reset your password for Shivam Mart.</p>
              <p style="font-size: 16px; color: #555;">Click the button below to reset your password:</p>
              <div style="margin: 20px 0;">
                <a href="${link}" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">🔄 Reset Password</a>
              </div>
              <p style="font-size: 14px; color: #777;">This link is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
              <hr style="margin: 20px 0;">
              <p style="font-size: 14px; color: #777;">Thank you for choosing <strong>Shivam Mart</strong>.</p>
            </div>
          `,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error);
              res.status(500).json({
                status: "failed",
                message: "Failed to send reset email",
              });
            } else {
              console.log("Email sent: " + info.response);
              res.status(203).json({
                status: "passed",
                message: "Email sent for your reset password",
              });
            }
          });
        } else {
          res
            .status(403)
            .json({ status: "failed", message: "Email doesn't exist" });
        }
      } else {
        res.status(403).json({ message: "Please enter your email address" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ status: "failed", message: "Internal server error" });
    }
  };

  static userPasswordReset = async (req, res) => {
    try {
      const { password, password_confirm } = req.body;
      const { id, token } = req.params;

      const User = await user.findById(id);
      if (!User) {
        return res
          .status(404)
          .json({ status: "failed", message: "User not found" });
      }

      const secret = User._id + process.env.JWT_SECRET_KEY;

      let decodedToken;
      try {
        decodedToken = jwt.verify(token, secret);
      } catch (err) {
        console.error("Token verification error:", err);
        return res
          .status(403)
          .json({ status: "failed", message: "your session is exprie." });
      }

      if (decodedToken.userID !== User._id.toString()) {
        return res
          .status(403)
          .json({ status: "failed", message: "Token does not match user" });
      }

      if (!password || !password_confirm) {
        return res.status(403).json({ message: "All fields are required" });
      }

      if (password !== password_confirm) {
        return res
          .status(403)
          .json({
            status: "failed",
            message: "Password and confirm password do not match",
          });
      }

      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(password, salt);

      await user.findByIdAndUpdate(User._id, {
        $set: { password: hashpassword },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: User.email,
        subject: "Password changed successfully!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; text-align: center;">
            <h2 style="color: #333;">Password Reset Confirmation</h2>
            <p style="font-size: 16px; color: #555;">Hello <strong>${User.name}</strong>,</p>
            <p style="font-size: 16px; color: #555;">Your password has been successfully changed.</p>
            <p style="font-size: 16px; color: #555;">If you did not request this change, please contact our support team immediately.</p>
            <div style="margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Visit ShivamMart</a>
            </div>
            <p style="font-size: 14px; color: #777;">Thank you for using ShivamMart.</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email send error:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.status(200).json({
        status: "passed",
        message: "Password changed successfully",
        mail: "Email sent successfully",
      });
    } catch (err) {
      console.error("Error in userPasswordReset:", err);
      res
        .status(500)
        .json({ status: "failed", message: "Internal server error" });
    }
  };

  static userDelete = async (req, res) => {
    const { id } = req.params;
    try {
      const deletedUser = await user.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      res
        .status(400)
        .json({ status: "failed", message: "User was not deleted" });
    }
  };
  static UserLogout = async (req, res) => {
    const { id } = req.params;
    try {
      const User = await user.findById(id);
      if (!User) {
        res.status(400).json({ message: "user not found" });
      } else {
        User.loggedIn = false;
        User.loggedExpire = Date.now();
        await User.save();
      }
      res.clearCookie("shivam");

      return res.status(200).json("logout");
    } catch (err) {
      return res.status(500).json(err.message);
    }
  };

  static UserEdit = async (req, res) => {
    const id = req.params.user_id;
    const User = await user.findById(id);
    const { user_name } = req.body;
    if (!User) {
      res.status(400).json({ message: "failed" });
    } else {
      User.name = user_name;
      User.save();
      res.status(200).json({ message: "saved", User });
    }
  };
  static addProduct = async (req, res) => {
    const { name, imageUrl, description, price, quantity,category,subcategory,specifications } = req.body;
    try {
      const doc = new Product({
        name: name,
        imageUrl: imageUrl,
        description: description,
        price: price,
        quantity: quantity,
        category,
        subcategory,
        specifications
      });

      await doc.save();
      res.status(200).json({ message: "saved" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  static search = async (req, res) => {
    try {
      const searchTerm = req.query.q;

      if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
      }

      const results = await Product.find({
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      });
      res.status(200).json({ message: "sucessul", data: results });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static findAllProduct = async (req, res) => {
    try {
      const products = await Product.find(); // Assuming ProductModel is your Mongoose model
      res.status(200).json({ products }); // Return products as an array
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  static contact = async (req, res) => {
    const { feedback, email } = req.body;
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Feedback from website",
        text: feedback,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: "Error sending email" });
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).json({ message: "Email sent successfully" });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static order_history = async (req, res) => {
    try {
      const id = req.params.userId;
      const buyProducts = req.body.products_details;
      const orderId =req.body.orderId;
      // Find user by ID
      const User = await user.findById(id);
  
      if (!User) {
        return res.status(404).json({
          status: "Not Found",
          message: "User not found in our database",
        });
      }
  
      // Validate and append the order history
      const orderData = buyProducts.map((product) => ({
        _id: orderId || new mongoose.Types.ObjectId(),
        name: product.name,
        imageUrl: product.imageUrl,
        description: product.description,
         price: product.price,
         quantity:product.quantity,
        paymentStatus: product.paymentStatus || "Success",
        paymentMethod: product.paymentMethod || "Razorpay",
        orderDate: product.orderDate || new Date(),
        deliveryStatus: product.deliveryStatus || "Order Created",
        pincode: product.address.pincode,
        village:product.address.address,
        district:product.address.city,
        state:product.address.state,
        state:product.address.locality,
        user_name:product.address.name,
        user_phoneNumber:product.address.phone

      }));
  
      User.orderHistory.push(...orderData);
  
      // Save the updated user
      await User.save();
  
      return res.status(200).json({
        status: "Success",
        message: "Order history updated successfully",
      });
    } catch (error) {
      console.error("Error updating order history:", error.message);
      return res.status(500).json({
        status: "Error",
        message: "An error occurred while updating order history",
      });
    }
  };
  
  static userPhotoDelete = async (req, res) => {
    const id = req.params.id;
    console.log(`Received request to delete photo for user with id: ${id}`);

    try {
      const User = await user.findById(id);

      if (User) {
        console.log(`User found: ${User}`);
        User.profileImageUrl = "";
        await User.save();
        res
          .status(200)
          .json({ status: "success", message: "Image deleted successfully" });
      } else {
        console.log(`User not found with id: ${id}`);
        res.status(404).json({ status: "error", message: "User not found" });
      }
    } catch (error) {
      console.error(`Error occurred: ${error.message}`);
      res.status(500).json({ status: "error", message: error.message });
    }
  };
 
  static addresses = async (req, res) => {
    const userId = req.params.id;
    const address = req.body.address;

    if (!address) {
        return res.status(400).json({ status: "error", message: "Address is required" });
    }

    try {
        const User = await user.findById(userId);

        if (!User) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // Ensure User.address is initialized
        if (!User.address) {
            User.address = { moreaddress: [] }; // Initialize if undefined
        }

        // Ensure moreaddress array exists
        if (!Array.isArray(User.address.moreaddress)) {
            User.address.moreaddress = [];
        }

        User.address.moreaddress.push(address);
        await User.save();

        return res.status(200).json({ status: "success", message: "Address added successfully" });
    } catch (error) {
        console.error("Error updating address:", error);
        return res.status(500).json({ status: "error", message: "Something went wrong" });
    }
};

  
  static getProductCategories = async(req,res)=>{
    try {
      const category = req.params.mobile;
      console.log('categore:',category)
      const products = await Product.find({ category });
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
  static DeleteProduct = async(req,res)=>{
    try {
      const {productId } = req.params;
      const deletedProduct = await Product.findByIdAndDelete(productId );
      if (deletedProduct) {
        res.json({ message: 'Product deleted', product: deletedProduct });
      } else {
        res.status(404).send('Product not found');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
  static getProductsByIds = async (req, res) => {
    try {
      const { productIds } = req.body; // Expect an array from frontend
  
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          status: "Failure",
          message: "Invalid or empty product IDs array",
        });
      }
  
      // Fetch products that match any of the given IDs
      const products = await Product.find({ _id: { $in: productIds } });
  
      if (!products.length) {
        return res.status(404).json({
          status: "Failure",
          message: "No products found for the given IDs",
        });
      }
  
      res.status(200).json({
        status: "Success",
        message: "Products fetched successfully",
        products, // Now returns an array of products
      });
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      res.status(500).json({
        status: "Failure",
        message: "Error occurred while fetching products",
        error: error.message,
      });
    }
  };
  

  static getAllCategories = async (req, res) => {
    try {
      // Access the enum values directly from the schema definition
      const subcategories = productSchemaForModel.path("subcategory").enumValues;
      const categories =productSchemaForModel.path("category").enumValues
      
  
      res.status(200).json({
        success: true,
        cat:subcategories, 
        c_cat:categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve categories",
        error: error.message,
      });
    }
  };

  static getCatProducts=async(req,res)=>{
    try {
      const { category_get } = req.params;
      console.log(`category_get:${category_get}`)
      
      // Retrieve products based on category
      const products = await Product.find({ subcategory:category_get });
      
      // If no products are found for the category
      if (!products || products.length === 0) {
        return res.status(404).json({ message: 'No products found for this category' });
      }
  
      // Return the products in an array
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
  

  static productUpdate = async (req, res) => {
    try {
      const { _id, ...updateData } = req.body;
      const updatedProduct = await Product.findByIdAndUpdate(_id, updateData, { new: true });
  
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
};


static productfetchDetails =async(req,res)=>{
  try {
    const { productId } = req.params; // Extract productId as a string

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
}

 static newOrder = async(req,res)=>{
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({status:"Successfuly",newOrder});
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error });
  }
 }

 static async fetchAllOrder(req, res) {
  try {
    const orders = await Order.find().populate("user").populate("products.productId");
    res.status(200).json({ status: "Successfully", orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
}
  
static updatedOrder = async (req, res) => {
  const { orderId, userId } = req.params;
  const { deliveryStatus } = req.body;
  try {
   if(!deliveryStatus){
    return res.status(400).json({status:"failed from frontend",message:"deliveryStatus are not come from frontend "})
   }

    // Find user by userId
    const User = await user.findById(userId);
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }
    const OrdersId = await Order.findById(orderId)
    if(!OrdersId){
      return res.status(404).JSON({status:"failed",message:"order are not found"})
    }

    // Find the specific order in user's order history
    const orderIndex = User.orderHistory.findIndex(order => order._id.toString() === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ message: "Order not found in user's order history" });
    }

    // Update the delivery status of the found order
    User.orderHistory[orderIndex].deliveryStatus = deliveryStatus;
    OrdersId.deliveryStatus=deliveryStatus

    // Save the updated user document
    await OrdersId.save();
    await User.save();

    res.status(200).json({ 
      status: "Successfully updated", 
      updatedOrder: User.orderHistory[orderIndex] 
    });

  } catch (error) {
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};

}


export default Usercontroller;

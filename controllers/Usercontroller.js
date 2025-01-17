import { user, Product } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
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
            if (User.loggedExpire != Date.now()) {
              User.loggedIn = true;
            } else {
              User.loggedIn = false;
            }

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
          subject: "Password changed",
          text: "You sucessful change your password if you have not changed your password then you info our contact detailas",
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

          const link = `${process.env.frontend_url}/api/users/resetPassword/${User._id}/${token}`;
          const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: User.email,
            subject: "Shivam Mart Password Reset Link",
            text: "This mail is only for a password reset",
            html: `<a href=${link}>Click Here</a> to reset your password`,
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
        text: "You have changed your password successfully!!",
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
    const { user_name, user_phone } = req.body;
    if (!User) {
      res.status(400).json({ message: "failed" });
    } else {
      User.name = user_name;
      User.phone = user_phone;
      User.save();
      res.status(200).json({ message: "saved", User });
    }
  };
  static product = async (req, res) => {
    const { name, imageUrl, description, price, quantity } = req.body;
    try {
      const doc = new Product({
        name: name,
        imageUrl: imageUrl,
        description: description,
        price: price,
        quantity: quantity,
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

  static products = async (res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
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
      console.log(`order_history ${JSON.stringify(buyProducts)}`);

      const User = await user.findById(id);

      if (!User) {
        return res.status(404).json({
          status: "Not Found",
          message: "User not found in our database",
        });
      }
      User.orderHistory = [...User.orderHistory, ...buyProducts];

      await User.save();

      return res.status(200).json({
        status: "Success",
        message: "Order history updated successfully",
      });
    } catch (error) {
      console.error("Error updating order history:", error);
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
  
      User.address.moreaddress.push(address);
      await User.save();
  
      return res.status(200).json({ status: "success", message: "Address added successfully" });
    } catch (error) {
      console.error("Error updating address:", error);
      return res.status(500).json({ status: "error", message: "Something went wrong" });
    }
  };
  static getProduct = async(req,res)=>{
    try {
      const products = await Product.find();
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
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
      const id = req.params.id;
      const deletedProduct = await Product.findByIdAndDelete(id);
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
}

export default Usercontroller;

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendMail = require("../controllers/mailer");
module.exports = {

    sendEmail: async (req, res) => {
        const { email, subject, message } = req.body;
      
        try {
          await sendMail(email, subject, message);
          res.json({ success: true, message: "Email sent successfully" });
        } catch (err) {
          res.status(500).json({ success: false, error: err.message });
        }
      },
    updateWallet: async (req , res)=> {
        try {
          const { amount } = req.body; // amount to add (can be negative if subtracting)
      
          if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: "Invalid amount" });
          }
      
          // Safe increment using $inc
          const user = await User.findById(req.User.id);

          user.wallet = wallet + amount;

          await user.save();
      
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
      
          res.json({ message: "Wallet updated successfully", wallet: user.wallet });
        } catch (error) {
          res.status(500).json({ error: "Server error", message: error.message });
        }
      },

    getUser: async (req, res) => {
        try {
            const user = await User.findById(req.User.id)

            const { password, __v, createdAt, ...userData } = user._doc;

            res.status(200).json(userData);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    verifyAccount: async (req, res) => {
        const userOtp = req.params.otp;

        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(400).json({ status: false, message: "User not found" });
            }

            if (userOtp === user.otp) {
                user.verification = true;
                user.otp = "none";

                await user.save();

                const userToken = jwt.sign({
                    id: user._id,
                    userType: user.userType,
                    email: user.email,
                }, process.env.JWT_SECRET, { expiresIn: "21d" });

                const { password, __v, otp, createdAt, ...others } = user._doc;
                res.status(200).json({ ...others, userToken });
            } else {
                return res.status(400).json({ status: false, message: "Otp verification failed" });
            }
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    verifyPhone: async (req, res) => {
        const phone = req.params.phone;

        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(400).json({ status: false, message: "User not found" });
            }

            user.phoneVerification = true;
            user.phone = phone;

            await user.save();

            const userToken = jwt.sign({
                id: user._id,
                userType: user.userType,
                email: user.email,
            }, process.env.JWT_SECRET, { expiresIn: "21d" });

            const { password, __v, otp, createdAt, ...others } = user._doc;
            res.status(200).json({ ...others, userToken });

        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    deleteUser: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.User.id)

            res.status(200).json({ status: true, message: "User successfully deleted" });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
}
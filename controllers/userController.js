const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/smtp_function');
const Food = require('../models/Food');
module.exports = {

    sendEmail: async (req, res) => {
        const { email, subject, message } = req.body;
        try {
        sendMail(email, '000000' , subject , `<h1>Foodly Order Confirmation</h1>
        <p>Your order has been placed successfully</p>
        <h2 style="color: blue">${message}</h2>`);
        res.status(201).json({ status: true, message: "Order Confirmation sent successfully " });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
      },
    updateWallet: async (req , res)=> {
        try {
          const { amount } = req.body; // amount to add (can be negative if subtracting)
      
          if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: "Invalid amount" });
          }
      
          // Safe increment using $inc
          const user = await User.findById(req.user.id);

          user.wallet = user.wallet + amount;

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
            const user = await User.findById(req.user.id)

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
    updateFcm: async (req, res) => {
        try {
          const { id } = req.params;
          const { fcm } = req.body;
      
          if (!fcm || typeof fcm !== "string") {
            return res.status(400).json({ error: "Valid FCM token is required" });
          }
      
          const updatedUser = await User.findByIdAndUpdate(
            id,
            { fcm },
            { new: true }
          ).select("-password -otp"); // hide sensitive data
      
          if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
          }
      
          return res.status(200).json({
            success: true,
            message: "FCM token updated successfully",
            user: updatedUser,
          });
        } catch (error) {
          console.error("Error updating FCM token:", error);
          return res.status(500).json({ error: "Internal server error" });
        }
      },
      addFavorites: async (req, res) => {
        try {
          const { userId } = req.params;
          const { foodId } = req.body;
      
          const user = await User.findById(userId);
          if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      
          if (!user.favorites.includes(foodId)) {
            user.favorites.push(foodId);
            await user.save();
          }
      
          res.status(200).json({ success: true, favorites: user.favorites });
        } catch (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'Internal server error' });
        }
      },
      getFavorites: async (req, res) => {
        try {
          const { userId } = req.params;
      
          const user = await User.findById(userId).populate('favorites', 'title price imageUrl');
          if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      
          res.status(200).json({ success: true, favorites: user.favorites });
        } catch (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'Internal server error' });
        }
      },
      removeFavorites: async (req, res) => {
        try {
          const { userId, foodId } = req.params;
      
          const user = await User.findById(userId);
          if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      
          user.favorites = user.favorites.filter(f => f.toString() !== foodId);
          await user.save();
      
          res.status(200).json({ success: true, favorites: user.favorites });
        } catch (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'Internal server error' });
        }
      }

}
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const admin = require('firebase-admin'); // Firebase Admin SDK
module.exports = {
    
    getAllRestaurant: async (req, res) => {
        try {
          const { verification } = req.query;
      
          let filter = {};
          if (verification) {
            filter.verification = verification; // e.g., "Verified", "Pending", "Rejected"
          }
      
          const restaurants = await Restaurant.find(filter);
          res.status(200).json(restaurants);
      
        } catch (error) {
          console.error("Error fetching restaurants:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      },
     changeRestaurantStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { verification, message } = req.body;
          
            // Ensure verification value is valid
            if (!["Verified", "Rejected"].includes(verification)) {
              return res.status(400).json({ error: "Invalid verification status" });
            }
          
            const updatedRestaurant = await Restaurant.findByIdAndUpdate(
              id,
              {
                verification,
                verificationMessage:
                  message ||
                  (verification === "Verified"
                    ? "Your restaurant has been successfully verified."
                    : "Your restaurant has been rejected. Please review the requirements and try again."),
              },
              { new: true }
            );
          
            if (!updatedRestaurant) {
              return res.status(404).json({ error: "Restaurant not found" });
            }
          
            // 🔔 Fetch the owner user to send notification
            const owner = await User.findById(updatedRestaurant.owner);
            if (owner && owner.fcm && owner.fcm !== "none") {
              const notification = {
                token: owner.fcm,
                notification: {
                  title: "Restaurant Verification Update",
                  body: updatedRestaurant.verificationMessage,
                },
                data: {
                  restaurantId: updatedRestaurant._id.toString(),
                  status: verification,
                },
              };
          
              admin
                .messaging()
                .send(notification)
                .then(() => console.log("✅ Notification sent to restaurant owner"))
                .catch((err) =>
                  console.error("❌ Failed to send notification:", err.message)
                );
            }
          
            return res.status(200).json(updatedRestaurant);
          } catch (error) {
            console.error("Error updating restaurant verification:", error);
            return res.status(500).json({ error: "Internal server error" });
          }
      },
      getAllUsers: async (req, res) => {
        try {
          const { userType } = req.query;
      
          let filter = {};
          if (userType) {
            filter.userType = userType; // e.g., "Client" or "Driver"
          }
      
          const users = await User.find(filter).select("-password -otp"); // hide sensitive fields
          res.status(200).json(users);
        } catch (error) {
          console.error("Error fetching users:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      },
      chnageDriverStatus: async (req, res) => {
        try {
          const { id } = req.params;
          const { accept, message } = req.body;
      
          if (typeof accept !== "boolean") {
            return res.status(400).json({ error: "accept must be true or false" });
          }
      
          const driver = await User.findById(id);
          if (!driver) {
            return res.status(404).json({ error: "Driver not found" });
          }
      
          driver.driverAccepted = accept;
          driver.verification = accept;
          driver.driverVerificationMessage =
            message ||
            (accept
              ? "Your driver account has been successfully verified."
              : "Your driver account has been rejected. Please review the requirements and try again.");
      
          await driver.save();
      
          // 🔔 Prepare notification
          if (driver.fcm && driver.fcm !== "none") {
            const notification = {
              token: driver.fcm,
              notification: {
                title: "Verification Alert",
                body: driver.driverVerificationMessage,
              },
              data: {
                status: accept ? "accepted" : "rejected",
              },
            };
      
            admin
              .messaging()
              .send(notification)
              .then(() => console.log("✅ Notification sent to Driver"))
              .catch((err) =>
                console.error("❌ Failed to send notification:", err.message)
              );
          }
      
          // ✅ Send API response
          return res.status(200).json({
            success: true,
            message: "Driver verification updated successfully",
            driver,
          });
        } catch (error) {
          console.error("Error verifying driver:", error);
          return res.status(500).json({ error: "Internal server error" });
        }
    }
};
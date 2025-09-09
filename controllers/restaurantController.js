const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

module.exports = {

    addRestaurant: async (req, res) => {
        const owner = req.user.id;
        const { title, time, imageUrl, code, logoUrl, coords } = req.body;


        // check if required fields are not empty
        if (!title || !time || !imageUrl || !logoUrl || !code || !coords || !coords.latitude || !coords.longitude || !coords.address || !coords.title) {
            return res.status(400).json({ status: false, message: "You have a missing field" });
        }

        // check if the restaurant code alreadt exists
        const existingRestaurant = await Restaurant.findOne({ owner: owner });
        if (existingRestaurant) {
            return res.status(400).json({ status: false, message: "Restaurant with this code alreadt exists", data: existingRestaurant });

        }
        const newRestaurant = new Restaurant(req.body);
        try {
            await newRestaurant.save();
            await User.findByIdAndUpdate(
                owner,
                { userType: "Vendor" },
                { new: true, runValidators: true }
            );


            res.status(201).json({ status: true, message: " Restaurant has been successfully" });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getMyRestaurant: async (req, res) => {
        const ownerId = req.user.id;
    
        try {
            const restaurant = await Restaurant.findOne({ owner: ownerId });
    
            if (!restaurant) {
                return res.status(404).json({ status: false, message: "No restaurant found for this user." });
            }
    
            res.status(200).json({ status: true, data: restaurant });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getRestaurantById: async (req, res) => {
        const id = req.params.id;
        try {
            const restaurant = await Restaurant.findById(id);

            res.status(200).json(restaurant);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getAllNearByRestaurants: async (req, res) => {
        const code = req.params.code;
        try {
            // ✅ Always return all available restaurants
            const allNearByRestaurants = await Restaurant.aggregate([
              { $match: { isAvailable: true } },
              { $project: { __v: 0 } }
            ]);
          
            res.status(200).json(allNearByRestaurants);
          
          } catch (error) {
            res.status(500).json({ status: false, message: error.message });
          }
    },
    getRandomRestaurants: async (req, res) => {
        const code = req.params.code;
        try {
            let randomRestaurant = [];

            if (code) {
                randomRestaurant = await Restaurant.aggregate([
                    { $match: { code: code, isAvailable: true } },
                    { $sample: { size: 5 } },
                    { $project: { __v: 0 } }
                ]);
            }

            if (randomRestaurant.length == 0) {
                randomRestaurant = await Restaurant.aggregate([
                    { $match: { isAvailable: true } },
                    { $sample: { size: 5 } },
                    { $project: { __v: 0 } }
                ]);
            }

            res.status(200).json(randomRestaurant);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    updateRating: async (req, res) => {
        try {
          const { restaurantId } = req.params;
          const { userRating } = req.body; // rating from user (1-5)
      
          if (!userRating || userRating < 1 || userRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
          }
      
          const restaurant = await Restaurant.findById(restaurantId);
          if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
          }
      
          // calculate new rating
          const totalRating = (restaurant.rating * restaurant.ratingCount) + userRating;
          const newRatingCount = restaurant.ratingCount + 1;
          const newRating = totalRating / newRatingCount;
      
          // update restaurant
          restaurant.rating = newRating;
          restaurant.ratingCount = newRatingCount;
          await restaurant.save();
      
          res.json({
            message: "Rating updated successfully",
            rating: restaurant.rating.toFixed(2),
            ratingCount: restaurant.ratingCount,
          });
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
    }
}
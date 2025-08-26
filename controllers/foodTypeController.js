const FoodType = require('../models/foodType');

module.exports = {
    createFoodType: async (req, res) => {
        const newFoodType = new FoodType(req.body);
        try {
            await newFoodType.save();
            res.status(201).json({ status: true, message: "Food Type created successfully" });
        }
        catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getAllFoodtypes: async (req, res) => {
        try {
            const types = await FoodType.find({ title: { $ne: "More" } }, { __v: 0 });
            res.status(200).json(types);
        }
        catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
};
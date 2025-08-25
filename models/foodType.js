const mongoose = require('mongoose');

const FoodTypeSchema = new mongoose.Schema({
    title: { type: String, required: true },
});

module.exports = mongoose.model('foodType', FoodTypeSchema);
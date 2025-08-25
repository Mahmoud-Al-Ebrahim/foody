const router = require('express').Router();
const foodTypeController = require('../controllers/foodTypeController');

router.post("/", foodTypeController.createFoodType);

router.get("/", foodTypeController.getAllFoodtypes);


module.exports = router;
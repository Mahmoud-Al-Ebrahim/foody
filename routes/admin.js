const router = require('express').Router();
const adminController = require('../controllers/adminController');


router.get("/", adminController.getAllRestaurant);
router.put('/:id/verify',adminController.changeRestaurantStatus);
router.get("/all-users", adminController.getAllUsers);
router.put('/:id/verify-driver',adminController.chnageDriverStatus);
module.exports = router;
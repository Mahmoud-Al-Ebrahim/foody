const router = require('express').Router();
const adminController = require('../controllers/adminController');


router.get("/restaurants", adminController.getAllRestaurant);
router.put('/:id/verify',adminController.changeRestaurantStatus);
router.get("/all-users", adminController.getAllUsers);
router.get("/all-orders", adminController.getAllOrders);
router.put('/:id/verify-driver',adminController.chnageDriverStatus);
module.exports = router;
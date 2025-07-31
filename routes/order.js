const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');

router.post("/", verifyTokenAndAuthorization, orderController.placeOrder);

router.get("/myOrders", verifyTokenAndAuthorization, orderController.getUserOrders);

router.get("/:id", verifyTokenAndAuthorization, orderController.getOrderDetails);

router.post("/rest-orders/:id/:status", verifyTokenAndAuthorization, orderController.getRestaurantOrder);

router.post("/update/:id", verifyTokenAndAuthorization, orderController.updateOrderStatus);

module.exports = router;
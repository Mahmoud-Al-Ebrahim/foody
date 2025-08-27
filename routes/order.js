const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');

router.put("/:orderId/assign", verifyTokenAndAuthorization, orderController.assignOrderToDriver);

router.post("/notify-drivers", orderController.notifyAllDrivers);

router.post("/", verifyTokenAndAuthorization, orderController.placeOrder);

router.get("/myOrders", verifyTokenAndAuthorization, orderController.getUserOrders);

router.get("/:id", verifyTokenAndAuthorization, orderController.getOrderDetails);

router.post("/driver-orders", verifyTokenAndAuthorization, orderController.getRestaurantOrder);

router.post("/rest-orders/:id", verifyTokenAndAuthorization, orderController.getRestaurantOrder);

router.post("/update/:id", verifyTokenAndAuthorization, orderController.updateOrderStatus);

module.exports = router;
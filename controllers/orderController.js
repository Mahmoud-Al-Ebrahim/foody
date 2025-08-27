const Order = require("../models/Order");
const User = require("../models/User");
const admin = require('firebase-admin'); // Firebase Admin SDK
module.exports = {
    placeOrder: async (req, res) => {
        const newOrder = new Order({
            ...req.body,
            userId: req.user.id
        });
        try {
            await newOrder.save();

            const orderId = newOrder._id
            res.status(200).json({ status: true, message: "Order placed successfully", });
        } catch (error) {
            res.status(500).json({ status: true, message: error.message })
        }
    },
    assignOrderToDriver : async (req, res) => {
        const { orderId } = req.params;
        const driverId = req.user.id;
    
        try {
            // Check driver exists
            const driver = await User.findOne({ _id: driverId, userType: 'Driver' });
            if (!driver) {
                return res.status(404).json({ success: false, message: 'Driver not found' });
            }
    
            // Find the order first
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
    
            // Reject if already assigned to a different driver
            if (order.driverId && order.driverId.toString() !== driverId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order is already assigned to another driver'
                });
            }
    
            // If not assigned yet, assign driver
            order.driverId = driverId;
            order.orderStatus = 'Approved';
            await order.save();
    
    
            res.status(200).json({
                success: true,
                message: 'Order assigned successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to assign order',
                error: error.message
            });
        }
    },

    notifyAllDrivers : async (req, res) => {
        try {
            // Get all drivers with a token
            const drivers = await User.find({ userType: 'Driver', fcm: { $exists: true, $ne: null } });
    
            if (!drivers.length) {
                return res.status(404).json({ success: false, message: 'No drivers found with tokens' });
            }
    
            const title = 'New Order Available';
            const body = 'A new order is waiting for assignment.';
    
            // Save notification for each driver
            const notifications = await Promise.all(
                drivers.map(d => {
                    const notif = new Notification({
                        userId: d._id,
                        title,
                        body,
                        data: { type: 'NEW_ORDER' }
                    });
                    return notif.save();
                })
            );
    
            // Collect tokens
            const tokens = drivers.map(d => d.fcm);
    
            // Send to all drivers via FCM
            const message = {
                notification: { title, body },
                tokens
            };
            const response = await admin.messaging().sendMulticast(message);
    
            res.status(200).json({
                success: true,
                message: `Notification sent to ${response.successCount} drivers, failed: ${response.failureCount}`,
                saved: notifications.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to notify drivers',
                error: error.message
            });
        }
    },

    getUserOrders: async (req, res) => {
        const userId = req.user.id; // assumes you are using a verified token middleware
        const { paymentStatus, orderStatus } = req.query;
    
        const query = { userId };
    
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }
    
        if (orderStatus) {
            query.orderStatus = orderStatus;
        }
    
        try {
            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .populate({
                    path: 'orderItems.foodId',
                    select: 'title imageUrl rating time'
                })
                .populate({
                    path: 'deliveryAddress',
                    select: 'addressLine1 coords city street'
                });
    
            res.status(200).json({ success: true, orders });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve orders',
                error: error.message
            });
        }
    },
    getRestaurantOrder: async (req, res) => {
        const id = req.params.id;
        const status = req.query.status;

        // if (req.query.status == 'Placed') {
        //     status = 'Placed';
        // } else if (req.query.status == 'Preparing') {
        //     status = 'Preparing';
        // } else if (req.query.status == 'Ready') {
        //     status = 'Ready';
        // } else if (req.query.status == 'Out_for_Delivery') {
        //     status = 'Out_for_Delivery';
        // } else if (req.query.status == 'Delivered') {
        //     status = 'Delivered';
        // } else if (req.query.status == 'Manual') {
        //     status = 'Manual';
        // } else if (req.query.status == 'Cancelled') {
        //     status = 'Cancelled';
        // }


        try {

            const orders = await Order.find({ orderStatus: status , paymentStatus: 'Completed', restaurantId: id })
                .select('userId deliveryAddress orderItems deliveryFee instructions restaurantName restaurantImage restaurantAddress restaurantCoords recipientCoords orderStatus orderTotal createdAt')
                .populate({
                    path: 'userId',
                    select: 'phone profile'
                }).populate({
                    path: 'orderItems.foodId',
                    select: "title imageUrl time rating"
                }).populate({
                    path: 'deliveryAddress',
                    select: "addressLine1"
                })

            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getDriverOrders: async (req, res) => {
        const id = req.user.id;
        const status = req.query.status;
        
        try {
            let query = { orderStatus: status, paymentStatus: 'Completed' };
        
            // If not Ready, filter by driverId too
            if (status !== 'Ready') {
                query.driverId = id;
            }
        
            const orders = await Order.find(query)
                .select('userId deliveryAddress orderItems deliveryFee instructions restaurantName restaurantImage restaurantAddress restaurantCoords recipientCoords orderStatus orderTotal createdAt')
                .populate({
                    path: 'userId',
                    select: 'phone profile'
                })
                .populate({
                    path: 'orderItems.foodId',
                    select: "title imageUrl time rating"
                })
                .populate({
                    path: 'deliveryAddress',
                    select: "addressLine1"
                });
        
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
        
    },
    updateOrderStatus: async (req, res) => {
        const orderId = req.params.id;
        const orderStatus = req.query.status;

        try {

            const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: orderStatus }, { new: true });

            if (updatedOrder) {
                res.status(200).json({ status: true, message: "Order updated successfully" });
            } else {
                res.status(400).json({ status: false, message: "Order not found" });
            }

        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getOrderDetails: async (req, res) => {
        const orderId = req.params.id;

        try {

            const orders = await Order.findById(orderId)
                .select('userId deliveryAddress orderItems deliveryFee restaurantId restaurantCoords recipientCoords orderStatus')
                .populate({
                    path: 'userId',
                    select: 'phone profile'
                }).populate({
                    path: "restaurantId",
                    select: "title coords imageUrl logoUrl time"
                }).populate({
                    path: 'orderItems.foodId',
                    select: "title imageUrl time"
                }).populate({
                    path: 'deliveryAddress',
                    select: "addressLine1"
                })

            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
}
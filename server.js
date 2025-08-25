const express = require('express')
const app = express()
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const CategoryRoute = require("./routes/category");
const RestaurantRoute = require("./routes/restaurant");
const FoodRoute = require("./routes/food");
const RatingRoute = require("./routes/rating");
// const sendEmail = require('./utils/smtp_function');
// const generateOtp = require('./utils/otp_generator');
const AuthRoute = require('./routes/auth');
const UserRoute = require('./routes/user');
const AddressRoute = require('./routes/address');
const CartRoute = require('./routes/cart');
const OrderRoute = require('./routes/order');
const FoodTypesRoute = require('./routes/foodType');

dotenv.config();

mongoose.connect(process.env.MONGOURL)
    .then(() => console.log("Foodly Database Connected"))
    .catch((err) => console.log(err));

// const otp = generateOtp();
// console.log(otp);
// sendEmail('h.23.2025.h@gmail.com', otp)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/category", CategoryRoute);
app.use("/api/restaurant", RestaurantRoute);
app.use("/api/foods", FoodRoute);
app.use("/api/rating", RatingRoute);
app.use("/api/address", AddressRoute);
app.use("/api/cart", CartRoute);
app.use("/api/orders", OrderRoute);
app.use("/api/foodTypes", FoodTypesRoute);

app.listen(process.env.PORT || 6013, () => console.log(`Foodly Backend is running on ${process.env.PORT}`))
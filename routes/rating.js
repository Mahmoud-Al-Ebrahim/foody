const router = require('express').Router();
const ratingController = require('../controllers/RatingController');
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');

router.post("/", verifyTokenAndAuthorization, ratingController.addRating);

router.get("/", verifyTokenAndAuthorization, ratingController.CheckUserrating);

module.exports = router;
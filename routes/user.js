const router = require('express').Router();
const userController = require('../controllers/userController');
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');

router.post("/send-email" , userController.sendEmail);

router.put("/wallet" , verifyTokenAndAuthorization , userController.updateWallet);

router.put('/:id/fcm',verifyTokenAndAuthorization , userController.updateFcm);

router.get("/", verifyTokenAndAuthorization, userController.getUser);

router.delete("/", verifyTokenAndAuthorization, userController.deleteUser);

router.get("/verify/:otp", verifyTokenAndAuthorization, userController.verifyAccount);

router.get("/verify_phone/:phone", verifyTokenAndAuthorization, userController.verifyPhone);

router.post('/:userId/favorites/:foodId' , verifyTokenAndAuthorization, userController.addFavorites);
router.delete('/:userId/favorites/:foodId',verifyTokenAndAuthorization, userController.removeFavorites);
router.get('/:userId/favorites',verifyTokenAndAuthorization, userController.removeFavorites);

module.exports = router;
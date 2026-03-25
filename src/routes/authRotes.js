const express = require('express')

const AuthController = require('../controller/authController')

const router = express.Router();

router.post('/login', AuthController.loginController);
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;

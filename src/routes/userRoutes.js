const express = require('express')

const UserController = require('../controller/userController')

const router = express.Router()


router.get('/user', UserController.getUser)


module.exports = router;    
const express = require('express')

const VaultDataTestController = require('../controller/vaultDataTestController')

const router = express.Router()


router.post('/datatest', VaultDataTestController.createSecureRecord)
router.get('/getdatatest/:id', VaultDataTestController.getSecureRecordById)

module.exports = router;    
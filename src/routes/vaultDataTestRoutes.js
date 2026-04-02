const express = require('express')
const multer = require('multer');

const VaultDataTestController = require('../controller/vaultDataTestController')
const router = express.Router()

const upload = multer({ dest: 'storage/temp_uploads/' });

router.post('/datatest', VaultDataTestController.createSecureRecord)
router.get('/getdatatest/:id', VaultDataTestController.getSecureRecordById)
router.post('/test-encrypt-word', upload.single('document'), VaultDataTestController.encryptAndDownload);module.exports = router;    
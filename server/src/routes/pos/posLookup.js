const express = require('express');
const router = express.Router();
const posLookupController = require('../../controllers/pos/posLookupController');

router.get('/barcode/:barcode', posLookupController.lookupBarcode);
router.get('/sku/:sku', posLookupController.lookupSku);
router.get('/wadn/:wadn', posLookupController.lookupWadn);
router.get('/customer/:phone', posLookupController.lookupCustomer);

module.exports = router;

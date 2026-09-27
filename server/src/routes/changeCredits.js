const express = require('express');
const changeCreditsController = require('../controllers/changeCreditsController');

const router = express.Router();

router.get('/:phone', changeCreditsController.getByPhone);
router.post('/', changeCreditsController.create);

module.exports = router;

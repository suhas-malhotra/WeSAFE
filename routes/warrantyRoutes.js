const express = require('express');
const warrantyController = require('./../controllers/warrantyController');
const router = express.Router();

router
  .route('/')
  .get(warrantyController.getAllWarranty)
  .get(warrantyController.createWarranty);
router
  .route('/:id')
  .get(warrantyController.getWarranty)
  .patch(warrantyController.updateWarranty)
  .delete(warrantyController.deleteWarranty);

module.exports = router;

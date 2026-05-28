import express from 'express';
import { getData, createData, updateData, deleteData } from '../controllers/dataController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply the protect middleware to all routes in this router
router.use(protect);

router.route('/')
  .get(getData)
  .post(createData);

router.route('/:id')
  .put(updateData)
  .delete(deleteData);

export default router;

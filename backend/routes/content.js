const express = require('express');
const {
  getAllContent,
  getContent,
  getContentBySection,
  createContent,
  updateContent,
  deleteContent,
  uploadContentImages,
  addContentImage,
  removeContentImage,
  addContentLink,
  removeContentLink,
} = require('../controllers/content');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { uploadContentImages: uploadImages } = require('../middleware/upload');

// Public routes
router.route('/').get(getAllContent);
router.route('/:id').get(getContent);
router.route('/section/:section').get(getContentBySection);

// Protected routes - admin only
router.use(protect);
router.use(authorize('admin'));

router.route('/').post(createContent);
router
  .route('/:id')
  .put(updateContent)
  .delete(deleteContent);
  
router.route('/:id/upload')
  .post(uploadImages, uploadContentImages);
router.route('/:id/images')
  .put(addContentImage);
router.route('/:id/images/:imageId')
  .delete(removeContentImage);
  
router.route('/:id/links')
  .put(addContentLink);
router.route('/:id/links/:linkId')
  .delete(removeContentLink);

module.exports = router;

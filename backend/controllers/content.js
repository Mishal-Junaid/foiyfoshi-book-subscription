const Content = require('../models/Content');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');

// @desc    Get all content sections
// @route   GET /api/content
// @access  Public
exports.getAllContent = asyncHandler(async (req, res, next) => {
  // If active query parameter is provided, filter by active status
  const query = req.query.active === 'true' ? { active: true } : {};
  
  const content = await Content.find(query).sort('order');

  res.status(200).json({
    success: true,
    count: content.length,
    data: content,
  });
});

// @desc    Get single content section
// @route   GET /api/content/:id
// @access  Public
exports.getContent = asyncHandler(async (req, res, next) => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: content,
  });
});

// @desc    Get content by section
// @route   GET /api/content/section/:section
// @access  Public
exports.getContentBySection = asyncHandler(async (req, res, next) => {
  const content = await Content.findOne({ 
    section: req.params.section,
    active: true 
  });

  if (!content) {
    return next(
      new ErrorResponse(`Content not found for section ${req.params.section}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: content,
  });
});

// @desc    Create new content section
// @route   POST /api/content
// @access  Private/Admin
exports.createContent = asyncHandler(async (req, res, next) => {
  const { section } = req.body;
  
  // Check if section already exists
  const existingSection = await Content.findOne({ section });
  
  if (existingSection) {
    return next(new ErrorResponse(`Section ${section} already exists`, 400));
  }
  
  const content = await Content.create(req.body);

  res.status(201).json({
    success: true,
    data: content,
  });
});

// @desc    Update content section
// @route   PUT /api/content/:id
// @access  Private/Admin
exports.updateContent = asyncHandler(async (req, res, next) => {
  let content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if section name is being changed and if the new name already exists
  if (req.body.section && req.body.section !== content.section) {
    const existingSection = await Content.findOne({ section: req.body.section });
    
    if (existingSection) {
      return next(new ErrorResponse(`Section ${req.body.section} already exists`, 400));
    }
  }

  content = await Content.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: content,
  });
});

// @desc    Upload content images
// @route   POST /api/content/:id/upload
// @access  Private/Admin
exports.uploadContentImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one file', 400));
  }

  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  // Process uploaded files
  const images = req.files.map((file) => ({
    url: `/uploads/content/${file.filename}`,
    alt: req.body.alt || content.title || 'Content Image',
  }));

  // Add new images to the content
  content.images = [...content.images, ...images];
  await content.save();

  res.status(200).json({
    success: true,
    count: images.length,
    data: content.images,
  });
});

// @desc    Add image to content (URL-based)
// @route   PUT /api/content/:id/images
// @access  Private/Admin
exports.addContentImage = asyncHandler(async (req, res, next) => {
  const { url, alt } = req.body;
  
  if (!url) {
    return next(new ErrorResponse('Please provide an image URL', 400));
  }
  
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  // Add new image
  content.images.push({
    url,
    alt: alt || 'Content image',
  });

  await content.save();

  res.status(200).json({
    success: true,
    data: content,
  });
});

// @desc    Remove image from content
// @route   DELETE /api/content/:id/images/:imageId
// @access  Private/Admin
exports.removeContentImage = asyncHandler(async (req, res, next) => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  // Find the image in content
  const imageIndex = content.images.findIndex(
    (image) => image._id.toString() === req.params.imageId
  );

  if (imageIndex === -1) {
    return next(new ErrorResponse('Image not found', 404));
  }

  // Get the image URL to check if it's a local file
  const imageUrl = content.images[imageIndex].url;
  
  // If it's a local file (starts with /uploads/content/), delete the file
  if (imageUrl.startsWith('/uploads/content/')) {
    const fs = require('fs');
    const path = require('path');
    
    // Extract filename from the URL
    const filename = imageUrl.split('/').pop();
    const imagePath = path.join(__dirname, '../uploads/content', filename);

    // Delete file if exists
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
        console.log(`Deleted content image file: ${imagePath}`);
      } catch (error) {
        console.error(`Error deleting content image file: ${error.message}`);
        // Continue with database removal even if file deletion fails
      }
    }
  }

  // Remove image from content
  content.images.splice(imageIndex, 1);
  await content.save();

  res.status(200).json({
    success: true,
    data: content,
  });
});

// @desc    Add link to content
// @route   PUT /api/content/:id/links
// @access  Private/Admin
exports.addContentLink = asyncHandler(async (req, res, next) => {
  const { url, text } = req.body;
  
  if (!url || !text) {
    return next(new ErrorResponse('Please provide URL and text for the link', 400));
  }
  
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  // Add new link
  content.links.push({
    url,
    text,
  });

  await content.save();

  res.status(200).json({
    success: true,
    data: content,
  });
});

// @desc    Remove link from content
// @route   DELETE /api/content/:id/links/:linkId
// @access  Private/Admin
exports.removeContentLink = asyncHandler(async (req, res, next) => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  // Find the link in content
  const linkIndex = content.links.findIndex(
    (link) => link._id.toString() === req.params.linkId
  );

  if (linkIndex === -1) {
    return next(new ErrorResponse('Link not found', 404));
  }

  // Remove link from content
  content.links.splice(linkIndex, 1);
  await content.save();

  res.status(200).json({
    success: true,
    data: content,
  });
});

// @desc    Delete content section
// @route   DELETE /api/content/:id
// @access  Private/Admin
exports.deleteContent = asyncHandler(async (req, res, next) => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  await content.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

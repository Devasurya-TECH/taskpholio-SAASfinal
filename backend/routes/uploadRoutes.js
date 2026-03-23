const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// @desc    Upload single file
// @route   POST /api/v1/upload/single
// @access  Private
router.post('/single', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileUrl: req.file.path,
        publicId: req.file.filename,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

// @desc    Upload multiple files
// @route   POST /api/v1/upload/multiple
// @access  Private
router.post('/multiple', protect, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: file.path,
      publicId: file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: req.user._id
    }));

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Files upload failed',
      error: error.message
    });
  }
});

// @desc    Delete file
// @route   DELETE /api/v1/upload/:publicId
// @access  Private
router.delete('/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Cloudinary filenames in multer-storage-cloudinary often include the folder
    // but the publicId passed might be just the name or the full path.
    // destroy expects the public_id as it appears in Cloudinary.
    await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: 'Intel Redacted: File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message
    });
  }
});

module.exports = router;

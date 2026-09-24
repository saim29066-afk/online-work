const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '../../uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem in Serverless environment - ignore
}

// Multer memory storage for robust in-memory image processing
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|bmp|heic|heif/i;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype) || file.mimetype.startsWith('image/');

    if (extname || mimetype) {
      return cb(null, true);
    }
    return cb(new Error('Only valid image files (JPG, PNG, WEBP) are allowed.'));
  }
}).single('screenshot');

// Middleware that wraps multer and creates secure Data URI
const secureUploadMiddleware = (req, res, next) => {
  memoryUpload(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload error. Please select a valid payment slip photo.'
      });
    }

    if (!req.file) {
      return next();
    }

    try {
      const buffer = req.file.buffer;
      let ext = path.extname(req.file.originalname).toLowerCase();
      if (!ext || ext.length < 2) ext = '.jpg';

      // Generate cryptographically secure randomized filename
      const randomHex = crypto.randomBytes(16).toString('hex');
      const filename = `proof-${Date.now()}-${randomHex}${ext}`;

      let mimeType = req.file.mimetype || 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';

      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

      // Attach base64 data URI to req.file (works 100% on Serverless/Vercel)
      req.file.dataUri = base64Data;
      req.file.filename = filename;
      req.file.size = buffer.length;

      // Best effort local disk save (ignores EROFS on Vercel)
      try {
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        req.file.path = filePath;
      } catch (fsErr) {
        // Serverless read-only environment - dataUri will be used directly
      }

      next();
    } catch (uploadErr) {
      console.error('Image processing error:', uploadErr);
      return res.status(400).json({
        success: false,
        message: 'Failed to process the uploaded image. Please select a photo from your gallery and try again.'
      });
    }
  });
};

module.exports = secureUploadMiddleware;

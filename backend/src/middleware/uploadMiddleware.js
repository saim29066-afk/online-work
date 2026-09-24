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

// 1. Strip EXIF GPS metadata & Tracking Tags from JPEG
function stripJpegMetadata(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
    return buffer;
  }
  const chunks = [buffer.slice(0, 2)]; // Keep SOI (FF D8)
  let pos = 2;

  while (pos < buffer.length) {
    if (buffer[pos] !== 0xFF) break;
    const marker = buffer[pos + 1];

    // SOS (Start of Scan) or EOI (End of Image) -> remaining is image stream
    if (marker === 0xDA || marker === 0xD9) {
      chunks.push(buffer.slice(pos));
      break;
    }

    if (pos + 4 > buffer.length) break;
    const length = buffer.readUInt16BE(pos + 2);

    // Filter out APP1 (EXIF / GPS / XMP data: FF E1) and Comments (FF FE)
    if (marker !== 0xE1 && marker !== 0xFE) {
      chunks.push(buffer.slice(pos, pos + 2 + length));
    }

    pos += 2 + length;
  }

  return Buffer.concat(chunks);
}

// 2. Strip Metadata / Textual tracking chunks from PNG
function stripPngMetadata(buffer) {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  if (buffer.length < 8 || !buffer.slice(0, 8).equals(pngSignature)) {
    return buffer;
  }

  const chunks = [buffer.slice(0, 8)]; // Keep PNG signature
  let pos = 8;

  // Metadata chunks to drop to prevent tracking / GPS / hidden payloads
  const dropTypes = ['eXIf', 'tEXt', 'zTXt', 'iTXt'];

  while (pos < buffer.length - 4) {
    const length = buffer.readUInt32BE(pos);
    const type = buffer.slice(pos + 4, pos + 8).toString('ascii');
    const totalChunkLength = 4 + 4 + length + 4; // length (4) + type (4) + data (length) + crc (4)

    if (pos + totalChunkLength > buffer.length) break;

    if (!dropTypes.includes(type)) {
      chunks.push(buffer.slice(pos, pos + totalChunkLength));
    }

    pos += totalChunkLength;
  }

  return Buffer.concat(chunks);
}

// 3. Deep Magic-Number & Polyglot Anti-Hacking Inspector
function sanitizeAndVerifyImage(buffer, originalExt) {
  // Check Magic Bytes
  const isJpeg = buffer.length > 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isPng = buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  const isWebp = buffer.length > 12 && buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP';

  if (!isJpeg && !isPng && !isWebp) {
    throw new Error('Invalid file signature. Only authentic JPG, PNG, and WEBP image formats are permitted.');
  }

  // Check for malicious embedded scripts, PHP tags, or HTML tracking payloads inside image binary
  const binaryString = buffer.toString('binary');
  const forbiddenSignatures = [
    '<?php',
    '<?=',
    '<script',
    '<html',
    '<iframe',
    '<svg',
    'javascript:',
    'onload=',
    'onerror=',
    'eval(',
    'base64_decode',
    'passthru',
    'shell_exec'
  ];

  for (const sig of forbiddenSignatures) {
    if (binaryString.toLowerCase().includes(sig)) {
      throw new Error('Malicious payload or unauthorized tracking script detected in image data.');
    }
  }

  // Strip EXIF GPS & Device tracking metadata
  let sanitizedBuffer = buffer;
  let finalExt = '.png';

  if (isJpeg) {
    sanitizedBuffer = stripJpegMetadata(buffer);
    finalExt = '.jpg';
  } else if (isPng) {
    sanitizedBuffer = stripPngMetadata(buffer);
    finalExt = '.png';
  } else if (isWebp) {
    finalExt = '.webp';
  }

  return { sanitizedBuffer, ext: finalExt };
}

// Multer memory storage for in-memory security scanning
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    return cb(new Error('Only valid image files (JPG, PNG, WEBP) are allowed.'));
  }
}).single('screenshot');

// Middleware that wraps multer and performs deep sanitization & metadata stripping
const secureUploadMiddleware = (req, res, next) => {
  memoryUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload error. Please select a valid payment slip photo.'
      });
    }

    if (!req.file) {
      return next();
    }

    try {
      const originalExt = path.extname(req.file.originalname).toLowerCase();
      const { sanitizedBuffer, ext } = sanitizeAndVerifyImage(req.file.buffer, originalExt);

      // Generate cryptographically secure randomized filename
      const randomHex = crypto.randomBytes(16).toString('hex');
      const filename = `proof-${Date.now()}-${randomHex}${ext}`;
      
      const mimeType = (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
      const base64Data = `data:${mimeType};base64,${sanitizedBuffer.toString('base64')}`;

      // Attach base64 data URI to req.file (works 100% on Serverless/Vercel)
      req.file.dataUri = base64Data;
      req.file.filename = filename;
      req.file.size = sanitizedBuffer.length;

      // Best effort local disk save (ignores EROFS on Vercel)
      try {
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, sanitizedBuffer);
        req.file.path = filePath;
      } catch (fsErr) {
        // Serverless read-only environment - dataUri will be used directly
      }

      next();
    } catch (sanitizationErr) {
      console.error('Image Sanitization Blocked Upload:', sanitizationErr.message);
      return res.status(400).json({
        success: false,
        message: sanitizationErr.message || 'Security validation failed for the uploaded image.'
      });
    }
  });
};

module.exports = secureUploadMiddleware;

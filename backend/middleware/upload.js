import multer from 'multer';

// Use memoryStorage — files are kept in memory as Buffer
// and then uploaded to Cloudinary (not saved to disk)
const memoryStorage = multer.memoryStorage();

// ── File filters ─────────────────────────────────────────────────────────────

const documentFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(file.originalname.toLowerCase().split('.').pop());
  const mime = /image\/(jpeg|jpg|png)|application\/pdf/.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only PDF, PNG, JPG, and JPEG files are allowed!'));
};

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ext = allowed.test(file.originalname.toLowerCase().split('.').pop());
  const mime = /image\/(jpeg|jpg|png)/.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only PNG, JPG, and JPEG image files are allowed!'));
};

const videoFilter = (req, file, cb) => {
  const allowed = /mp4|mov|avi|webm|mkv/;
  const ext = allowed.test(file.originalname.toLowerCase().split('.').pop());
  const mime = /video\//.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only video files (mp4, mov, avi, webm, mkv) are allowed!'));
};

// ── Multer instances ──────────────────────────────────────────────────────────

// License/certificate document upload (10MB max)
export const uploadDocument = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter
}).single('document');

// Profile photo upload (5MB max)
export const uploadProfileImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
}).single('profilePhoto');

// Video upload (100MB max)
export const uploadVideo = multer({
  storage: memoryStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: videoFilter
}).single('video');

// ── Error handler ─────────────────────────────────────────────────────────────

export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size too large.' });
    }
    return res.status(400).json({ success: false, message: 'File upload error: ' + error.message });
  } else if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next();
};

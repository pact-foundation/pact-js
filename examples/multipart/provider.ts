import express, { type Express } from 'express';
import multer from 'multer';

/**
 * Creates the Upload Service Express application.
 *
 * Uses multer for multipart/form-data parsing. The field name 'file' must
 * match the field name used in the consumer's multipartBody() call.
 * Files are stored in memory (not on disk) to keep the example self-contained.
 */
export function createApp(): Express {
  const app = express();
  // memoryStorage() keeps uploaded files in memory rather than writing to disk.
  const upload = multer({ storage: multer.memoryStorage() });

  app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }
    res.json({ success: true });
  });

  return app;
}

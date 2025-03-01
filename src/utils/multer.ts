// middleware/multer.ts
import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

// Memory storage for temporary file storage
const storage = multer.memoryStorage();

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and WEBP files are allowed'));
    }
  },
});

// Middleware function for handling single file uploads
export function uploadMiddleware(fieldName: string) {
  return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    try {
      // Call multer upload
      await new Promise((resolve, reject) => {
        upload.single(fieldName)(req as any, res as any, (err: any) => {
          if (err) {
            return reject(err);
          }
          resolve(null);
        });
      });
      next();
    } catch (error) {
      console.error('File upload error:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  };
}

// Note: In Next.js App Router, this would need to be adapted
// to work with the new Route Handlers API
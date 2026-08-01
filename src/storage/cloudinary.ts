import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/src/config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBuffer: Buffer, filename: string): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'autoparse_documents',
        public_id: `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        resource_type: 'auto', // Auto detects image, raw (pdf)
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Unknown error during Cloudinary upload'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

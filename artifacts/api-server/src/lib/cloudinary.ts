import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  logger.warn('Cloudinary credentials not set. Image upload will not work.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'playzone/galeria_test';

export async function uploadImage(file: Express.Multer.File, folder?: string): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder || uploadFolder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1920, height: 1080, crop: 'limit' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error uploading to Cloudinary:');
    throw new Error('Failed to upload image');
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error deleting from Cloudinary:');
    throw new Error('Failed to delete image');
  }
}

export default cloudinary;

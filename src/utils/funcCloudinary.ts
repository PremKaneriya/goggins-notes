// utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - Buffer containing file data
 * @param fileType - MIME type of the file
 * @param options - Additional Cloudinary upload options
 * @returns Promise resolving to Cloudinary upload result
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  fileType: string,
  options: any = {}
) {
  // Create a data URI from the buffer
  const dataURI = `data:${fileType};base64,${buffer.toString('base64')}`;
  
  // Set default options
  const defaultOptions = {
    folder: 'goggins-app',
    resource_type: 'auto',
  };
  
  // Merge default options with provided options
  const uploadOptions = { ...defaultOptions, ...options };
  
  // Upload to Cloudinary
  return await cloudinary.uploader.upload(dataURI, uploadOptions);
}

/**
 * Delete a file from Cloudinary by URL or public ID
 * @param publicIdOrUrl - Cloudinary public ID or URL
 * @returns Promise resolving to Cloudinary deletion result
 */
export async function deleteFromCloudinary(publicIdOrUrl: string) {
  // If a URL is provided, extract the public ID
  let publicId = publicIdOrUrl;
  
  if (publicIdOrUrl.startsWith('http')) {
    // Extract public ID from URL (e.g., "https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/file.jpg")
    const urlParts = publicIdOrUrl.split('/');
    // Get everything after "upload/"
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      // Join all parts after "upload/" and remove file extension
      publicId = urlParts.slice(uploadIndex + 2).join('/').replace(/\.\w+$/, '');
    }
  }
  
  // Delete from Cloudinary
  return await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
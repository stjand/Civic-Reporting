// File: frontend/src/utils/imageCompression.js
import imageCompression from 'browser-image-compression'

export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1, // Maximum file size in MB
    maxWidthOrHeight: 1920, // Maximum width or height
    useWebWorker: true,
    fileType: 'image/jpeg'
  }
  
  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('Image compression failed:', error)
    throw error
  }
}

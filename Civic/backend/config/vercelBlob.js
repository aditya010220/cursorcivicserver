import { put, del } from '@vercel/blob';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the token from .env
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Warn if token is missing (but don't crash the app)
if (!BLOB_TOKEN) {
  console.warn('⚠️ Warning: BLOB_READ_WRITE_TOKEN is missing. Blob upload/delete will not work.');
}

// Function to upload file to Vercel Blob
export const uploadToBlob = async (file, options = {}) => {
  if (!BLOB_TOKEN) {
    throw new Error('❌ Blob upload failed: Missing BLOB_READ_WRITE_TOKEN.');
  }

  try {
    const blob = await put(file.originalname, file.buffer, {
      access: 'public',
      token: BLOB_TOKEN,
      ...options,
    });
    return blob;
  } catch (error) {
    console.error('❌ Vercel Blob upload error:', error);
    throw error;
  }
};

// Function to delete file from Vercel Blob
export const deleteFromBlob = async (url) => {
  if (!BLOB_TOKEN) {
    throw new Error('❌ Blob delete failed: Missing BLOB_READ_WRITE_TOKEN.');
  }

  try {
    await del(url, {
      token: BLOB_TOKEN,
    });
  } catch (error) {
    console.error('❌ Vercel Blob deletion error:', error);
    throw error;
  }
};

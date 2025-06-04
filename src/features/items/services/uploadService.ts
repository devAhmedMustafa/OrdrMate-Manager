import axios from 'axios';

const BASE_URL = 'http://localhost:5126/api';

export const uploadService = {
  // Get presigned URL for uploading
  getPresignedUrl: async (fileName: string, fileType: string, token: string) => {
    const response = await axios.post(
      `${BASE_URL}/Upload/presigned-url`,
      {
        fileName,
        fileType
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Get presigned URL for viewing
  getViewPresignedUrl: async (imageKey: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/Upload/presigned-url/${imageKey}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data.fileUrl;
  },

  // Upload file using presigned URL
  uploadFile: async (uploadUrl: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}; 
import api from '../../../utils/api';

export const uploadService = {
  // Get presigned URL for uploading
  getPresignedUrl: async (fileName: string, fileType: string) => {
    const response = await api.post('/Upload/presigned-url', {
      fileName,
      fileType
    });
    return response.data;
  },

  // Get presigned URL for viewing
  getViewPresignedUrl: async (imageKey: string) => {
    const response = await api.get(`/Upload/presigned-url/${imageKey}`);
    return response.data.fileUrl;
  },

  // Upload file using presigned URL
  uploadFile: async (uploadUrl: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    await api.put(uploadUrl, formData);
  }
}; 
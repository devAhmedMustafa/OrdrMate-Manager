import QRCode from 'qrcode';

/**
 * Generates a QR code and returns a blob URL
 * @param text - The text/URL to encode in the QR code
 * @returns Promise<string> - Blob URL for the QR code image
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Create and return blob URL
    return window.URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
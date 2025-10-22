import { useState, useEffect } from "react";
import useAuth from "../auth/useAuth.hook";
import { useNavigate } from "react-router-dom";
import ManagerRole from "../auth/ManagerRole";
import styles from "./AddItem.module.css";
import { itemService, MenuItem } from "./services/itemService";
import { uploadService } from "./services/uploadService";

type AddItemFormData = Omit<MenuItem, 'id'> & {
    pharmacyId: string;
};

interface FileWithUrl extends File {
    fileUrl?: string;
}

// Compression configuration
const COMPRESSION_OPTIONS = {
    maxSizeMB: 1, // Maximum file size in MBs
    maxWidthOrHeight: 1200, // Maximum width or heights
    useWebWorker: true, // Use web worker for better performance
    fileType: "image/jpeg", // Output format
};

export default function AddItemPage() {
    const { token, role, pharmacyId } = useAuth(); 
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileWithUrl | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [compressing, setCompressing] = useState(false);

    if (role !== ManagerRole.TopLevel) {
        navigate("/");
        return null;
    }

    async function compressImage(file: File): Promise<File> {
        try {
            // Dynamically import the compression library
            const imageCompression = await import('browser-image-compression');
            const compressedFile = await imageCompression.default(file, COMPRESSION_OPTIONS);
            
            console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
            
            return compressedFile;
        } catch (error) {
            console.error("Image compression failed:", error);
            throw new Error("Failed to compress image");
        }
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setError("");
        setUploadProgress(0);
        setCompressing(true);

        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error("Please select a valid image file");
            }

            // Compress the image before upload
            const compressedFile = await compressImage(file);
            setSelectedFile(compressedFile);

            // Get presigned URL and upload compressed file
            const { uploadUrl, fileUrl } = await uploadService.getPresignedUrl(
                compressedFile.name, 
                compressedFile.type
            );
            
            await uploadService.uploadFile(uploadUrl, compressedFile);

            // Store the fileUrl for form submission
            setSelectedFile(prev => prev ? { ...prev, fileUrl } as any : null);
            
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || "Failed to process image");
            setSelectedFile(null);
        } finally {
            setCompressing(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!token || !pharmacyId) return;
        
        setError("");
        setLoading(true);

        const form = e.currentTarget;
        const formData: AddItemFormData = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
            price: Number((form.elements.namedItem('price') as HTMLInputElement).value),
            category: (form.elements.namedItem('category') as HTMLInputElement).value,
            subCategory: (form.elements.namedItem('subCategory') as HTMLInputElement).value,
            pharmacyId,
            imageUrl: selectedFile?.fileUrl || '',
            priority: 0,
            tags: "",
            brand: (form.elements.namedItem('brand') as HTMLInputElement).value,
        };

        try {
            // First create the item
            await itemService.createItem(formData);

            navigate("/menu");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add item");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchImageUrl = async () => {
            if (selectedFile?.fileUrl) {
                const imageUrl = await uploadService.getViewPresignedUrl(selectedFile.fileUrl);
                setImageUrl(imageUrl);
            }
        }
        fetchImageUrl();
    }, [selectedFile?.fileUrl]);

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>Add New Item</h1>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={`${styles.formGroup} ${styles.description}`}>
                        <label htmlFor="description" className={styles.label}>Description</label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            className={styles.textarea}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="price" className={styles.label}>Price</label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="category" className={styles.label}>Category</label>
                        <input
                            id="category"
                            name="category"
                            type="text"
                            required
                            className={styles.input}
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="subCategory" className={styles.label}>Subcategory</label>
                        <input
                            id="subCategory"
                            name="subCategory"
                            type="text"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="brand" className={styles.label}>Brand</label>
                        <input
                            id="brand"
                            name="brand"
                            type="text"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="image" className={styles.label}>Image</label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className={styles.input}
                            disabled={compressing}
                        />
                        {compressing && (
                            <div className={styles.compressing}>
                                Compressing image...
                            </div>
                        )}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill} 
                                    style={{ width: `${uploadProgress}%` }}
                                />
                                <span>{uploadProgress}%</span>
                            </div>
                        )}
                        {selectedFile?.fileUrl && (
                            <img 
                                src={imageUrl} 
                                alt="Preview" 
                                className={styles.imagePreview}
                            />
                        )}
                    </div>

                    {error && (
                        <p className={styles.error}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || compressing}
                        className={styles.submitButton}
                    >
                        {loading ? "Adding..." : "Add Item"}
                    </button>
                </form>
            </div>
        </div>
    );
}
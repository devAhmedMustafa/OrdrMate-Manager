import { useState } from "react";
import useAuth from "../auth/useAuth.hook";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ManagerRole from "../auth/ManagerRole";
import styles from "./AddItem.module.css";

interface AddItemFormData {
    name: string;
    description: string;
    price: number;
    category: string;
    restaurantId: string;
    imageUrl?: string;
    preparationTime: number;
}

interface FileWithUrl extends File {
    fileUrl?: string;
}

export default function AddItemPage() {
    const { token, role, restaurantId } = useAuth(); 
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileWithUrl | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    if (role !== ManagerRole.TopLevel) {
        navigate("/");
        return null;
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setError("");
        setUploadProgress(0);

        try {
            // Get presigned URL
            const presignedResponse = await axios.post('http://localhost:5126/api/Upload/presigned-url', {
                fileName: file.name,
                fileType: file.type
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const { uploadUrl, fileUrl } = presignedResponse.data;

            const formData = new FormData();
            formData.append('file', file);

            // Upload file to presigned URL
            await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(progress);
                }
            });

            // Store the fileUrl for form submission
            setSelectedFile(prev => prev ? { ...prev, fileUrl } as any : null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to upload image");
            setSelectedFile(null);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const form = e.currentTarget;
        const formData: AddItemFormData = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
            price: Number((form.elements.namedItem('price') as HTMLInputElement).value),
            category: (form.elements.namedItem('category') as HTMLInputElement).value,
            restaurantId: restaurantId || "",
            imageUrl: selectedFile?.fileUrl,
            preparationTime: Number((form.elements.namedItem('preparationTime') as HTMLInputElement).value)
        };

        try {
            await axios.post('http://localhost:5126/api/Item', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            navigate("/items");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add item");
        } finally {
            setLoading(false);
        }
    }

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
                        <label htmlFor="preparationTime" className={styles.label}>Preparation Time (minutes)</label>
                        <input
                            id="preparationTime"
                            name="preparationTime"
                            type="number"
                            required
                            min="1"
                            step="1"
                            className={styles.input}
                        />
                    </div>

                    <div className={`${styles.formGroup} ${styles.image}`}>
                        <label htmlFor="image" className={styles.label}>Image</label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className={styles.input}
                        />
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
                                src={selectedFile.fileUrl} 
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
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? "Adding..." : "Add Item"}
                    </button>
                </form>
            </div>
        </div>
    );
} 
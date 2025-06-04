import { useState, useEffect } from "react";
import useAuth from "../auth/useAuth.hook";
import { useNavigate } from "react-router-dom";
import ManagerRole from "../auth/ManagerRole";
import styles from "./AddItem.module.css";
import { itemService, Kitchen, MenuItem } from "./services/itemService";
import { uploadService } from "./services/uploadService";

type AddItemFormData = Omit<MenuItem, 'id'> & {
    restaurantId: string;
};

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
    const [kitchens, setKitchens] = useState<Kitchen[]>([]);
    const [selectedKitchenId, setSelectedKitchenId] = useState<string>("");

    useEffect(() => {
        if (!restaurantId || !token) return;
        fetchKitchens();
    }, [restaurantId, token]);

    const fetchKitchens = async () => {
        try {
            const kitchensData = await itemService.getRestaurantKitchens(restaurantId!, token!);
            setKitchens(kitchensData);
        } catch (err) {
            setError('Failed to load kitchens');
            console.error('Error fetching kitchens:', err);
        }
    };

    if (role !== ManagerRole.TopLevel) {
        navigate("/");
        return null;
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setSelectedFile(file);
        setError("");
        setUploadProgress(0);

        try {
            // Get presigned URL and upload file
            const { uploadUrl, fileUrl } = await uploadService.getPresignedUrl(file.name, file.type, token);
            await uploadService.uploadFile(uploadUrl, file);

            // Store the fileUrl for form submission
            setSelectedFile(prev => prev ? { ...prev, fileUrl } as any : null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to upload image");
            setSelectedFile(null);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!token || !restaurantId) return;
        
        setError("");
        setLoading(true);

        const form = e.currentTarget;
        const formData: AddItemFormData = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
            price: Number((form.elements.namedItem('price') as HTMLInputElement).value),
            category: (form.elements.namedItem('category') as HTMLInputElement).value,
            restaurantId,
            imageUrl: selectedFile?.fileUrl || '',
            preparationTime: Number((form.elements.namedItem('preparationTime') as HTMLInputElement).value),
            kitchenId: selectedKitchenId
        };

        try {
            await itemService.createItem(formData, token);
            navigate("/menu");
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
                        <label htmlFor="kitchen" className={styles.label}>Kitchen</label>
                        <select
                            id="kitchen"
                            name="kitchen"
                            required
                            className={styles.input}
                            value={selectedKitchenId}
                            onChange={(e) => setSelectedKitchenId(e.target.value)}
                        >
                            <option value="">Select a kitchen</option>
                            {kitchens.map(kitchen => (
                                <option key={kitchen.id} value={kitchen.id}>
                                    {kitchen.name}
                                </option>
                            ))}
                        </select>
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

                    <div className={styles.formGroup}>
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
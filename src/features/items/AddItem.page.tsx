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
}

export default function AddItemPage() {
    const { token, role, restaurantId } = useAuth(); 
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (role !== ManagerRole.TopLevel) {
        navigate("/");
        return null;
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
            restaurantId: restaurantId || ""
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

                    <div className={styles.formGroup}>
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
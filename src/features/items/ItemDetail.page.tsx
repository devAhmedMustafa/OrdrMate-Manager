import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth.hook';
import axios from 'axios';
import styles from './ItemDetail.module.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  preparationTime: number;
  category: string;
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5126/api/Item/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setItem(response.data);
        setEditedItem(response.data);
      } catch (err) {
        setError('Failed to load menu item');
        console.error('Error fetching menu item:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id, token]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedItem) return;

    try {
      await axios.put(
        `http://localhost:5126/api/Item/${id}`,
        editedItem,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setItem(editedItem);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update menu item');
      console.error('Error updating menu item:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(
        `http://localhost:5126/api/Item/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      navigate('/menu');
    } catch (err) {
      setError('Failed to delete menu item');
      console.error('Error deleting menu item:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedItem) return;
    
    const { name, value } = e.target;
    setEditedItem({
      ...editedItem,
      [name]: name === 'price' || name === 'preparationTime' ? Number(value) : value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedItem) return;
    
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedItem({
          ...editedItem,
          imageUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading menu item...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!item) {
    return <div className={styles.error}>Item not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{isEditing ? 'Edit Item' : item.name}</h1>
        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button onClick={handleSave} className={styles.saveButton}>
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={handleEdit} className={styles.editButton}>
                Edit Item
              </button>
              <button onClick={handleDelete} className={styles.deleteButton}>
                Delete Item
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <img src={item.imageUrl} alt={item.name} className={styles.image} />
        </div>

        {isEditing ? (
          <div className={styles.editForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedItem?.name}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={editedItem?.description}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={editedItem?.price}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={editedItem?.category}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="preparationTime">Preparation Time (minutes)</label>
              <input
                type="number"
                id="preparationTime"
                name="preparationTime"
                value={editedItem?.preparationTime}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="image">Item Image</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              {editedItem?.imageUrl && (
                <div className={styles.currentImage}>
                  <img src={editedItem.imageUrl} alt="Current" className={styles.previewImage} />
                  <span className={styles.imageLabel}>Current Image</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.details}>
            <div className={styles.meta}>
              <span className={styles.price}>${item.price.toFixed(2)}</span>
              <span className={styles.category}>{item.category}</span>
              {item.preparationTime > 0 && (
                <span className={styles.prepTime}>{item.preparationTime} min</span>
              )}
            </div>
            <p className={styles.description}>{item.description}</p>
            <div className={styles.additionalInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Category:</span>
                <span className={styles.infoValue}>{item.category}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Preparation Time:</span>
                <span className={styles.infoValue}>{item.preparationTime} minutes</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
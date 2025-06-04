import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth.hook';
import styles from './ItemDetail.module.css';
import { itemService, MenuItem, Kitchen } from './services/itemService';
import { uploadService } from './services/uploadService';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, restaurantId } = useAuth();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<MenuItem | null>(null);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !token || !restaurantId) return;

      try {
        const [itemData, kitchensData] = await Promise.all([
          itemService.getItem(id, token),
          itemService.getRestaurantKitchens(restaurantId, token)
        ]);
        
        setItem(itemData);
        setEditedItem(itemData);
        setKitchens(kitchensData);

        // Get presigned URL for the image
        if (itemData.imageUrl) {
          const presignedUrl = await uploadService.getViewPresignedUrl(itemData.imageUrl, token);
          setImageUrl(presignedUrl);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, restaurantId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedItem || !id || !token) return;

    try {
      const updatedItem = await itemService.updateItem(id, editedItem, token);
      setItem(updatedItem);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update menu item');
      console.error('Error updating menu item:', err);
    }
  };

  const handleDelete = async () => {
    if (!id || !token || !window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await itemService.deleteItem(id, token);
      navigate('/menu');
    } catch (err) {
      setError('Failed to delete menu item');
      console.error('Error deleting menu item:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editedItem) return;
    
    const { name, value } = e.target;
    setEditedItem({
      ...editedItem,
      [name]: name === 'price' || name === 'preparationTime' ? Number(value) : value
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedItem || !token) return;
    
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Get presigned URL
        const { uploadUrl, fileUrl } = await uploadService.getPresignedUrl(file.name, file.type, token);

        // Upload file
        await uploadService.uploadFile(uploadUrl, file);

        // Update the item with the new file URL
        setEditedItem({
          ...editedItem,
          imageUrl: fileUrl
        });
      } catch (err) {
        setError('Failed to upload image');
        console.error('Error uploading image:', err);
      }
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

  const selectedKitchen = kitchens.find(k => k.id === item.kitchenId);

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
          <img src={imageUrl} alt={item.name} className={styles.image} />
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
              <label htmlFor="kitchenId">Kitchen</label>
              <select
                id="kitchenId"
                name="kitchenId"
                value={editedItem?.kitchenId}
                onChange={handleInputChange}
              >
                {kitchens.map(kitchen => (
                  <option key={kitchen.id} value={kitchen.id}>
                    {kitchen.name}
                  </option>
                ))}
              </select>
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
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Kitchen:</span>
                <span className={styles.infoValue}>{selectedKitchen?.name || 'Not assigned'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
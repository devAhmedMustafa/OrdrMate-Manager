import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { BooleanMetadata, CustomizationCategory, customizationService, MultiSelectMetadata, NumberMetadata, TextMetadata } from './services/customizationService';
import AddCategory from './components/AddCategory';
import { 
  hasChoices, 
  isTextMetadata, 
  isNumberMetadata, 
  isBooleanMetadata,
  getCategoryTypeDisplayName 
} from './utils/typeGuards';
import styles from './Customizations.module.css';
import useAuth from '../auth/useAuth.hook';

export default function CustomizationsPage() {
  const [categories, setCategories] = useState<CustomizationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { restaurantId } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    
    try {
        if (!restaurantId) {
            console.error('Restaurant ID is required to fetch categories');
            return;
        }
        const data = await customizationService.getCategories(restaurantId);
        setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError('Failed to load customization categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreated = () => {
    setShowAddForm(false);
    fetchCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customization category? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    
    try {
      await customizationService.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showAddForm) {
    return (
      <AddCategory
        onCategoryCreated={handleCategoryCreated}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Icon icon="mdi:palette" className={styles.headerIcon} />
          <div>
            <h1>Customization Categories</h1>
            <p>Manage customization options for your menu items</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className={styles.addButton}
        >
          <Icon icon="mdi:plus" />
          Add Category
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <Icon icon="mdi:alert-circle" />
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <Icon icon="mdi:loading" className={styles.spinner} />
          <p>Loading customization categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon icon="mdi:palette-outline" className={styles.emptyIcon} />
          <h3>No Customization Categories</h3>
          <p>Get started by creating your first customization category for menu items.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className={styles.createFirstButton}
          >
            <Icon icon="mdi:plus-circle" />
            Create First Category
          </button>
        </div>
      ) : (
        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <div key={category.id} className={styles.categoryCard}>
              <div className={styles.cardHeader}>
                <div className={styles.categoryInfo}>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <p className={styles.categoryDescription}>{category.description}</p>
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleDeleteCategory(category.id!)}
                    disabled={deletingId === category.id}
                    className={styles.deleteButton}
                    title="Delete category"
                  >
                    {deletingId === category.id ? (
                      <Icon icon="mdi:loading" className={styles.spinner} />
                    ) : (
                      <Icon icon="mdi:delete" />
                    )}
                  </button>
                </div>
              </div>

              {/* Display content based on category type */}
              {hasChoices(category) && (
                <div className={styles.choicesSection}>
                  <h4 className={styles.choicesTitle}>Available Choices:</h4>
                  <div className={styles.choicesList}>
                    {(category.metadata as MultiSelectMetadata).choices.map((choice, index) => (
                      <span key={index} className={styles.choiceTag}>
                        {choice.value}
                        {choice.price && ` (+$${choice.price.toFixed(2)})`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isTextMetadata(category) && (
                <div className={styles.settingsSection}>
                  <h4 className={styles.settingsTitle}>Text Input Settings:</h4>
                  <div className={styles.settingsList}>
                    {(category.metadata as TextMetadata).placeholder && (
                      <span className={styles.settingTag}>Placeholder: "{(category.metadata as TextMetadata).placeholder}"</span>
                    )}
                    {(category.metadata as TextMetadata).maxLength && (
                      <span className={styles.settingTag}>Max Length: {(category.metadata as TextMetadata).maxLength}</span>
                    )}
                    {(category.metadata as TextMetadata).required && (
                      <span className={styles.settingTag}>Required</span>
                    )}
                  </div>
                </div>
              )}

              {isNumberMetadata(category) && (
                <div className={styles.settingsSection}>
                  <h4 className={styles.settingsTitle}>Number Input Settings:</h4>
                  <div className={styles.settingsList}>
                    {(category.metadata as NumberMetadata).min !== undefined && (
                      <span className={styles.settingTag}>Min: {(category.metadata as NumberMetadata).min}</span>
                    )}
                    {(category.metadata as NumberMetadata).max !== undefined && (
                      <span className={styles.settingTag}>Max: {(category.metadata as NumberMetadata).max}</span>
                    )}
                    {(category.metadata as NumberMetadata).step && (
                      <span className={styles.settingTag}>Step: {(category.metadata as NumberMetadata).step}</span>
                    )}
                    {(category.metadata as NumberMetadata).required && (
                      <span className={styles.settingTag}>Required</span>
                    )}
                  </div>
                </div>
              )}

              {isBooleanMetadata(category) && (
                <div className={styles.settingsSection}>
                  <h4 className={styles.settingsTitle}>Boolean Settings:</h4>
                  <div className={styles.settingsList}>
                    <span className={styles.settingTag}>
                      Default: {(category.metadata as BooleanMetadata).defaultValue ? 'Checked' : 'Unchecked'}
                    </span>
                    {(category.metadata as BooleanMetadata).price && (
                      <span className={styles.settingTag}>Price: +${(category.metadata as BooleanMetadata).price?.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.cardFooter}>
                <div className={styles.metadata}>
                  <span className={styles.typeTag}>
                    {getCategoryTypeDisplayName(category)}
                  </span>
                  {category.createdAt && (
                    <span className={styles.createdDate}>
                      Created {formatDate(category.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { 
  CustomizationCategoryResponse, 
  customizationService 
} from '../../customizations/services/customizationCloudService';
import AddCategory from '../../customizations/components/AddCategory';
import styles from './ItemCustomizations.module.css';

interface ItemCustomizationsProps {
  restaurantId: string;
  itemId?: string; // Optional for new items
  onAssignmentsChange?: (categoryIds: string[]) => void;
}

export default function ItemCustomizations({ 
  restaurantId, 
  itemId, 
  onAssignmentsChange 
}: ItemCustomizationsProps) {
  const [categories, setCategories] = useState<CustomizationCategoryResponse[]>([]);
  const [assignedCategoryIds, setAssignedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      fetchCategories();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (itemId) {
      fetchItemCustomizations();
    }
  }, [itemId]);

  useEffect(() => {
    onAssignmentsChange?.(assignedCategoryIds);
  }, [assignedCategoryIds, onAssignmentsChange]);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await customizationService.getCategories(restaurantId);
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError('Failed to load customization categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchItemCustomizations = async () => {
    if (!itemId) return;
    
    try {
      const assignedCategories = await customizationService.getItemCustomizations(itemId);
      const categoryIds = assignedCategories.map(cat => cat.id!);
      setAssignedCategoryIds(categoryIds);
    } catch (err: any) {
      console.error('Error fetching item customizations:', err);
      // Don't show error for this as it might just mean no customizations assigned
    }
  };

  const handleCategoryToggle = async (categoryId: string) => {
    const isAssigned = assignedCategoryIds.includes(categoryId);
    
    if (itemId) {
      // If we have an itemId, make API call immediately
      setAssigning(categoryId);
      try {
        if (isAssigned) {
          await customizationService.removeCategoryFromItem(itemId, categoryId);
          setAssignedCategoryIds(prev => prev.filter(id => id !== categoryId));
        } else {
          await customizationService.assignCategoryToItem({ itemId, categoryId });
          setAssignedCategoryIds(prev => [...prev, categoryId]);
        }
      } catch (err: any) {
        console.error('Error toggling category assignment:', err);
        setError(err.response?.data?.message || 'Failed to update customization assignment');
      } finally {
        setAssigning(null);
      }
    } else {
      // If no itemId yet (new item), just update local state
      if (isAssigned) {
        setAssignedCategoryIds(prev => prev.filter(id => id !== categoryId));
      } else {
        setAssignedCategoryIds(prev => [...prev, categoryId]);
      }
    }
  };

  const handleCategoryCreated = () => {
    setShowAddForm(false);
    fetchCategories();
  };

  const getCategoryTypeDisplayName = (inputType: string) => {
    switch (inputType) {
      case 'SingleSelect': return 'Single Select';
      case 'MultiSelect': return 'Multi Select';
      case 'Text': return 'Text Input';
      case 'Number': return 'Number Input';
      case 'Boolean': return 'Boolean';
      default: return inputType;
    }
  };

  if (showAddForm) {
    return (
      <div className={styles.container}>
        <AddCategory
          onCategoryCreated={handleCategoryCreated}
          onCancel={() => setShowAddForm(false)}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Icon icon="mdi:palette" className={styles.headerIcon} />
          <div>
            <h3>Item Customizations</h3>
            <p>Assign customization categories to this menu item</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className={styles.addButton}
          type="button"
        >
          <Icon icon="mdi:plus" />
          New Category
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
          <h4>No Customization Categories</h4>
          <p>Create your first customization category to get started.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className={styles.createFirstButton}
            type="button"
          >
            <Icon icon="mdi:plus" />
            Create First Category
          </button>
        </div>
      ) : (
        <div className={styles.categoriesGrid}>
          {categories.map(category => {
            const isAssigned = assignedCategoryIds.includes(category.id!);
            const isProcessing = assigning === category.id;
            
            return (
              <div key={category.id} className={`${styles.categoryCard} ${isAssigned ? styles.assigned : ''}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.categoryInfo}>
                    <h4 className={styles.categoryName}>{category.name}</h4>
                    <p className={styles.categoryDescription}>{category.description}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleCategoryToggle(category.id!)}
                      disabled={isProcessing}
                      className={`${styles.toggleButton} ${isAssigned ? styles.remove : styles.assign}`}
                      type="button"
                    >
                      {isProcessing ? (
                        <Icon icon="mdi:loading" className={styles.spinner} />
                      ) : isAssigned ? (
                        <Icon icon="mdi:check" />
                      ) : (
                        <Icon icon="mdi:plus" />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.categoryMeta}>
                  <span className={styles.typeTag}>
                    {getCategoryTypeDisplayName(category.inputType)}
                  </span>
                  {isAssigned && (
                    <span className={styles.assignedTag}>
                      <Icon icon="mdi:check-circle" />
                      Assigned
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { CustomizationCategoryResponse, SingleSelectMetadata, MultiSelectMetadata, TextMetadata, NumberMetadata, BooleanMetadata } from '../../customizations/services/customizationCloudService';
import styles from './ItemCustomizationModal.module.css';

interface ItemCustomizationModalProps {
  itemId: string;
  itemName: string;
  itemPrice: number;
  customizations: CustomizationCategoryResponse[];
  onClose: () => void;
  onAddToCart: (customizations: {[categoryName: string]: any}) => void;
}

export default function ItemCustomizationModal({
  itemName,
  itemPrice,
  customizations,
  onClose,
  onAddToCart
}: ItemCustomizationModalProps) {
  const [selectedCustomizations, setSelectedCustomizations] = useState<{[name: string]: any}>({});

  const handleCustomizationChange = (name: string, value: any) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalPrice = () => {
    let additionalPrice = 0;
    
    customizations.forEach(category => {
      const selectedValue = selectedCustomizations[category.name!];
      
      if (category.inputType === 'SingleSelect' && selectedValue) {
        const metadata = category.metadata as SingleSelectMetadata;
        const choice = metadata.choices.find(c => c.value === selectedValue);
        if (choice?.price) additionalPrice += choice.price;
      } else if (category.inputType === 'MultiSelect' && Array.isArray(selectedValue)) {
        const metadata = category.metadata as MultiSelectMetadata;
        selectedValue.forEach((value: string) => {
          const choice = metadata.choices.find(c => c.value === value);
          if (choice?.price) additionalPrice += choice.price;
        });
      } else if (category.inputType === 'Boolean' && selectedValue) {
        const metadata = category.metadata as BooleanMetadata;
        if (metadata.price) additionalPrice += metadata.price;
      }
    });
    
    return itemPrice + additionalPrice;
  };

  const renderCustomizationInput = (category: CustomizationCategoryResponse) => {
    const currentValue = selectedCustomizations[category.name!];

    switch (category.inputType) {
      case 'SingleSelect':
        const singleSelectMetadata = category.metadata as SingleSelectMetadata;
        return (
          <div key={category.id} className={styles.customizationGroup}>
            <label className={styles.customizationLabel}>
              {category.name}
              {category.description && <span className={styles.description}> - {category.description}</span>}
            </label>
            <div className={styles.radioGroup}>
              {singleSelectMetadata.choices.map((choice) => (
                <label key={choice.value} className={styles.radioOption}>
                  <input
                    type="radio"
                    name={`customization-${category.id}`}
                    value={choice.value}
                    checked={currentValue === choice.value}
                    onChange={(e) => handleCustomizationChange(category.name!, e.target.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>
                    {choice.label || choice.value}
                    {choice.price && choice.price > 0 && (
                      <span className={styles.priceTag}>+${choice.price.toFixed(2)}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'MultiSelect':
        const multiSelectMetadata = category.metadata as MultiSelectMetadata;
        const selectedValues = currentValue || [];
        return (
          <div key={category.id} className={styles.customizationGroup}>
            <label className={styles.customizationLabel}>
              {category.name}
              {category.description && <span className={styles.description}> - {category.description}</span>}
              {multiSelectMetadata.minSelections && (
                <span className={styles.requirement}>
                  (Select at least {multiSelectMetadata.minSelections})
                </span>
              )}
              {multiSelectMetadata.maxSelections && (
                <span className={styles.requirement}>
                  (Max {multiSelectMetadata.maxSelections})
                </span>
              )}
            </label>
            <div className={styles.checkboxGroup}>
              {multiSelectMetadata.choices.map((choice) => {
                const isDisabled = !!(multiSelectMetadata.maxSelections && 
                  selectedValues.length >= multiSelectMetadata.maxSelections && 
                  !selectedValues.includes(choice.value));
                
                return (
                  <label key={choice.value} className={`${styles.checkboxOption} ${isDisabled ? styles.disabled : ''}`}>
                    <input
                      type="checkbox"
                      value={choice.value}
                      checked={selectedValues.includes(choice.value)}
                      disabled={isDisabled}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...selectedValues, choice.value]
                          : selectedValues.filter((v: string) => v !== choice.value);
                        handleCustomizationChange(category.name!, newValues);
                      }}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxLabel}>
                      {choice.label || choice.value}
                      {choice.price && choice.price > 0 && (
                        <span className={styles.priceTag}>+${choice.price.toFixed(2)}</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'Text':
        const textMetadata = category.metadata as TextMetadata;
        return (
          <div key={category.id} className={styles.customizationGroup}>
            <label className={styles.customizationLabel}>
              {category.name}
              {category.description && <span className={styles.description}> - {category.description}</span>}
              {textMetadata.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type="text"
              placeholder={textMetadata.placeholder || `Enter ${category.name.toLowerCase()}`}
              value={currentValue || ''}
              maxLength={textMetadata.maxLength}
              onChange={(e) => handleCustomizationChange(category.name!, e.target.value)}
              className={styles.textInput}
              required={textMetadata.required}
            />
            {textMetadata.maxLength && (
              <div className={styles.charCount}>
                {(currentValue || '').length} / {textMetadata.maxLength}
              </div>
            )}
          </div>
        );

      case 'Number':
        const numberMetadata = category.metadata as NumberMetadata;
        return (
          <div key={category.id} className={styles.customizationGroup}>
            <label className={styles.customizationLabel}>
              {category.name}
              {category.description && <span className={styles.description}> - {category.description}</span>}
              {numberMetadata.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type="number"
              value={currentValue || ''}
              min={numberMetadata.min}
              max={numberMetadata.max}
              step={numberMetadata.step}
              onChange={(e) => handleCustomizationChange(category.name!, e.target.value ? parseFloat(e.target.value) : '')}
              className={styles.numberInput}
              required={numberMetadata.required}
            />
          </div>
        );

      case 'Boolean':
        const booleanMetadata = category.metadata as BooleanMetadata;
        return (
          <div key={category.id} className={styles.customizationGroup}>
            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={currentValue || booleanMetadata.defaultValue || false}
                onChange={(e) => handleCustomizationChange(category.name!, e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxLabel}>
                {category.name}
                {category.description && <span className={styles.description}> - {category.description}</span>}
                {booleanMetadata.price && booleanMetadata.price > 0 && (
                  <span className={styles.priceTag}>+${booleanMetadata.price.toFixed(2)}</span>
                )}
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  const isValid = () => {
    // Check if all required fields are filled
    return customizations.every(category => {
      const value = selectedCustomizations[category.name!];
      
      if (category.inputType === 'Text') {
        const metadata = category.metadata as TextMetadata;
        return !metadata.required || (value && value.trim());
      } else if (category.inputType === 'Number') {
        const metadata = category.metadata as NumberMetadata;
        return !metadata.required || value !== '' && value !== undefined;
      } else if (category.inputType === 'MultiSelect') {
        const metadata = category.metadata as MultiSelectMetadata;
        const selectedValues = value || [];
        return !metadata.minSelections || selectedValues.length >= metadata.minSelections;
      }
      
      return true;
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Customize {itemName}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          {customizations.length === 0 ? (
            <p className={styles.noCustomizations}>No customizations available for this item.</p>
          ) : (
            customizations.map(renderCustomizationInput)
          )}
        </div>
        
        <div className={styles.footer}>
          <div className={styles.priceDisplay}>
            <span className={styles.totalLabel}>Total: </span>
            <span className={styles.totalPrice}>${calculateTotalPrice().toFixed(2)}</span>
          </div>
          <div className={styles.actions}>
            <button onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button 
              onClick={() => onAddToCart(selectedCustomizations)} 
              className={styles.addButton}
              disabled={!isValid()}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
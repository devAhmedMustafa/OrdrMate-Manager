import { useState } from 'react';
import { Icon } from '@iconify/react';
import { 
  CustomizationChoice, 
  customizationService, 
  CustomizationMetadata,
  SingleSelectMetadata,
  MultiSelectMetadata,
  TextMetadata,
  NumberMetadata,
  BooleanMetadata
} from '../services/customizationService';
import styles from './AddCategory.module.css';
import useAuth from '../../auth/useAuth.hook';

interface AddCategoryProps {
  onCategoryCreated: () => void;
  onCancel: () => void;
}

type CategoryType = 'single-select' | 'multi-select' | 'text' | 'number' | 'boolean';

export default function AddCategory({ onCategoryCreated, onCancel }: AddCategoryProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('single-select');
  
  // For choice-based types (single-select, multi-select)
  const [choices, setChoices] = useState<CustomizationChoice[]>([{ value: '' }]);
  
  // For multi-select specific settings
  const [minSelections, setMinSelections] = useState<number | undefined>();
  const [maxSelections, setMaxSelections] = useState<number | undefined>();
  
  // For text input settings
  const [placeholder, setPlaceholder] = useState('');
  const [maxLength, setMaxLength] = useState<number | undefined>();
  
  // For number input settings
  const [minValue, setMinValue] = useState<number | undefined>();
  const [maxValue, setMaxValue] = useState<number | undefined>();
  const [step, setStep] = useState<number | undefined>();
  
  // For boolean settings
  const [defaultValue, setDefaultValue] = useState(false);
  const [price, setPrice] = useState<number | undefined>();
  
  // Common settings
  const [required, setRequired] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {restaurantId} = useAuth();

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = { value };
    setChoices(newChoices);
  };

  const addChoice = () => {
    setChoices([...choices, { value: '' }]);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 1) {
      const newChoices = choices.filter((_, i) => i !== index);
      setChoices(newChoices);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    if (!description.trim()) {
      setError('Category description is required');
      return;
    }

    let metadata: CustomizationMetadata;

    // Build metadata based on category type
    switch (categoryType) {
      case 'single-select':
        const validChoicesSingle = choices.filter(choice => choice.value.trim() !== '');
        if (validChoicesSingle.length === 0) {
          setError('At least one choice is required for single-select');
          return;
        }
        metadata = {
          type: 'single-select',
          choices: validChoicesSingle,
          required
        } as SingleSelectMetadata;
        break;

      case 'multi-select':
        const validChoicesMulti = choices.filter(choice => choice.value.trim() !== '');
        if (validChoicesMulti.length === 0) {
          setError('At least one choice is required for multi-select');
          return;
        }
        metadata = {
          type: 'multi-select',
          choices: validChoicesMulti,
          minSelections,
          maxSelections,
          required
        } as MultiSelectMetadata;
        break;

      case 'text':
        metadata = {
          type: 'text',
          placeholder: placeholder || undefined,
          maxLength,
          required
        } as TextMetadata;
        break;

      case 'number':
        metadata = {
          type: 'number',
          min: minValue,
          max: maxValue,
          step,
          required
        } as NumberMetadata;
        break;

      case 'boolean':
        metadata = {
          type: 'boolean',
          defaultValue,
          price
        } as BooleanMetadata;
        break;

      default:
        setError('Invalid category type');
        return;
    }

    setLoading(true);
    setError('');

    try {
      await customizationService.createCategory({
        name: name.trim(),
        description: description.trim(),
        restaurantId: restaurantId!,
        metadata
      });
      
      onCategoryCreated();
      
      // Reset form
      setName('');
      setDescription('');
      setCategoryType('single-select');
      setChoices([{ value: '' }]);
      setMinSelections(undefined);
      setMaxSelections(undefined);
      setPlaceholder('');
      setMaxLength(undefined);
      setMinValue(undefined);
      setMaxValue(undefined);
      setStep(undefined);
      setDefaultValue(false);
      setPrice(undefined);
      setRequired(false);
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Icon icon="mdi:plus-circle" className={styles.headerIcon} />
        <div>
          <h2>Create New Customization Category</h2>
          <p>Add a new customization category for menu items</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Category Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Size, Color, Flavor"
            className={styles.input}
            maxLength={50}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description <span className={styles.required}>*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Choose the size of your item"
            className={styles.textarea}
            rows={3}
            maxLength={200}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="categoryType" className={styles.label}>
            Category Type <span className={styles.required}>*</span>
          </label>
          <select
            id="categoryType"
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value as CategoryType)}
            className={styles.select}
          >
            <option value="single-select">Single Select (radio buttons)</option>
            <option value="multi-select">Multi Select (checkboxes)</option>
            <option value="text">Text Input</option>
            <option value="number">Number Input</option>
            <option value="boolean">Boolean (checkbox)</option>
          </select>
        </div>

        {/* Common required setting for most types */}
        {categoryType !== 'boolean' && (
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className={styles.checkbox}
              />
              This field is required
            </label>
          </div>
        )}

        {/* Choice-based types (single-select, multi-select) */}
        {(categoryType === 'single-select' || categoryType === 'multi-select') && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Choices <span className={styles.required}>*</span>
            </label>
          <p className={styles.helperText}>Add the available options for this customization</p>
          
          <div className={styles.choicesContainer}>
            {choices.map((choice, index) => (
              <div key={index} className={styles.choiceRow}>
                <input
                  type="text"
                  value={choice.value}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                  placeholder={`Option ${index + 1} (e.g., Small, Medium, Large)`}
                  className={styles.choiceInput}
                  maxLength={30}
                />
                <button
                  type="button"
                  onClick={() => removeChoice(index)}
                  disabled={choices.length === 1}
                  className={styles.removeButton}
                  title="Remove choice"
                >
                  <Icon icon="mdi:close" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addChoice}
            className={styles.addChoiceButton}
          >
            <Icon icon="mdi:plus" />
            Add Choice
          </button>
        </div>
        )}

        {/* Multi-select specific settings */}
        {categoryType === 'multi-select' && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="minSelections" className={styles.label}>
                Minimum Selections
              </label>
              <input
                type="number"
                id="minSelections"
                value={minSelections || ''}
                onChange={(e) => setMinSelections(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="maxSelections" className={styles.label}>
                Maximum Selections
              </label>
              <input
                type="number"
                id="maxSelections"
                value={maxSelections || ''}
                onChange={(e) => setMaxSelections(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="No limit"
                className={styles.input}
                min="1"
              />
            </div>
          </div>
        )}

        {/* Text input specific settings */}
        {categoryType === 'text' && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="placeholder" className={styles.label}>
                Placeholder Text
              </label>
              <input
                type="text"
                id="placeholder"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="Enter placeholder text..."
                className={styles.input}
                maxLength={50}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="maxLength" className={styles.label}>
                Maximum Length
              </label>
              <input
                type="number"
                id="maxLength"
                value={maxLength || ''}
                onChange={(e) => setMaxLength(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="No limit"
                className={styles.input}
                min="1"
              />
            </div>
          </div>
        )}

        {/* Number input specific settings */}
        {categoryType === 'number' && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="minValue" className={styles.label}>
                Minimum Value
              </label>
              <input
                type="number"
                id="minValue"
                value={minValue || ''}
                onChange={(e) => setMinValue(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="No minimum"
                className={styles.input}
                step="any"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="maxValue" className={styles.label}>
                Maximum Value
              </label>
              <input
                type="number"
                id="maxValue"
                value={maxValue || ''}
                onChange={(e) => setMaxValue(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="No maximum"
                className={styles.input}
                step="any"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="step" className={styles.label}>
                Step
              </label>
              <input
                type="number"
                id="step"
                value={step || ''}
                onChange={(e) => setStep(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="1"
                className={styles.input}
                step="any"
                min="0.01"
              />
            </div>
          </div>
        )}

        {/* Boolean specific settings */}
        {categoryType === 'boolean' && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.checked)}
                  className={styles.checkbox}
                />
                Default to checked
              </label>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.label}>
                Additional Price
              </label>
              <input
                type="number"
                id="price"
                value={price || ''}
                onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                className={styles.input}
                step="0.01"
                min="0"
              />
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <Icon icon="mdi:alert-circle" />
            {error}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <>
                <Icon icon="mdi:loading" className={styles.spinner} />
                Creating...
              </>
            ) : (
              <>
                <Icon icon="mdi:content-save" />
                Create Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

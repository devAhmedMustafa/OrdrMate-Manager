import { useEffect, useState, useMemo } from 'react';
import useAuth from '../auth/useAuth.hook';
import styles from './Menu.module.css';
import useVirtualCart from '../manual-order/useVirtualCart';
import CartItem from '../manual-order/CartItem';
import { itemService } from './services/itemService';
import { uploadService } from './services/uploadService';
import ItemCustomizationModal from './components/ItemCustomizationModal';
import { ItemDto } from './dtos/ItemDto';
import { CustomizationCategoryResponse } from '../customizations/dtos/CustomizationCategoryResponse';
import customizationService from '../customizations/services/customizationService';

interface MenuItemWithPresignedUrl extends ItemDto {
  presignedUrl: string;
  customizations?: CustomizationCategoryResponse[];
}

export default function BranchMenuPage() {
  const { restaurantId, token, branchId } = useAuth();
  const [items, setItems] = useState<MenuItemWithPresignedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Manual order cart context
  const { items: cartItems, addItem, removeItem, changeItemQuantity, placeOrder, clearCart, tableNumber, setTableNumber } = useVirtualCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemWithPresignedUrl | null>(null);

  // Keyboard shortcut to focus table number input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 't' && (event.ctrlKey || event.metaKey) && cartItems.length > 0) {
        event.preventDefault();
        const tableInput = document.getElementById('tableNumber') as HTMLInputElement;
        if (tableInput) {
          tableInput.focus();
          tableInput.select();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [cartItems.length]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!branchId || !token) return;

      try {
        const items = await itemService.getAllItems(restaurantId!);

        console.log(`Fetched ${items.length} items`);

        // Get presigned URLs and customizations for all items
        const itemsWithUrls = await Promise.all(
          items.map(async (item: ItemDto) => {
            const [presignedUrl, customizations] = await Promise.all([
              uploadService.getViewPresignedUrl(item.imageUrl),
              customizationService.getItemCustomizations(item.id).then((customizations) => {
                console.log(`Customization`, customizations );
                return customizations;
              }).catch(() => {
                console.warn(`No customizations found for item ${item.id}`);
                return [];
              })
            ]);
            return { ...item, presignedUrl, customizations };
          })
        );
        
        setItems(itemsWithUrls);
      } catch (err) {
        setError('Failed to load menu items');
        console.error('Error fetching menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [restaurantId, token]);

  async function toggleAvailability(itemId: string) {
    if (!branchId) return;
    try {
      // await itemService.toggleItemAvailability(itemId, branchId);
      setItems(prevItems => prevItems.map(item => 
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      ));
    }
    catch (err) {
      console.error('Error toggling availability:', err);
    }
  }

  const handleItemClick = async (item: MenuItemWithPresignedUrl) => {
    try {
      if (item.customizations && item.customizations.length > 0) {
        setSelectedItem(item);
        setShowCustomizationModal(true);
      } else {
        addItemToCart(item);
      }
    } catch (error) {
      console.error('Error handling item click:', error);
      // If error, just add to cart without customizations
      addItemToCart(item);
    }
  };

  const addItemToCart = (item: MenuItemWithPresignedUrl, customizations?: {[categoryName: string]: any}) => {
    const cartItem = new CartItem({ 
      itemId: item.id, 
      name: item.name, 
      price: item.price, 
      quantity: 1,
      customizations 
    });
    addItem(cartItem);
  };

  const handleCustomizationConfirm = (customizations: {[categoryName: string]: any}) => {
    if (selectedItem) {
      addItemToCart(selectedItem, customizations);
      setShowCustomizationModal(false);
      setSelectedItem(null);
    }
  };

  const handleCustomizationCancel = () => {
    setShowCustomizationModal(false);
    setSelectedItem(null);
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set(items.map(item => item.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  if (loading) {
    return <div className={styles.loading}>Loading menu items...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Menu Items</h1>
      </div>
      
      <div className={styles.categories}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`${styles.categoryButton} ${
              selectedCategory === category ? styles.categoryButtonActive : ''
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filteredItems.map((item) => {
          const inCart = cartItems.find(ci => ci.itemId === item.id);
          return (
            <div key={item.id} className={styles.card} style={{ position: 'relative' }}>
              <div className={styles.imageContainer}>
                <img 
                  src={item.presignedUrl} 
                  alt={item.name}
                  className={styles.image}
                />
                {/* Toggle availability icon button */}
                <button
                  title={item.isAvailable ? "Set unavailable" : "Set available"}
                  onClick={() => toggleAvailability(item.id)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(255,255,255,0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                >
                  {item.isAvailable ? (
                    // Green check icon
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="10" fill="#4CAF50"/>
                      <path d="M6 10.5L9 13.5L14 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    // Red cross icon
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="10" fill="#F44336"/>
                      <path d="M7 7L13 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M13 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className={styles.content}>
                <h2 className={styles.itemName}>{item.name}</h2>
                <p className={styles.description}>{item.description}</p>
                <div className={styles.details}>
                  <span className={styles.price}>${item.price.toFixed(2)}</span>
                  <span className={styles.category}>{item.category}</span>
                  {item.preparationTime > 0 && (
                    <span className={styles.prepTime}>{item.preparationTime} min</span>
                  )}
                </div>
                <div style={{ marginTop: 12 }}>
                  {!inCart ? (
                    <button
                      className={styles.addButton}
                      onClick={() => handleItemClick(item)}
                    >
                      Add to Order
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        className={styles.addButton}
                        onClick={() => changeItemQuantity(item.id, Math.max(1, inCart.quantity - 1))}
                        disabled={inCart.quantity <= 1}
                      >
                        -
                      </button>
                      <span style={{ minWidth: 24, textAlign: 'center' }}>{inCart.quantity}</span>
                      <button
                        className={styles.addButton}
                        onClick={() => changeItemQuantity(item.id, inCart.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        className={styles.addButton}
                        style={{ background: '#f44336' }}
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Virtual Cart Summary and Place Order Button */}
      {cartItems.length > 0 && (
        <div className={styles.cartSummary}>
          {/* Order Summary and Table Number Input */}
          <div className={styles.cartContent}>
            <div className={styles.orderSummary}>
              <strong>Order:</strong> {cartItems.map(ci => `${ci.name} x${ci.quantity}`).join(', ')}
              <span className={styles.totalAmount}>
                Total: ${cartItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0).toFixed(2)}
              </span>
            </div>
            
            {/* Table Number Input */}
            <div className={styles.tableNumberSection}>
              <label htmlFor="tableNumber" className={styles.tableNumberLabel}>
                Table #:
              </label>
              <input
                id="tableNumber"
                type="number"
                min="1"
                max="999"
                placeholder="Table"
                value={tableNumber || ''}
                onChange={(e) => setTableNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                className={styles.tableNumberInput}
                title="Press Ctrl+T to quickly focus this field"
                required
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className={styles.cartActions}>
            <div className={styles.buttonGroup}>
              <button
                className={styles.addButton}
                style={{ background: '#f44336' }}
                onClick={clearCart}
                disabled={placingOrder}
              >
                Clear Cart
              </button>
              <button
                className={styles.addButton}
                onClick={async () => {
                  if (!tableNumber) {
                    setOrderError('Please enter a table number');
                    return;
                  }
                  
                  setPlacingOrder(true);
                  setOrderError('');
                  setOrderSuccess(false);
                  try {
                    await placeOrder();
                    setOrderSuccess(true);
                    clearCart();
                    setTableNumber(undefined);
                  } catch (e) {
                    setOrderError('Failed to place order');
                  } finally {
                    setPlacingOrder(false);
                  }
                }}
                disabled={placingOrder || !tableNumber}
                style={{
                  opacity: !tableNumber ? 0.6 : 1,
                  cursor: !tableNumber ? 'not-allowed' : 'pointer'
                }}
              >
                {placingOrder ? 'Placing...' : 'Place Order'}
              </button>
            </div>
            
            {/* Status Messages */}
            <div className={styles.statusMessages}>
              {orderError && <span className={styles.errorMessage}>{orderError}</span>}
              {orderSuccess && <span className={styles.successMessage}>Order placed successfully!</span>}
              {!tableNumber && cartItems.length > 0 && (
                <span className={styles.warningMessage}>
                  ⚠️ Table number required
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {showCustomizationModal && selectedItem && (
        <ItemCustomizationModal
          itemId={selectedItem.id}
          itemName={selectedItem.name}
          itemPrice={selectedItem.price}
          customizations={selectedItem.customizations || []}
          onClose={handleCustomizationCancel}
          onAddToCart={handleCustomizationConfirm}
        />
      )}
    </div>
  );
} 
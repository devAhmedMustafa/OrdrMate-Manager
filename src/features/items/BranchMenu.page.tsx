import { useEffect, useState, useMemo } from 'react';
import useAuth from '../auth/useAuth.hook';
import styles from './Menu.module.css';
import useVirtualCart from '../manual-order/useVirtualCart';
import CartItem from '../manual-order/CartItem';
import { itemService, MenuItem } from './services/itemService';
import { uploadService } from './services/uploadService';

interface MenuItemWithPresignedUrl extends MenuItem {
  presignedUrl: string;
}

export default function BranchMenuPage() {
  const { pharmacyId: restaurantId, token, branchId } = useAuth();
  const [items, setItems] = useState<MenuItemWithPresignedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Manual order cart context
  const { items: cartItems, addItem, removeItem, changeItemQuantity, placeOrder, clearCart } = useVirtualCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      if (!branchId || !token) return;

      try {
        const items = await itemService.getRestaurantItems(restaurantId!);
        const availableItems = await itemService.getBranchAvailableItems(branchId);

        items.forEach((item: any) => {
          const availableItem = availableItems.find((i) => i.id === item.id);
          if (availableItem) {
            item.isAvailable = availableItem.isAvailable;
          } else {
            item.isAvailable = false;
          }
        });

        // Get presigned URLs for all items
        const itemsWithUrls = await Promise.all(
          items.map(async (item: MenuItem) => {
            const presignedUrl = await uploadService.getViewPresignedUrl(item.imageUrl);
            return { ...item, presignedUrl };
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
      await itemService.toggleItemAvailability(itemId, branchId);
      setItems(prevItems => prevItems.map(item => 
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      ));
    }
    catch (err) {
      console.error('Error toggling availability:', err);
    }
  }

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
          const inCart = cartItems.find(ci => ci.id === item.id);
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
                      onClick={() => addItem(new CartItem({ id: item.id, name: item.name, price: item.price, quantity: 1 }))}
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
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          background: '#fff',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100
        }}>
          <div>
            <strong>Order:</strong> {cartItems.map(ci => `${ci.name} x${ci.quantity}`).join(', ')}
            <span style={{ marginLeft: 16, fontWeight: 500 }}>
              Total: ${cartItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0).toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className={styles.addButton}
              style={{ background: '#f44336' }}
              onClick={clearCart}
              disabled={placingOrder}
            >
              Clear
            </button>
            <button
              className={styles.addButton}
              onClick={async () => {
                setPlacingOrder(true);
                setOrderError('');
                setOrderSuccess(false);
                try {
                  await placeOrder();
                  setOrderSuccess(true);
                  clearCart();
                } catch (e) {
                  setOrderError('Failed to place order');
                } finally {
                  setPlacingOrder(false);
                }
              }}
              disabled={placingOrder}
            >
              {placingOrder ? 'Placing...' : 'Place Order'}
            </button>
          </div>
          {orderError && <span style={{ color: '#f44336', marginLeft: 16 }}>{orderError}</span>}
          {orderSuccess && <span style={{ color: '#4caf50', marginLeft: 16 }}>Order placed!</span>}
        </div>
      )}
    </div>
  );
} 
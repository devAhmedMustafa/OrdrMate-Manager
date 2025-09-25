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

interface MenuItemWithAvailability extends MenuItemWithPresignedUrl {
  isAvailable: boolean;
  stock: number;
}

export default function BranchMenuPage() {
  const { pharmacyId, token, branchId } = useAuth();
  const [items, setItems] = useState<MenuItemWithAvailability[]>([]);
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
        const [menuItems, availabilityData] = await Promise.all([
          itemService.getPharmacyItems(pharmacyId!),
          itemService.getItemAvailability(branchId)
        ]);

        // Get presigned URLs and merge with availability data
        const itemsWithAvailability = await Promise.all(
          menuItems.map(async (item: MenuItem) => {
            const presignedUrl = await uploadService.getViewPresignedUrl(item.imageUrl);
            const availability = availabilityData.find(avail => avail.itemId === item.id);
            
            return {
              ...item,
              presignedUrl,
              isAvailable: availability?.isAvailable || false,
              stock: availability?.stock || 0
            };
          })
        );
        
        setItems(itemsWithAvailability);
      } catch (err) {
        setError('Failed to load menu items');
        console.error('Error fetching menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [pharmacyId, branchId, token]);

  async function updateQuantity(itemId: string, newStock: number) {
    if (!branchId) return;
    try {
      await itemService.updateItemQuantity(itemId, branchId, newStock);
      setItems(prevItems => prevItems.map(item => 
        item.id === itemId ? { ...item, stock: newStock, isAvailable: newStock > 0 } : item
      ));
    }
    catch (err) {
      console.error('Error updating stock quantity:', err);
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
                {/* Quantity controls */}
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 2,
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(0, item.stock - 1))}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: 1
                    }}
                    disabled={item.stock <= 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(e) => {
                      const newStock = parseInt(e.target.value) || 0;
                      updateQuantity(item.id, newStock);
                    }}
                    style={{
                      width: '40px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      textAlign: 'center',
                      fontSize: '12px',
                      background: '#fff'
                    }}
                  />
                  <button
                    onClick={() => updateQuantity(item.id, item.stock + 1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: 1
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className={styles.content}>
                
                <h2 className={styles.itemName}>{item.name}</h2>
                <p className={styles.description}>{item.description}</p>
                <div className={styles.details}>

                  <span className={styles.price}>${item.price.toFixed(2)}</span>
                  <span className={styles.category}>{item.category}</span>
                  
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
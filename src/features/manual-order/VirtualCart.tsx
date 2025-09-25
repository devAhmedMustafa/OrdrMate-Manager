import { createContext, useContext, useEffect, useState } from "react";
import useAuth from "../auth/useAuth.hook";
import CartItem from "./CartItem";
import { orderService } from "../orders/services/orderService";
import api from "../../utils/api";

interface VirtualCartContextType {
    tableNumber?: number;
    setTableNumber: (tableNumber: number | undefined) => void;
    items: CartItem[];
    placeOrder: () => Promise<void>;
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    changeItemQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
}

export const VirtualCartContext = createContext<VirtualCartContextType | undefined>(undefined);

export const VirtualCartProvider = ({ children }: { children: React.ReactNode }) => {

    const [branch, setBranch] = useState<any>(null);
    const {branchId} = useAuth();
    const [tableNumber, setTableNumber] = useState<number | undefined>(() => {
        const saved = localStorage.getItem('virtualCartTableNumber');
        return saved ? parseInt(saved) : undefined;
    });

    if (!branchId) {
        throw new Error("Branch ID is required for VirtualCartProvider");
    }

    useEffect(() => {
        const fetchBranch = async () => {
            const res = await api.get(`/Branch/get-by-id/${branchId}`);
            setBranch(res.data);
        }

        fetchBranch();
    }, [branchId]);

    const [items, setItems] = useState<CartItem[]>(localStorage.getItem('virtualCartItems') ? JSON.parse(localStorage.getItem('virtualCartItems')!) : []);
    
    const placeOrder = async () => {
        if (!tableNumber) {
            throw new Error('Table number is required to place an order');
        }
        
        if (items.length === 0) {
            throw new Error('Cannot place order with empty cart');
        }

        await orderService.placeOrder({
            branchId,
            items,
            orderType: 0,
            tableNumber,
            paymentMethod: 'cash',
            latitude: branch?.latitude,
            longitude: branch?.longitude
        });
    };

    const addItem = (item: CartItem) => {
        setItems((prevItems) => [...prevItems, item]);
    };

    const removeItem = (itemId: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.itemId !== itemId));
    };

    const changeItemQuantity = (itemId: string, quantity: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.itemId === itemId ? { ...item, quantity } : item
            )
        );
    };

    useEffect(() => {
        localStorage.setItem('virtualCartItems', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        if (tableNumber !== undefined) {
            localStorage.setItem('virtualCartTableNumber', tableNumber.toString());
        } else {
            localStorage.removeItem('virtualCartTableNumber');
        }
    }, [tableNumber]);

    const clearCart = () => {
        setItems([]);
    };

    return (
        <VirtualCartContext.Provider
            value={{
                items,
                tableNumber,
                setTableNumber,
                placeOrder,
                addItem,
                removeItem,
                changeItemQuantity,
                clearCart,
            }}
        >
            {children}
        </VirtualCartContext.Provider>
    );
};

export const useVirtualCart = () => {
    const context =  useContext(VirtualCartContext);
    if (!context) {
        throw new Error("useVirtualCart must be used within a VirtualCartProvider");
    }
    return context;
};
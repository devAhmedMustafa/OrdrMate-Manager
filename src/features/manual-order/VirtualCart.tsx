import { createContext, useContext, useEffect, useState } from "react";
import useAuth from "../auth/useAuth.hook";
import CartItem from "./CartItem";
import { orderService } from "../orders/services/orderService";

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

    const {branchId} = useAuth();
    const [tableNumber, setTableNumber] = useState<number | undefined>(undefined);

    if (!branchId) {
        throw new Error("Branch ID is required for VirtualCartProvider");
    }

    const [items, setItems] = useState<CartItem[]>(localStorage.getItem('virtualCartItems') ? JSON.parse(localStorage.getItem('virtualCartItems')!) : []);
    
    const placeOrder = async () => {
        orderService.placeOrder({
            branchId,
            items,
            orderType: 1,
            tableNumber
        });
    };

    const addItem = (item: CartItem) => {
        setItems((prevItems) => [...prevItems, item]);
    };

    const removeItem = (itemId: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    };

    const changeItemQuantity = (itemId: string, quantity: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    useEffect(() => {
        localStorage.setItem('virtualCartItems', JSON.stringify(items));
    }, [items]);

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
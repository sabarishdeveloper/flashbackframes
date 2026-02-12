import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                // Note: File objects cannot be saved in localStorage.
                // We'll only save metadata and handle re-uploading if needed,
                // or just accept that images are lost on refresh for now (rare case).
                // Actually, let's keep the images in state and only save IDs to localStorage.
                const items = JSON.parse(savedCart);
                setCartItems(items);
            } catch (e) {
                console.error('Failed to parse cart:', e);
            }
        }
    }, []);

    // Save cart to localStorage (without File objects)
    useEffect(() => {
        const itemsToSave = cartItems.map(item => ({
            ...item,
            imageFile: null // Can't save File object
        }));
        localStorage.setItem('cart', JSON.stringify(itemsToSave));
    }, [cartItems]);

    const addToCart = (product, details, imageFile) => {
        setCartItems(prev => {
            // Unique ID for cart item (since same product can have different configurations)
            const cartId = Date.now() + Math.random().toString(36).substr(2, 9);
            return [...prev, {
                cartId,
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0], // Preview image
                size: details.size,
                material: details.material,
                quantity: details.quantity || 1,
                imageFile: imageFile // This is the user-uploaded file (File object)
            }];
        });
    };

    const removeFromCart = (cartId) => {
        setCartItems(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, quantity) => {
        setCartItems(prev => prev.map(item =>
            item.cartId === cartId ? { ...item, quantity: Math.max(1, quantity) } : item
        ));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// IndexedDB Constants & Utils
const IDB_NAME = 'FlashbackFramesCart';
const STORE_NAME = 'itemImages';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

const saveFile = async (cartId, file) => {
    if (!file) return;
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(file, cartId);
    } catch (err) {
        console.error('IDB Save Error:', err);
    }
};

const getFile = async (cartId) => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(cartId);
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    } catch (err) {
        console.error('IDB Get Error:', err);
        return null;
    }
};

const deleteFile = async (cartId) => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(cartId);
    } catch (err) {
        console.error('IDB Delete Error:', err);
    }
};

const clearIDB = async () => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
    } catch (err) {
        console.error('IDB Clear Error:', err);
    }
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Initial load from localStorage and IndexedDB
    useEffect(() => {
        const loadCart = async () => {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                try {
                    const items = JSON.parse(savedCart);
                    // Re-link File objects from IndexedDB
                    const hydratedItems = await Promise.all(items.map(async (item) => {
                        const file = await getFile(item.cartId);
                        return { ...item, imageFile: file };
                    }));
                    setCartItems(hydratedItems);
                } catch (e) {
                    console.error('Failed to parse cart:', e);
                }
            }
            setIsHydrated(true);
        };
        loadCart();
    }, []);

    // Save metadata to localStorage when items change
    useEffect(() => {
        if (!isHydrated) return;

        const itemsToSave = cartItems.map(item => {
            const { imageFile, ...metadata } = item;
            return metadata;
        });
        localStorage.setItem('cart', JSON.stringify(itemsToSave));
    }, [cartItems, isHydrated]);

    const addToCart = async (product, details, imageFile) => {
        const cartId = Date.now() + Math.random().toString(36).substr(2, 9);

        // Save file to IndexedDB
        if (imageFile) {
            await saveFile(cartId, imageFile);
        }

        setCartItems(prev => [...prev, {
            cartId,
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0],
            size: details.size,
            material: details.material,
            artStyle: details.artStyle || 'Normal (Original)',
            quantity: details.quantity || 1,
            personalMessage: details.personalMessage || '',
            instructions: details.instructions || '',
            imageFile: imageFile
        }]);
    };

    const removeFromCart = async (cartId) => {
        await deleteFile(cartId);
        setCartItems(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, quantity) => {
        setCartItems(prev => prev.map(item =>
            item.cartId === cartId ? { ...item, quantity: Math.max(1, quantity) } : item
        ));
    };

    const clearCart = async () => {
        setCartItems([]);
        localStorage.removeItem('cart');
        await clearIDB();
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
            getCartCount,
            isHydrated
        }}>
            {children}
        </CartContext.Provider>
    );
};

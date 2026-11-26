import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Product } from './components/Product';
import { Cart } from './components/Cart';
import { Wishlist } from './components/Wishlist';
import { Notification } from './components/Notification';
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';
import { useWishlist } from './hooks/useWishlist';
import { useOrders } from './hooks/useOrders';
import { useCheckout } from './hooks/useCheckout';

export default function App() {
    const [notification, setNotification] = useState('');
    const notifyTimerRef = useRef(null);

    const notify = useCallback((message) => {
        setNotification(message);
        clearTimeout(notifyTimerRef.current);
        notifyTimerRef.current = setTimeout(() => {
            setNotification('');
        }, 2800);
    }, []);

    const {
        productMap,
        filteredProducts,
        search,
        setSearch,
        category,
        setCategory,
        sort,
        setSort,
        selectedProduct,
        setSelectedProduct
    } = useProducts();

    const {
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    } = useCart(productMap, notify);

    const {
        wishlist,
        isOpen: isWishlistOpen,
        openWishlist,
        closeWishlist,
        toggleWishlist,
        isWishlisted
    } = useWishlist(productMap);

    const { isPlacing, placeOrder } = useOrders();

    const {
        address,
        isCheckoutOpen,
        isAddressOpen,
        openCheckout,
        closeCheckout,
        openAddressModal,
        closeAddressModal,
        validateAddress,
        saveAddress,
        handlePlaceOrder
    } = useCheckout({
        cart,
        cartCount,
        cartTotal,
        clearCart,
        placeOrder,
        notify
    });

    const hasOpenModal = isWishlistOpen || Boolean(selectedProduct) || isCheckoutOpen || isAddressOpen;

    useEffect(() => {
        document.body.style.overflow = hasOpenModal ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [hasOpenModal]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeWishlist();
                setSelectedProduct(null);
                closeCheckout();
                closeAddressModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeWishlist, setSelectedProduct, closeCheckout, closeAddressModal]);

    return (
        <>
            <Navbar wishlistCount={wishlist.length} onOpenWishlist={openWishlist} />

            <Wishlist
                wishlist={wishlist}
                productMap={productMap}
                isOpen={isWishlistOpen}
                onClose={closeWishlist}
                onRemove={toggleWishlist}
            />

            <section className="hero" id="home">
                <div className="container hero-content">
                    <div className="hero-text">
                        <p className="subtitle">NEW COLLECTION 2026</p>
                        <h1 id="hero-title">Discover Products</h1>
                        <p className="hero-description">
                            Explore premium products at amazing prices.
                            Find everything you need in one place.
                        </p>
                        <a href="#products" className="primary-button">
                            Shop Now →
                        </a>
                    </div>

                    <div className="hero-image">
                        <img
                            src="https://images.unsplash.com/photo-1590643924142-b1b492f1dddc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
                            srcSet="
                                https://images.unsplash.com/photo-1590643924142-b1b492f1dddc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D 640w,
                                https://images.unsplash.com/photo-1590643924142-b1b492f1dddc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D 960w,
                                https://images.unsplash.com/photo-1590643924142-b1b492f1dddc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D 1200w"
                            sizes="(max-width: 900px) 90vw, (max-width: 1200px) 45vw, 575px"
                            width="960"
                            height="640"
                            fetchPriority="high"
                            alt="Featured collection"
                        />
                    </div>
                </div>
            </section>

            <section className="features container">
                <div className="feature">
                    <div>
                        <h3>Free Delivery</h3>
                        <p>On orders above ₹999</p>
                    </div>
                </div>
                <div className="feature">
                    <div>
                        <h3>Secure Payment</h3>
                        <p>Safe transactions</p>
                    </div>
                </div>
                <div className="feature">
                    <div>
                        <h3>Easy Returns</h3>
                        <p>7-day return policy</p>
                    </div>
                </div>
            </section>

            <Product
                products={filteredProducts}
                search={search}
                onSearchChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                sort={sort}
                onSortChange={setSort}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted}
            />

            <Cart
                cart={cart}
                productMap={productMap}
                cartTotal={cartTotal}
                onUpdateQuantity={updateQuantity}
                onRemoveFromCart={removeFromCart}
                address={address}
                isCheckoutOpen={isCheckoutOpen}
                isAddressOpen={isAddressOpen}
                onOpenCheckout={openCheckout}
                onCloseCheckout={closeCheckout}
                onOpenAddress={openAddressModal}
                onCloseAddress={closeAddressModal}
                validateAddress={validateAddress}
                onSaveAddress={saveAddress}
                onPlaceOrder={handlePlaceOrder}
                isPlacing={isPlacing}
            />

            <Notification message={notification} />

            <footer className="footer" id="contact">
                <div className="container footer-content">
                    <div>
                        <h3>Pettikadai</h3>
                        <p>Your one-stop destination for online shopping.</p>
                    </div>
                    <div>
                        <h3>Quick Links</h3>
                        <a href="#home">Home</a>
                        <a href="#products">Products</a>
                        <a href="#about">About Us</a>
                    </div>
                    <div>
                        <h3>Contact</h3>
                        <p>Email: support@shopease.com</p>
                        <p>Phone: +91 98765 43210</p>
                    </div>
                </div>
                <div className="copyright">
                    <p>© 2026 Pettikadai. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
}

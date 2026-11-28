import { useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Navbar } from './components/Navbar';
import { Product } from './components/user/Product';
import { FeaturedProducts } from './components/user/FeaturedProducts';
import { Cart } from './components/user/Cart';
import { Wishlist } from './components/user/Wishlist';
import { WishlistPage } from './components/user/WishlistPage';
import { CheckoutPage } from './components/user/CheckoutPage';
import { Orders } from './components/user/Orders';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/admin/Dashboard';
import { ProductManager } from './components/admin/ProductManager';
import { UserMonitor } from './components/admin/UserMonitor';
import { OrderApproval } from './components/admin/OrderApproval';
import { Notification } from './components/Notification';
import { useAuth } from './hooks/useAuth';
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';
import { useWishlist } from './hooks/useWishlist';
import { useOrders } from './hooks/useOrders';
import { useCheckout } from './hooks/useCheckout';

export default function App() {
    const notify = useCallback((message) => {
        if (message) toast(message);
    }, []);

    const { user, isAuthenticated, isAdmin } = useAuth();
    const canShop = isAuthenticated && !isAdmin;

    const {
        products,
        productMap,
        featuredProducts,
        filteredProducts,
        search,
        setSearch,
        category,
        setCategory,
        sort,
        setSort,
        selectedProduct,
        setSelectedProduct,
        refreshProducts,
        setProductFeaturedLocal
    } = useProducts();

    const {
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    } = useCart(productMap, notify, canShop);

    const {
        wishlist,
        isOpen: isWishlistOpen,
        openWishlist,
        closeWishlist,
        toggleWishlist,
        isWishlisted
    } = useWishlist(notify, canShop);

    const { orders, loading: ordersLoading, isPlacing, placeOrder, fetchOrders } = useOrders();

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
        notify,
        isAuthenticated: canShop,
        userId: user?.id ?? null
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

    const StorefrontView = isAdmin ? (
        <Navigate to="/admin/dashboard" replace />
    ) : (
        <>
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

            <FeaturedProducts
                products={featuredProducts}
                onSelectProduct={setSelectedProduct}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted}
            />

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
        </>
    );

    return (
        <>
            <Navbar
                wishlistCount={wishlist.length}
                cartCount={cartCount}
                onOpenWishlist={openWishlist}
                notify={notify}
            />

            {!isAdmin && (
                <Wishlist
                    wishlist={wishlist}
                    productMap={productMap}
                    isOpen={isWishlistOpen}
                    onClose={closeWishlist}
                    onRemove={toggleWishlist}
                />
            )}

            <main>
                <Routes>
                    <Route path="/" element={StorefrontView} />
                    <Route path="/login" element={<Login notify={notify} />} />
                    <Route path="/register" element={<Register notify={notify} />} />

                    {/* Customer-only routes */}
                    <Route
                        path="/wishlist"
                        element={
                            <ProtectedRoute requiredRole="user">
                                <WishlistPage
                                    wishlist={wishlist}
                                    productMap={productMap}
                                    onRemove={toggleWishlist}
                                    onAddToCart={addToCart}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute requiredRole="user">
                                <CheckoutPage
                                    cart={cart}
                                    productMap={productMap}
                                    cartTotal={cartTotal}
                                    address={address}
                                    onSaveAddress={saveAddress}
                                    placeOrder={placeOrder}
                                    clearCart={clearCart}
                                    isPlacing={isPlacing}
                                    notify={notify}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute requiredRole="user">
                                <Orders
                                    orders={orders}
                                    loading={ordersLoading}
                                    fetchOrders={fetchOrders}
                                />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin-only routes (Dashboard, Products, Users, Orders) */}
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/products"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <ProductManager
                                    products={products}
                                    refreshProducts={refreshProducts}
                                    setProductFeaturedLocal={setProductFeaturedLocal}
                                    notify={notify}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <UserMonitor />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/orders"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <OrderApproval notify={notify} />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>

            <Notification />

            <footer className="footer" id="contact">
                <div className="container footer-content">
                    <div>
                        <h3>Pettikadai</h3>
                        <p>Your one-stop destination for online shopping.</p>
                    </div>
                    <div>
                        <h3>Quick Links</h3>
                        {isAdmin ? (
                            <>
                                <a href="/admin/dashboard">Dashboard</a>
                                <a href="/admin/products">Products</a>
                                <a href="/admin/users">Users</a>
                                <a href="/admin/orders">Orders</a>
                            </>
                        ) : (
                            <>
                                <a href="/#home">Home</a>
                                <a href="/#products">Products</a>
                                <a href="/#about">About Us</a>
                            </>
                        )}
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

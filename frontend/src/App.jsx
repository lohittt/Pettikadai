import { useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Truck, ShieldCheck, RotateCcw, ArrowRight, ShoppingBag, Smartphone, Shirt, Watch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const CATEGORY_TILES = [
    { key: 'All', label: 'All Products', icon: ShoppingBag, tone: 'bg-primary-soft text-on-primary-soft' },
    { key: 'Electronics', label: 'Electronics', icon: Smartphone, tone: 'bg-secondary-soft text-secondary' },
    { key: 'Fashion', label: 'Fashion', icon: Shirt, tone: 'bg-accent-soft text-destructive' },
    { key: 'Accessories', label: 'Accessories', icon: Watch, tone: 'bg-primary-soft text-on-primary-soft' }
];

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

    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const target = document.getElementById(hash.slice(1));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname, hash]);

    const StorefrontView = isAdmin ? (
        <Navigate to="/admin/dashboard" replace />
    ) : (
        <>
            {/* Two-Column Hero */}
            <section className="container pt-10 pb-12 lg:pt-14 lg:pb-16" id="home">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="flex flex-col items-start gap-5 lg:col-span-6">
                        <Badge
                            variant="outline"
                            className="rounded-full bg-card px-3.5 py-1 text-xs font-semibold tracking-wide text-muted-foreground"
                        >
                            NEW ARRIVALS 2026
                        </Badge>
                        <h1
                            id="hero-title"
                            className="font-headline text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl"
                        >
                            Your Village Shop, Now Online
                        </h1>
                        <p className="max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
                            Fresh essentials, curated collections and everyday favourites, just like the pettikadai near your home.
                        </p>
                        <Button
                            size="lg"
                            className="rounded-full px-7 py-6 text-sm font-semibold shadow-sm hover:bg-secondary"
                            render={<Link to="/#featured" />}
                        >
                            Shop Now
                            <ArrowRight data-icon="inline-end" />
                        </Button>
                    </div>

                    <div className="lg:col-span-6">
                        <div className="rounded-2xl border border-border bg-card p-2 shadow-sm">
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
                                alt="Pettikadai featured collection"
                                className="aspect-[4/3] w-full rounded-xl object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3-Column Feature Strip */}
            <section aria-label="Store promises" className="border-t border-border">
                <div className="container grid grid-cols-1 gap-5 py-8 md:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-4 py-5">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                                <Truck className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                                    Free Delivery
                                </h2>
                                <p className="text-xs text-muted-foreground">On orders above ₹999</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 py-5">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                                    Secure Payment
                                </h2>
                                <p className="text-xs text-muted-foreground">Safe transactions</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 py-5">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                                <RotateCcw className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                                    Easy Returns
                                </h2>
                                <p className="text-xs text-muted-foreground">7-day return policy</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Shop by Category */}
            <section id="categories" className="container py-10">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="font-headline text-3xl font-bold text-foreground">Shop by Category</h2>
                        <p className="text-sm text-muted-foreground">
                            Everyday favourites stocked fresh from our counter
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {CATEGORY_TILES.map((tile) => {
                        const Icon = tile.icon;
                        const active = category === tile.key;
                        return (
                            <Link
                                key={tile.key}
                                to="/#products"
                                onClick={() => setCategory(tile.key)}
                                className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border p-5 text-center transition-colors duration-150 ${
                                    active
                                        ? 'border-primary bg-surface-container shadow-xs'
                                        : 'border-border bg-card hover:bg-surface-container'
                                }`}
                            >
                                <div className={`flex size-12 items-center justify-center rounded-full ${tile.tone}`}>
                                    <Icon className="size-5" />
                                </div>
                                <span className="text-sm font-semibold text-foreground">{tile.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <div className="container" aria-hidden="true">
                <div className="h-px bg-border" />
            </div>

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

    const CatalogPage = isAdmin ? (
        <Navigate to="/admin/dashboard" replace />
    ) : (
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
    );

    return (
        <div className="flex min-h-screen flex-col">
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

            <main className="flex-1">
                <Routes>
                    <Route path="/" element={StorefrontView} />
                    <Route path="/products" element={CatalogPage} />
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
                    <Route path="*" element={<Navigate to={isAdmin ? '/admin/dashboard' : '/'} replace />} />
                </Routes>
            </main>

            <Notification />

            <footer id="contact" className="mt-8 border-t border-border bg-card">
                <div className="container py-10">
                    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-3">
                        <div className="flex flex-col gap-3">
                            <Link
                                to={isAdmin ? '/admin/dashboard' : '/'}
                                className="inline-block w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label="Pettikadai Home"
                            >
                                <img
                                    src="/pettikadai-logo.png"
                                    alt="Pettikadai"
                                    className="h-20 w-auto object-contain mix-blend-multiply sm:h-24"
                                />
                            </Link>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                12, Bazaar Street, Mylapore, Chennai 600004
                                <br />
                                +91 98400 12345 · hello@pettikadai.in
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-center">
                            {isAdmin ? (
                                <>
                                    <Link to="/admin/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                        Dashboard
                                    </Link>
                                    <Link to="/admin/products" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                        Products
                                    </Link>
                                    <Link to="/admin/users" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                        Users
                                    </Link>
                                    <Link to="/admin/orders" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                        Orders
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                        Home
                                    </Link>
                                    <Link to="/#featured" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                        Featured
                                    </Link>
                                    <Link to="/products" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                        Products
                                    </Link>
                                    <Link to="/#contact" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                        Contact
                                    </Link>
                                    <Link to="/orders" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                        Orders
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 md:text-right">
                            <p className="text-base font-semibold text-secondary">Thank you, visit again!</p>
                            <p className="text-xs text-muted-foreground">© 2026 Pettikadai</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

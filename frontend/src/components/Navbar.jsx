import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navbar({ wishlistCount, cartCount, onOpenWishlist, notify }) {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
        if (notify) notify('Logged out successfully');
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container navbar">
                <Link to={isAdmin ? '/admin/products' : '/'} className="navbar-brand">
                    {isAdmin ? 'Pettikadai Admin' : 'Pettikadai'}
                </Link>

                <nav className="nav-links" aria-label="Main navigation">
                    {isAdmin ? (
                        <ul className="nav-list">
                            <li>
                                <NavLink to="/admin/products">Products</NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/users">Users</NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/orders">Orders</NavLink>
                            </li>
                        </ul>
                    ) : (
                        <ul className="nav-list">
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <a href="/#products">Products</a>
                            </li>
                            <li>
                                <a href="/#contact">Contact</a>
                            </li>
                            <li>
                                <a href="/#cart" className="cart-link">
                                    Cart{cartCount > 0 ? ` (${cartCount})` : ''}
                                </a>
                            </li>
                            {isAuthenticated && (
                                <li>
                                    <NavLink to="/orders">Orders</NavLink>
                                </li>
                            )}
                        </ul>
                    )}
                </nav>

                <div className="navbar-right">
                    {!isAdmin && (
                        <button
                            className="navbar-wishlist"
                            id="wishlist-button"
                            type="button"
                            aria-haspopup="dialog"
                            aria-controls="wishlist-modal"
                            aria-label={`Wishlist${wishlistCount ? ` (${wishlistCount})` : ''}`}
                            onClick={onOpenWishlist}
                        >
                            <span className="wishlist-heart">♥</span>
                        </button>
                    )}

                    <div className="account-toggle" ref={menuRef}>
                        {isAuthenticated ? (
                            <>
                                <button
                                    type="button"
                                    className="account-toggle-btn"
                                    aria-expanded={menuOpen}
                                    onClick={() => setMenuOpen((prev) => !prev)}
                                >
                                    <span>{user.name}</span>
                                    {isAdmin && <span className="role-badge role-admin">Admin</span>}
                                    <span className="caret">▾</span>
                                </button>
                                {menuOpen && (
                                    <div className="account-dropdown" role="menu">
                                        {!isAdmin && (
                                            <>
                                                <Link to="/orders" onClick={() => setMenuOpen(false)} role="menuitem">
                                                    My Orders
                                                </Link>
                                                <Link to="/wishlist" onClick={() => setMenuOpen(false)} role="menuitem">
                                                    Wishlist ({wishlistCount})
                                                </Link>
                                                <Link to="/checkout" onClick={() => setMenuOpen(false)} role="menuitem">
                                                    Checkout
                                                </Link>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            className="dropdown-logout"
                                            onClick={handleLogout}
                                            role="menuitem"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="auth-nav-links">
                                <Link to="/login" className="nav-login-btn">
                                    Login
                                </Link>
                                <Link to="/register" className="nav-register-btn">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

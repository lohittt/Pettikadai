import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Heart, ChevronDown, LogOut, ShoppingBag, ShoppingCart, Package, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function Navbar({ wishlistCount, cartCount, onOpenWishlist, notify }) {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const { pathname, hash } = useLocation();

    const handleLogout = async () => {
        setMobileOpen(false);
        await logout();
        if (notify) notify('Logged out successfully');
        navigate('/');
    };

    const linkStyle = (active) =>
        `text-base font-semibold transition-colors duration-150 hover:text-foreground ${
            active
                ? 'text-foreground border-b-2 border-primary pb-0.5'
                : 'text-muted-foreground'
        }`;

    const navLinkClass = ({ isActive }) => linkStyle(isActive);

    const customerLinks = [
        { to: '/', label: 'Home', active: pathname === '/' && !hash },
        { to: '/#featured', label: 'Featured', active: pathname === '/' && hash === '#featured' },
        { to: '/products', label: 'Products', active: pathname === '/products' },
        { to: '/#contact', label: 'Contact', active: hash === '#contact' },
        ...(isAuthenticated
            ? [{ to: '/orders', label: 'Orders', active: pathname === '/orders' }]
            : [])
    ];

    const adminLinks = [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/products', label: 'Products' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/orders', label: 'Orders' }
    ];

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-card shadow-xs">
            <div className="container flex h-20 items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-lg"
                        className="md:hidden"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((prev) => !prev)}
                    >
                        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>

                    <Link
                        to={isAdmin ? '/admin/dashboard' : '/'}
                        className="inline-flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={isAdmin ? 'Pettikadai Admin Home' : 'Pettikadai Home'}
                    >
                        <img
                            src="/pettikadai-logo.png"
                            alt="Pettikadai"
                            className="h-14 w-auto object-contain mix-blend-multiply sm:h-16"
                        />
                        {isAdmin && (
                            <Badge variant="outline" className="rounded-full bg-background text-[11px] font-semibold">
                                Admin
                            </Badge>
                        )}
                    </Link>
                </div>

                <nav aria-label="Main navigation" className="hidden md:block">
                    <ul className="flex items-center gap-8">
                        {isAdmin
                            ? adminLinks.map((item) => (
                                  <li key={item.to}>
                                      <NavLink to={item.to} className={navLinkClass}>
                                          {item.label}
                                      </NavLink>
                                  </li>
                              ))
                            : customerLinks.map((item) => (
                                  <li key={item.to}>
                                      <Link to={item.to} className={linkStyle(item.active)}>
                                          {item.label}
                                      </Link>
                                  </li>
                              ))}
                    </ul>
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    {!isAdmin && (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                id="wishlist-button"
                                aria-haspopup="dialog"
                                aria-controls="wishlist-modal"
                                aria-label={`Wishlist${wishlistCount ? ` (${wishlistCount})` : ''}`}
                                onClick={onOpenWishlist}
                                className="h-10 gap-1.5 rounded-full px-3 hover:bg-surface-container text-destructive"
                            >
                                <Heart className={`size-5 ${wishlistCount > 0 ? 'fill-destructive text-destructive' : 'text-destructive'}`} />
                                {wishlistCount > 0 && (
                                    <span className="text-sm font-semibold text-foreground tabular-nums">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                id="cart-button"
                                render={<Link to="/#cart" />}
                                aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ''}`}
                                className="h-10 gap-1.5 rounded-full px-3 hover:bg-surface-container text-foreground"
                            >
                                <ShoppingCart className="size-5" />
                                {cartCount > 0 && (
                                    <span className="text-sm font-semibold text-foreground tabular-nums">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                        </>
                    )}

                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        className="h-10 gap-2 rounded-full bg-card px-4 hover:bg-surface-container"
                                    >
                                        <span className="max-w-28 truncate text-sm font-semibold">{user.name}</span>
                                        {isAdmin && (
                                            <Badge variant="default" className="rounded-full px-2 py-0 text-[10px]">
                                                Admin
                                            </Badge>
                                        )}
                                        <ChevronDown data-icon="inline-end" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-52 bg-popover text-popover-foreground">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                {!isAdmin ? (
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => navigate('/orders')}>
                                            <Package data-icon="inline-start" />
                                            My Orders
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                                            <Heart data-icon="inline-start" />
                                            Wishlist ({wishlistCount})
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/checkout')}>
                                            <ShoppingBag data-icon="inline-start" />
                                            Checkout
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                ) : (
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                                            <Shield data-icon="inline-start" />
                                            Dashboard
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                    <LogOut data-icon="inline-start" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-10 rounded-full bg-card px-4 hover:bg-surface-container"
                                render={<Link to="/login" />}
                            >
                                Login
                            </Button>
                            <Button
                                size="lg"
                                className="h-10 rounded-full px-5 hover:bg-secondary"
                                render={<Link to="/register" />}
                            >
                                Register
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {mobileOpen && (
                <div className="border-t border-border bg-card px-4 py-4 md:hidden">
                    <nav aria-label="Mobile navigation" className="flex flex-col gap-3">
                        {isAdmin
                            ? adminLinks.map((item) => (
                                  <NavLink
                                      key={item.to}
                                      to={item.to}
                                      className={navLinkClass}
                                      onClick={() => setMobileOpen(false)}
                                  >
                                      {item.label}
                                  </NavLink>
                              ))
                            : customerLinks.map((item) => (
                                  <Link
                                      key={item.to}
                                      to={item.to}
                                      className={`py-1 ${linkStyle(item.active)}`}
                                      onClick={() => setMobileOpen(false)}
                                  >
                                      {item.label}
                                  </Link>
                              ))}
                    </nav>
                </div>
            )}
        </header>
    );
}

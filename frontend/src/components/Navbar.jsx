import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, ChevronDown, LogOut, ShoppingBag, Package, Shield } from 'lucide-react';
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
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        if (notify) notify('Logged out successfully');
        navigate('/');
    };

    const navLinkClass = ({ isActive }) =>
        `text-sm font-semibold transition-colors hover:text-foreground ${
            isActive ? 'text-foreground underline underline-offset-4' : 'text-muted-foreground'
        }`;

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="container flex min-h-[70px] items-center justify-between gap-4 py-3">
                <Link
                    to={isAdmin ? '/admin/dashboard' : '/'}
                    className="text-xl font-bold tracking-tight text-foreground"
                >
                    {isAdmin ? 'Pettikadai Admin' : 'Pettikadai'}
                </Link>

                <nav aria-label="Main navigation">
                    {isAdmin ? (
                        <ul className="flex items-center gap-6">
                            <li>
                                <NavLink to="/admin/dashboard" className={navLinkClass}>
                                    Dashboard
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/products" className={navLinkClass}>
                                    Products
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/users" className={navLinkClass}>
                                    Users
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/orders" className={navLinkClass}>
                                    Orders
                                </NavLink>
                            </li>
                        </ul>
                    ) : (
                        <ul className="flex items-center gap-6">
                            <li>
                                <Link to="/" className="text-sm font-semibold text-foreground hover:underline underline-offset-4">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <a href="/#products" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                    Products
                                </a>
                            </li>
                            <li>
                                <a href="/#contact" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="/#cart" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                                    Cart{cartCount > 0 ? ` (${cartCount})` : ''}
                                </a>
                            </li>
                            {isAuthenticated && (
                                <li>
                                    <NavLink to="/orders" className={navLinkClass}>
                                        Orders
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {!isAdmin && (
                        <Button
                            variant="ghost"
                            size="icon"
                            id="wishlist-button"
                            aria-haspopup="dialog"
                            aria-controls="wishlist-modal"
                            aria-label={`Wishlist${wishlistCount ? ` (${wishlistCount})` : ''}`}
                            onClick={onOpenWishlist}
                            className="relative"
                        >
                            <Heart className={wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-red-500'} />
                            {wishlistCount > 0 && (
                                <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
                                    {wishlistCount}
                                </Badge>
                            )}
                        </Button>
                    )}

                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <span>{user.name}</span>
                                        {isAdmin && <Badge variant="default">Admin</Badge>}
                                        <ChevronDown data-icon="inline-end" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
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
                            <Button variant="outline" size="sm" render={<Link to="/login" />}>
                                Login
                            </Button>
                            <Button size="sm" render={<Link to="/register" />}>
                                Register
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

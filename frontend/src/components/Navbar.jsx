export function Navbar({ wishlistCount, onOpenWishlist }) {
    return (
        <header className="header">
            <div className="container navbar">
                <nav className="nav-links" aria-label="Main navigation">
                    <ul className="nav-list">
                        <li>
                            <a href="#home">Home</a>
                        </li>
                        <li>
                            <a href="#products">Products</a>
                        </li>
                        <li>
                            <a href="#contact">Contact</a>
                        </li>
                        <li>
                            <a href="#cart" className="cart-link">
                                Cart
                            </a>
                        </li>
                        <li>
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
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

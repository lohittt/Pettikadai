import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/format';

export function WishlistPage({ wishlist, productMap, onRemove, onAddToCart }) {
    const items = wishlist.map((id) => productMap.get(id)).filter(Boolean);

    return (
        <section className="page-section container">
            <div className="section-heading">
                <div>
                    <p className="subtitle">SAVED ITEMS</p>
                    <h2>My Wishlist ♥</h2>
                </div>
                <Link to="/" className="checkout-action">
                    ← Continue Shopping
                </Link>
            </div>

            {items.length === 0 ? (
                <div className="empty-state">
                    <h3>Your wishlist is empty</h3>
                    <p>Save products you love while browsing the store.</p>
                    <Link to="/" className="primary-button" style={{ marginTop: '16px' }}>
                        Browse Products →
                    </Link>
                </div>
            ) : (
                <div className="product-grid">
                    {items.map((product) => (
                        <div className="product-card" key={product.id}>
                            <div className="product-image">
                                <img src={product.image} alt={product.name} />
                            </div>
                            <div className="product-info">
                                <span className="product-category">{product.brand}</span>
                                <h3>{product.name}</h3>
                                <p className="product-price">{formatINR(product.price)}</p>
                                <div className="product-buttons">
                                    <button
                                        className="add-to-cart"
                                        type="button"
                                        onClick={() => onAddToCart(product.id)}
                                    >
                                        Move to Cart
                                    </button>
                                    <button
                                        className="add-to-wishlist active"
                                        type="button"
                                        title="Remove from Wishlist"
                                        onClick={() => onRemove(product.id)}
                                    >
                                        ♥
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

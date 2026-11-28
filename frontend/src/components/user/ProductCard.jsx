import { formatINR } from '../../utils/format';

export function ProductCard({
    product,
    wishlisted,
    onSelectProduct,
    onAddToCart,
    onToggleWishlist
}) {
    return (
        <div
            className="product-card"
            data-product-id={product.id}
            data-category={product.category}
            data-price={product.price}
            tabIndex={0}
            role="group"
            aria-label={`View details for ${product.name}`}
            onClick={(e) => {
                if (!e.target.closest('.add-to-cart') && !e.target.closest('.add-to-wishlist')) {
                    onSelectProduct(product);
                }
            }}
            onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectProduct(product);
                }
            }}
        >
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
                        Add to Cart
                    </button>
                    <button
                        className={`add-to-wishlist${wishlisted ? ' active' : ''}`}
                        type="button"
                        title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        aria-pressed={wishlisted}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleWishlist(product.id);
                        }}
                    >
                        {wishlisted ? '♥' : '♡'}
                    </button>
                </div>
            </div>
        </div>
    );
}

import { formatINR } from '../../utils/format';

export function Wishlist({ wishlist, productMap, isOpen, onClose, onRemove }) {
    const items = wishlist.map((id) => productMap.get(id)).filter(Boolean);
    const isEmpty = items.length === 0;

    return (
        <div
            className={`wishlist-overlay${isOpen ? ' active' : ''}`}
            id="wishlist-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishlist-title"
            aria-hidden={String(!isOpen)}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="wishlist-modal">
                <div className="wishlist-header">
                    <div>
                        <h2 id="wishlist-title">My Wishlist ♥</h2>
                        <p>Your favourite products in one place.</p>
                    </div>
                    <button
                        className="close-wishlist"
                        id="close-wishlist"
                        type="button"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="wishlist-products" id="wishlist-products" hidden={isEmpty}>
                    {items.map((product) => (
                        <div className="wishlist-product" key={product.id} data-product-id={product.id}>
                            <img src={product.image} alt={product.name} />
                            <div className="wishlist-product-info">
                                <h3>{product.name}</h3>
                                <p>{product.brand}</p>
                                <strong>{formatINR(product.price)}</strong>
                            </div>
                            <button
                                className="remove-wishlist"
                                type="button"
                                data-action="remove"
                                aria-label="Remove from wishlist"
                                onClick={() => onRemove(product.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <div className="wishlist-empty" id="wishlist-empty" hidden={!isEmpty}>
                    <span>♡</span>
                    <h3>Your wishlist is empty!</h3>
                    <p>Add products you love to your wishlist.</p>
                </div>
            </div>
        </div>
    );
}

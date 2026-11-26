import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/format';
import { validateAddress, sanitizeInput } from '../../services/validation';

export function CheckoutPage({
    cart,
    productMap,
    cartTotal,
    address,
    onSaveAddress,
    placeOrder,
    clearCart,
    isPlacing,
    notify
}) {
    const entries = Object.entries(cart).filter(([id]) => productMap.has(id));
    const [addressInput, setAddressInput] = useState(address || '');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setAddressInput(address || '');
    }, [address]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanAddress = sanitizeInput(addressInput);
        const addrErr = validateAddress(cleanAddress);
        if (addrErr) {
            return setError(addrErr);
        }

        onSaveAddress(cleanAddress);

        try {
            const result = await placeOrder(cleanAddress, cart);
            if (result.success) {
                if (notify) notify(`Order ${result.order.orderId} placed successfully! ✓`);
                clearCart();
                navigate('/orders');
            } else {
                setError(result.error || 'Failed to place order.');
            }
        } catch {
            setError('Could not reach server. Please try again.');
        }
    };

    return (
        <section className="page-section container">
            <div className="section-heading">
                <div>
                    <p className="subtitle">FINALIZE ORDER</p>
                    <h2>Checkout</h2>
                </div>
                <Link to="/" className="checkout-action">
                    ← Back to Store
                </Link>
            </div>

            {entries.length === 0 ? (
                <div className="empty-state">
                    <h3>Your cart is empty</h3>
                    <p>Add items to your cart before checking out.</p>
                    <Link to="/" className="primary-button" style={{ marginTop: '16px' }}>
                        Shop Now →
                    </Link>
                </div>
            ) : (
                <div className="checkout-page-grid">
                    <div className="checkout-card">
                        <h3>Order Summary</h3>
                        <div className="checkout-products">
                            {entries.map(([id, quantity]) => {
                                const product = productMap.get(id);
                                return (
                                    <div className="checkout-product" key={id}>
                                        <img src={product.image} alt={product.name} />
                                        <div className="checkout-product-info">
                                            <h4>{product.name}</h4>
                                            <p>{`${quantity} × ${formatINR(product.price)}`}</p>
                                        </div>
                                        <span className="checkout-product-price">
                                            {formatINR(product.price * quantity)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="checkout-total">
                            <span>Grand Total</span>
                            <strong>{formatINR(cartTotal)}</strong>
                        </div>
                    </div>

                    <div className="checkout-card">
                        <h3>Shipping Details</h3>
                        {error && <div className="auth-error" role="alert">{error}</div>}
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="checkout-address">Delivery Address</label>
                                <textarea
                                    id="checkout-address"
                                    rows={4}
                                    value={addressInput}
                                    onChange={(e) => setAddressInput(e.target.value)}
                                    placeholder="House no., Street, City, State, PIN code"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="place-order-btn"
                                disabled={isPlacing}
                            >
                                {isPlacing ? 'Placing Order...' : `Place Order (${formatINR(cartTotal)}) →`}
                            </button>
                            <p className="checkout-security">
                                🔒 Your checkout information is protected.
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

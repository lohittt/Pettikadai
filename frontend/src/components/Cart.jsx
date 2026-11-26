import { useState, useEffect, useRef } from 'react';
import { MAX_QTY, formatINR } from '../utils/format';

export function Cart({
    cart,
    productMap,
    cartTotal,
    onUpdateQuantity,
    onRemoveFromCart,
    address,
    isCheckoutOpen,
    isAddressOpen,
    onOpenCheckout,
    onCloseCheckout,
    onOpenAddress,
    onCloseAddress,
    validateAddress,
    onSaveAddress,
    onPlaceOrder,
    isPlacing
}) {
    const entries = Object.entries(cart).filter(([id]) => productMap.has(id));
    const [addressDraft, setAddressDraft] = useState(address);
    const addressInputRef = useRef(null);

    useEffect(() => {
        if (isAddressOpen) {
            setAddressDraft(address);
            setTimeout(() => addressInputRef.current?.focus(), 0);
        }
    }, [isAddressOpen, address]);

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        const errorMsg = validateAddress(addressDraft);
        if (errorMsg && addressInputRef.current) {
            addressInputRef.current.setCustomValidity(errorMsg);
            addressInputRef.current.reportValidity();
            return;
        }
        onSaveAddress(addressDraft);
    };

    return (
        <>
            <section className="cart-section container" id="cart">
                <h2 className="cart-heading">Shopping Cart</h2>
                <div className="cart-container">
                    <div className="cart-header">
                        <span>Item</span>
                        <span>Price</span>
                        <span>Quantity</span>
                        <span>Total</span>
                        <span>Remove</span>
                    </div>
                    <div className="cart-items" id="cart-items">
                        {entries.map(([id, quantity]) => {
                            const product = productMap.get(id);
                            return (
                                <div className="cart-item" key={id} data-product-id={id}>
                                    <div className="cart-product">
                                        <img src={product.image} alt={product.name} />
                                        <div className="cart-product-details">
                                            <h3>{product.name}</h3>
                                            <p>{product.brand}</p>
                                        </div>
                                    </div>
                                    <div className="cart-price">{formatINR(product.price)}</div>
                                    <div className="cart-quantity">
                                        <input
                                            type="number"
                                            value={quantity}
                                            min={1}
                                            max={MAX_QTY}
                                            aria-label="Product quantity"
                                            onChange={(e) => onUpdateQuantity(id, e.target.value)}
                                        />
                                    </div>
                                    <div className="cart-total">{formatINR(product.price * quantity)}</div>
                                    <div className="cart-remove">
                                        <button
                                            type="button"
                                            data-action="remove"
                                            onClick={() => onRemoveFromCart(id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="cart-summary" id="cart-summary" hidden={entries.length === 0}>
                        <button
                            className="checkout-button"
                            id="checkout-button"
                            type="button"
                            onClick={onOpenCheckout}
                        >
                            Checkout →
                        </button>
                        <div className="cart-grand-total">
                            <span>Grand Total:</span>
                            <strong id="cart-grand-total">{formatINR(cartTotal)}</strong>
                        </div>
                    </div>
                </div>
            </section>

            {/* Checkout Modal */}
            <div
                className={`checkout-overlay${isCheckoutOpen ? ' active' : ''}`}
                id="checkout-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkout-title"
                aria-hidden={String(!isCheckoutOpen)}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onCloseCheckout();
                }}
            >
                <div className="checkout-modal">
                    <div className="checkout-header">
                        <div>
                            <h2 id="checkout-title">Checkout</h2>
                            <p>Review your order before placing it.</p>
                        </div>
                        <button
                            className="close-checkout"
                            id="close-checkout"
                            type="button"
                            onClick={onCloseCheckout}
                        >
                            ×
                        </button>
                    </div>
                    <div className="checkout-content">
                        <div className="checkout-order">
                            <h3>Order Summary</h3>
                            <div className="checkout-products" id="checkout-products">
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
                                <strong id="checkout-total">{formatINR(cartTotal)}</strong>
                            </div>
                        </div>
                        <div className="checkout-details">
                            <h3>Customer Information</h3>
                            <div className="checkout-option">
                                <div>
                                    <h4>Delivery Address</h4>
                                    <p>{address || 'Add your shipping address.'}</p>
                                </div>
                                <button
                                    type="button"
                                    className="checkout-action"
                                    onClick={onOpenAddress}
                                >
                                    {address ? 'Edit Address' : 'Add Address'}
                                </button>
                            </div>
                            <button
                                type="button"
                                className="place-order-btn"
                                disabled={isPlacing}
                                onClick={onPlaceOrder}
                            >
                                {isPlacing ? 'Placing Order...' : 'Place Order →'}
                            </button>
                            <p className="checkout-security">
                                🔒 Your checkout information is protected.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            <div
                className={`checkout-overlay${isAddressOpen ? ' active' : ''}`}
                id="address-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="address-title"
                aria-hidden={String(!isAddressOpen)}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onCloseAddress();
                }}
            >
                <div className="checkout-modal address-modal">
                    <div className="checkout-header">
                        <div>
                            <h2 id="address-title">Delivery Address</h2>
                            <p>Enter the address for this order.</p>
                        </div>
                        <button
                            className="close-checkout"
                            id="close-address"
                            type="button"
                            onClick={onCloseAddress}
                        >
                            ×
                        </button>
                    </div>
                    <form id="address-form" onSubmit={handleAddressSubmit}>
                        <label htmlFor="address-input">Address</label>
                        <textarea
                            ref={addressInputRef}
                            id="address-input"
                            rows={4}
                            required
                            value={addressDraft}
                            onChange={(e) => {
                                e.target.setCustomValidity('');
                                setAddressDraft(e.target.value);
                            }}
                        />
                        <button className="place-order-btn" type="submit">
                            Save Address
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

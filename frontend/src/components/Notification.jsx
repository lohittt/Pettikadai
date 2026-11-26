export function Notification({ message }) {
    return (
        <div
            className="cart-notification"
            id="cart-notification"
            role="status"
            aria-live="polite"
            hidden={!message}
        >
            {message}
        </div>
    );
}

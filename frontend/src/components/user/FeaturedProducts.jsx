import { ProductCard } from './ProductCard';

export function FeaturedProducts({
    products,
    onSelectProduct,
    onAddToCart,
    onToggleWishlist,
    isWishlisted
}) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="featured-section container" id="featured">
            <div className="section-heading">
                <div>
                    <p className="subtitle">CURATED PICKS</p>
                    <h2>Featured Products</h2>
                </div>
            </div>

            <div className="product-grid">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        wishlisted={isWishlisted(product.id)}
                        onSelectProduct={onSelectProduct}
                        onAddToCart={onAddToCart}
                        onToggleWishlist={onToggleWishlist}
                    />
                ))}
            </div>
        </section>
    );
}

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
        <section className="container py-10" id="featured">
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Curated Picks
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
        <section className="container py-12" id="featured">
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <h2 className="font-headline text-3xl font-bold text-foreground">Featured Products</h2>
                    <p className="text-sm text-muted-foreground">
                        Handpicked favourites from our counter
                    </p>
                </div>
                <Link
                    to="/products"
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-secondary hover:underline whitespace-nowrap"
                >
                    <span>View all</span>
                    <ArrowRight className="size-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

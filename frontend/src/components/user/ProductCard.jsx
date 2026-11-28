import { Heart } from 'lucide-react';
import { formatINR } from '../../utils/format';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ProductCard({
    product,
    wishlisted,
    onSelectProduct,
    onAddToCart,
    onToggleWishlist
}) {
    return (
        <Card
            className="group flex cursor-pointer flex-col justify-between gap-0 overflow-hidden bg-card pt-0 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:border-primary/40"
            data-product-id={product.id}
            data-category={product.category}
            data-price={product.price}
            tabIndex={0}
            role="group"
            aria-label={`View details for ${product.name}`}
            onClick={(e) => {
                if (!e.target.closest('button')) {
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
            <div className="relative aspect-square w-full overflow-hidden bg-surface-container">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {product.isFeatured && (
                    <Badge className="absolute top-3 left-3 rounded-full bg-accent text-accent-foreground shadow-xs">
                        Featured
                    </Badge>
                )}
                <button
                    type="button"
                    title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                    aria-pressed={wishlisted}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                    }}
                    className={`absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-full border border-border bg-card transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        wishlisted ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                    }`}
                >
                    <Heart className={`size-4 ${wishlisted ? 'fill-destructive text-destructive' : ''}`} />
                </button>
            </div>

            <CardContent className="flex flex-1 flex-col gap-1 p-4">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {product.brand}
                </span>
                <h3 className="truncate text-base font-semibold text-foreground">{product.name}</h3>
                {product.description && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">{product.description}</p>
                )}
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-2 border-t-0 bg-transparent px-4 pt-1 pb-4">
                <span className="text-lg font-semibold text-foreground tabular-nums">
                    {formatINR(product.price)}
                </span>
                <Button
                    type="button"
                    size="sm"
                    className="rounded-full px-4 text-xs font-semibold hover:bg-secondary"
                    onClick={() => onAddToCart(product.id)}
                >
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}

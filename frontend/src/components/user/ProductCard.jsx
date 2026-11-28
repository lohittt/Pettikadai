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
            className="group cursor-pointer overflow-hidden pt-0 transition-all hover:border-foreground/50 hover:shadow-md"
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
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            <CardContent className="flex flex-col gap-1.5 pt-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        {product.brand}
                    </span>
                    {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <h3 className="truncate text-base font-semibold text-foreground">{product.name}</h3>
                <p className="text-lg font-bold text-foreground">{formatINR(product.price)}</p>
            </CardContent>

            <CardFooter className="gap-2 pt-0">
                <Button
                    type="button"
                    className="flex-1 rounded-full"
                    onClick={() => onAddToCart(product.id)}
                >
                    Add to Cart
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    aria-pressed={wishlisted}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                    }}
                >
                    <Heart className={wishlisted ? 'fill-red-500 text-red-500' : ''} />
                </Button>
            </CardFooter>
        </Card>
    );
}

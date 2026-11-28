import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatINR } from '../../utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function WishlistPage({ wishlist, productMap, onRemove, onAddToCart }) {
    const items = wishlist.map((id) => productMap.get(id)).filter(Boolean);

    return (
        <section className="container min-h-[60vh] py-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Saved Items
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight">My Wishlist ♥</h2>
                </div>
                <Button variant="outline" render={<Link to="/" />}>
                    ← Continue Shopping
                </Button>
            </div>

            {items.length === 0 ? (
                <Card className="py-12 text-center">
                    <CardContent className="flex flex-col items-center gap-3">
                        <Heart className="size-10 text-red-500" />
                        <h3 className="text-xl font-semibold">Your wishlist is empty</h3>
                        <p className="text-sm text-muted-foreground">
                            Save products you love while browsing the store.
                        </p>
                        <Button render={<Link to="/" />} className="mt-2">
                            Browse Products →
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((product) => (
                        <Card key={product.id} className="overflow-hidden pt-0">
                            <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <CardContent className="flex flex-col gap-1.5 pt-4">
                                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    {product.brand}
                                </span>
                                <h3 className="truncate text-base font-semibold">{product.name}</h3>
                                <p className="text-lg font-bold">{formatINR(product.price)}</p>
                            </CardContent>
                            <CardFooter className="gap-2 pt-0">
                                <Button
                                    type="button"
                                    className="flex-1 rounded-full"
                                    onClick={() => onAddToCart(product.id)}
                                >
                                    Move to Cart
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full"
                                    title="Remove from Wishlist"
                                    onClick={() => onRemove(product.id)}
                                >
                                    <Heart className="fill-red-500 text-red-500" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}

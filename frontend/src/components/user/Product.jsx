import { CATEGORIES } from '../../hooks/useProducts';
import { formatINR } from '../../utils/format';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

const SORT_LABELS = {
    default: 'Sort By',
    'low-high': 'Price: Low to High',
    'high-low': 'Price: High to Low',
    name: 'Name: A to Z'
};

export function Product({
    products,
    search,
    onSearchChange,
    category,
    onCategoryChange,
    sort,
    onSortChange,
    selectedProduct,
    onSelectProduct,
    onAddToCart,
    onToggleWishlist,
    isWishlisted
}) {
    return (
        <>
            <section className="container py-12" id="products">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                            Our Collection
                        </p>
                        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                            Explore Products
                        </h2>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Input
                            type="search"
                            id="search-input"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="bg-card sm:w-56"
                        />
                        <Select value={sort} onValueChange={onSortChange}>
                            <SelectTrigger id="sort-select" aria-label="Sort products" className="w-full bg-card sm:w-48">
                                <SelectValue>{SORT_LABELS[sort] || 'Sort By'}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                                <SelectGroup>
                                    <SelectItem value="default">Sort By</SelectItem>
                                    <SelectItem value="low-high">Price: Low to High</SelectItem>
                                    <SelectItem value="high-low">Price: High to Low</SelectItem>
                                    <SelectItem value="name">Name: A to Z</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mb-8 flex flex-wrap gap-2" id="category-buttons">
                    {CATEGORIES.map((cat) => (
                        <Button
                            key={cat}
                            type="button"
                            variant={category === cat ? 'default' : 'outline'}
                            className={`rounded-full ${category === cat ? '' : 'bg-card hover:bg-surface-container'}`}
                            data-category={cat}
                            onClick={() => onCategoryChange(cat)}
                        >
                            {cat === 'All' ? 'All Products' : cat}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" id="product-grid">
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

            <Dialog
                open={Boolean(selectedProduct)}
                onOpenChange={(open) => {
                    if (!open) onSelectProduct(null);
                }}
            >
                <DialogContent className="bg-card sm:max-w-2xl" id="product-detail-modal">
                    {selectedProduct && (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-center">
                            <div className="aspect-square overflow-hidden rounded-xl border border-border bg-surface-container">
                                <img
                                    id="product-detail-image"
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <DialogHeader>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className="rounded-full bg-background">
                                            {selectedProduct.brand} · {selectedProduct.category}
                                        </Badge>
                                        {selectedProduct.isFeatured && (
                                            <Badge className="rounded-full bg-accent text-accent-foreground">
                                                Featured
                                            </Badge>
                                        )}
                                    </div>
                                    <DialogTitle className="font-headline text-2xl">
                                        {selectedProduct.name}
                                    </DialogTitle>
                                    <p className="text-2xl font-bold text-destructive tabular-nums">
                                        {formatINR(selectedProduct.price)}
                                    </p>
                                    <DialogDescription className="text-sm leading-relaxed">
                                        {selectedProduct.description ||
                                            `Explore the ${selectedProduct.name} from ${selectedProduct.brand}, selected from our ${selectedProduct.category.toLowerCase()} collection.`}
                                    </DialogDescription>
                                </DialogHeader>
                                <Button
                                    type="button"
                                    className="mt-2 w-full rounded-full hover:bg-secondary"
                                    onClick={() => {
                                        onAddToCart(selectedProduct.id);
                                        onSelectProduct(null);
                                    }}
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

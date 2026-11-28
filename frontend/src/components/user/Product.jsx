import { useState, useEffect, useMemo } from 'react';
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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 8; // 2 rows × 4 columns

const SORT_LABELS = {
    default: 'Sort By',
    'low-high': 'Price: Low to High',
    'high-low': 'Price: High to Low',
    name: 'Name: A to Z'
};

function getPageNumbers(current, total) {
    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
            result.push('ellipsis');
        }
        result.push(sorted[i]);
    }
    return result;
}

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
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, category, sort]);

    const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);

    const paginatedProducts = useMemo(() => {
        const start = (safePage - 1) * ITEMS_PER_PAGE;
        return products.slice(start, start + ITEMS_PER_PAGE);
    }, [products, safePage]);

    const goToPage = (page) => {
        const next = Math.max(1, Math.min(totalPages, page));
        if (next === safePage) return;
        setCurrentPage(next);
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    };

    const pageItems = getPageNumbers(safePage, totalPages);

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

                {paginatedProducts.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
                        No products match your search or filter.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" id="product-grid">
                        {paginatedProducts.map((product) => (
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
                )}

                {totalPages > 1 && (
                    <Pagination className="mt-10">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#products"
                                    aria-disabled={safePage === 1}
                                    className={safePage === 1 ? 'pointer-events-none opacity-50' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        goToPage(safePage - 1);
                                    }}
                                />
                            </PaginationItem>

                            {pageItems.map((item, idx) => (
                                <PaginationItem key={item === 'ellipsis' ? `ellipsis-${idx}` : item}>
                                    {item === 'ellipsis' ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            href="#products"
                                            isActive={item === safePage}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                goToPage(item);
                                            }}
                                        >
                                            {item}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    href="#products"
                                    aria-disabled={safePage === totalPages}
                                    className={safePage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        goToPage(safePage + 1);
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
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

import { CATEGORIES } from '../../hooks/useProducts';
import { formatINR } from '../../utils/format';
import { ProductCard } from './ProductCard';

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
            <section className="products-section container" id="products">
                <div className="section-heading">
                    <div>
                        <p className="subtitle">OUR COLLECTION</p>
                        <h2>Explore Products</h2>
                    </div>
                    <div className="product-controls">
                        <input
                            type="search"
                            id="search-input"
                            placeholder="Search products"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <select
                            id="sort-select"
                            aria-label="Sort products"
                            value={sort}
                            onChange={(e) => onSortChange(e.target.value)}
                        >
                            <option value="default">Sort By</option>
                            <option value="low-high">Price: Low to High</option>
                            <option value="high-low">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                <div className="categories" id="category-buttons">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className={`category-button${category === cat ? ' active' : ''}`}
                            data-category={cat}
                            onClick={() => onCategoryChange(cat)}
                        >
                            {cat === 'All' ? 'All Products' : cat}
                        </button>
                    ))}
                </div>

                <div className="product-grid" id="product-grid">
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

            <div
                className={`product-detail-overlay${selectedProduct ? ' active' : ''}`}
                id="product-detail-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-detail-title"
                aria-hidden={String(!selectedProduct)}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onSelectProduct(null);
                }}
            >
                {selectedProduct && (
                    <article className="product-detail-modal">
                        <button
                            className="product-detail-close"
                            id="close-product-detail"
                            type="button"
                            aria-label="Close product details"
                            onClick={() => onSelectProduct(null)}
                        >
                            ×
                        </button>
                        <div className="product-detail-content">
                            <div className="product-detail-image">
                                <img
                                    id="product-detail-image"
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                />
                            </div>
                            <div className="product-detail-info">
                                <p className="product-detail-category" id="product-detail-category">
                                    {selectedProduct.brand} · {selectedProduct.category}
                                </p>
                                <h2 id="product-detail-title">{selectedProduct.name}</h2>
                                <p className="product-detail-price" id="product-detail-price">
                                    {formatINR(selectedProduct.price)}
                                </p>
                                <p className="product-detail-description" id="product-detail-description">
                                    {selectedProduct.description ||
                                        `Explore the ${selectedProduct.name} from ${selectedProduct.brand}, selected from our ${selectedProduct.category.toLowerCase()} collection.`}
                                </p>
                                <button
                                    className="product-detail-cart"
                                    id="product-detail-cart"
                                    type="button"
                                    onClick={() => {
                                        onAddToCart(selectedProduct.id);
                                        onSelectProduct(null);
                                    }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </article>
                )}
            </div>
        </>
    );
}

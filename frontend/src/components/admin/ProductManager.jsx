import { useState, useEffect, useMemo } from 'react';
import { PettikadaiAPI } from '../../api/pettikadaiApi';
import { CATEGORIES } from '../../hooks/useProducts';
import { formatINR } from '../../utils/format';
import { sanitizeInput } from '../../services/validation';

const EMPTY_FORM = {
    name: '',
    brand: '',
    category_id: '',
    price: '',
    image_url: '',
    description: '',
    is_featured: false
};

export function ProductManager({ products, refreshProducts, setProductFeaturedLocal, notify }) {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        PettikadaiAPI.getCategories().then((res) => {
            if (res?.success && Array.isArray(res.categories)) {
                setCategories(res.categories);
                if (res.categories.length > 0) {
                    setForm((prev) => ({
                        ...prev,
                        category_id: prev.category_id || String(res.categories[0].id)
                    }));
                }
            }
        });
    }, []);

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products.filter((p) => {
            if (featuredOnly && !p.isFeatured) return false;
            const matchesCat = activeCategory === 'All' || p.category === activeCategory;
            const matchesSearch = !term || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term);
            return matchesCat && matchesSearch;
        });
    }, [products, activeCategory, featuredOnly, search]);

    const openAddForm = () => {
        setEditingId(null);
        setForm({
            ...EMPTY_FORM,
            category_id: categories[0]?.id ? String(categories[0].id) : ''
        });
        setError('');
        setShowForm(true);
    };

    const handleEdit = (product) => {
        const matchedCat = categories.find((c) => c.name === product.category);
        setEditingId(product.id);
        setForm({
            name: product.name,
            brand: product.brand,
            category_id: matchedCat ? String(matchedCat.id) : (categories[0]?.id ? String(categories[0].id) : ''),
            price: String(product.price),
            image_url: product.image,
            description: product.description || '',
            is_featured: Boolean(product.isFeatured)
        });
        setError('');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowForm(false);
        setForm({
            ...EMPTY_FORM,
            category_id: categories[0]?.id ? String(categories[0].id) : ''
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            name: sanitizeInput(form.name),
            brand: sanitizeInput(form.brand),
            category_id: Number(form.category_id),
            price: Number(form.price),
            image_url: sanitizeInput(form.image_url),
            description: sanitizeInput(form.description),
            is_featured: Boolean(form.is_featured)
        };

        try {
            const res = editingId
                ? await PettikadaiAPI.updateProduct(editingId, payload)
                : await PettikadaiAPI.createProduct(payload);

            if (res.success) {
                if (notify) notify(editingId ? 'Product updated ✓' : 'Product added ✓');
                handleCancel();
                await refreshProducts();
            } else {
                setError(res.errors ? res.errors.join(', ') : (res.error || 'Operation failed'));
            }
        } catch {
            setError('Server error while saving product.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleFeatured = async (product) => {
        const nextFeatured = !product.isFeatured;
        setProductFeaturedLocal(product.id, nextFeatured);

        const res = await PettikadaiAPI.toggleProductFeatured(product.id, nextFeatured);
        if (res?.success) {
            if (notify) notify(res.message);
            await refreshProducts();
        } else {
            // Rollback optimistic update on failure
            setProductFeaturedLocal(product.id, product.isFeatured);
            if (notify) notify(res?.error || 'Failed to update featured status');
        }
    };

    const handleDelete = async (productId, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;
        const res = await PettikadaiAPI.deleteProduct(productId);
        if (res.success) {
            if (notify) notify(`${name} deleted`);
            if (editingId === productId) handleCancel();
            await refreshProducts();
        } else {
            alert(res.error || 'Failed to delete product');
        }
    };

    return (
        <section className="page-section container">
            <div className="section-heading">
                <div>
                    <p className="subtitle">CATALOG MANAGEMENT</p>
                    <h2>Products ({filteredProducts.length})</h2>
                </div>
                <div className="admin-toolbar">
                    <input
                        type="search"
                        className="admin-search"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        type="button"
                        className="primary-button"
                        onClick={showForm && !editingId ? handleCancel : openAddForm}
                    >
                        {showForm && !editingId ? 'Close Form' : '+ Add New Product'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="admin-card admin-form-card">
                    <div className="admin-card-header">
                        <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                        <button type="button" className="checkout-action" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                    {error && <div className="auth-error" role="alert">{error}</div>}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="prod-name">Product Name</label>
                                <input
                                    id="prod-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Sony WH-1000XM5"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="prod-brand">Brand</label>
                                <input
                                    id="prod-brand"
                                    type="text"
                                    value={form.brand}
                                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                    placeholder="e.g. Sony"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="prod-cat">Category</label>
                                <select
                                    id="prod-cat"
                                    value={form.category_id}
                                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="prod-price">Price (INR)</label>
                                <input
                                    id="prod-price"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    placeholder="e.g. 24999"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="prod-img">Image URL</label>
                            <input
                                id="prod-img"
                                type="url"
                                value={form.image_url}
                                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                placeholder="https://..."
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="prod-desc">Description</label>
                            <textarea
                                id="prod-desc"
                                rows={2}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <label className="featured-checkbox-label">
                            <input
                                type="checkbox"
                                checked={form.is_featured}
                                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                            />
                            <span>Feature this product on storefront</span>
                        </label>
                        <div className="admin-form-actions">
                            <button type="submit" className="place-order-btn" disabled={saving}>
                                {saving ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="categories admin-categories">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        className={`category-button${activeCategory === cat ? ' active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat === 'All' ? 'All Products' : cat}
                    </button>
                ))}
                <button
                    type="button"
                    className={`category-button${featuredOnly ? ' active' : ''}`}
                    onClick={() => setFeaturedOnly((prev) => !prev)}
                >
                    ★ Featured Only
                </button>
            </div>

            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#777' }}>
                                        No products match the current filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="admin-product-cell">
                                                <img src={p.image} alt={p.name} />
                                                <div>
                                                    <strong>{p.name}</strong>
                                                    <small>{p.brand}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{p.category}</td>
                                        <td>{formatINR(p.price)}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className={`featured-toggle-btn${p.isFeatured ? ' active' : ''}`}
                                                aria-pressed={p.isFeatured}
                                                onClick={() => handleToggleFeatured(p)}
                                            >
                                                {p.isFeatured ? '★ Featured' : '☆ Standard'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="admin-row-actions">
                                                <button
                                                    type="button"
                                                    className="checkout-action"
                                                    onClick={() => handleEdit(p)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-delete-btn"
                                                    onClick={() => handleDelete(p.id, p.name)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

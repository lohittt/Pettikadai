import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Plus, Star, Pencil, Trash2 } from 'lucide-react';
import { PettikadaiAPI } from '../../api/pettikadaiApi';
import { CATEGORIES } from '../../hooks/useProducts';
import { formatINR } from '../../utils/format';
import { sanitizeInput } from '../../services/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

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

    const selectedCategoryName =
        categories.find((c) => String(c.id) === String(form.category_id))?.name || 'Select category';

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
        <section className="container min-h-[60vh] py-12">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Catalog Management
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Products ({filteredProducts.length})
                    </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        type="search"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-56"
                    />
                    <Button
                        type="button"
                        onClick={showForm && !editingId ? handleCancel : openAddForm}
                    >
                        {!(showForm && !editingId) && <Plus data-icon="inline-start" />}
                        {showForm && !editingId ? 'Close Form' : 'Add New Product'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="prod-name">Product Name</Label>
                                    <Input
                                        id="prod-name"
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Sony WH-1000XM5"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="prod-brand">Brand</Label>
                                    <Input
                                        id="prod-brand"
                                        type="text"
                                        value={form.brand}
                                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                        placeholder="e.g. Sony"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="prod-cat">Category</Label>
                                    <Select
                                        value={String(form.category_id)}
                                        onValueChange={(val) => setForm({ ...form, category_id: val })}
                                    >
                                        <SelectTrigger id="prod-cat" className="w-full">
                                            <SelectValue>{selectedCategoryName}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="prod-price">Price (INR)</Label>
                                    <Input
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

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="prod-img">Image URL</Label>
                                <Input
                                    id="prod-img"
                                    type="url"
                                    value={form.image_url}
                                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="https://..."
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="prod-desc">Description</Label>
                                <Textarea
                                    id="prod-desc"
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2.5">
                                <Checkbox
                                    id="prod-featured"
                                    checked={form.is_featured}
                                    onCheckedChange={(checked) =>
                                        setForm({ ...form, is_featured: Boolean(checked) })
                                    }
                                />
                                <Label htmlFor="prod-featured" className="cursor-pointer">
                                    Feature this product on storefront
                                </Label>
                            </div>

                            <div>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                    <Button
                        key={cat}
                        type="button"
                        variant={activeCategory === cat ? 'default' : 'outline'}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat === 'All' ? 'All Products' : cat}
                    </Button>
                ))}
                <Button
                    type="button"
                    variant={featuredOnly ? 'default' : 'outline'}
                    onClick={() => setFeaturedOnly((prev) => !prev)}
                >
                    <Star data-icon="inline-start" className={featuredOnly ? 'fill-current' : ''} />
                    Featured Only
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Featured</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                        No products match the current filter.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={p.image}
                                                    alt={p.name}
                                                    className="size-11 rounded-md bg-muted object-cover"
                                                />
                                                <div>
                                                    <strong className="block font-semibold">{p.name}</strong>
                                                    <small className="text-xs text-muted-foreground">{p.brand}</small>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{p.category}</TableCell>
                                        <TableCell className="font-medium">{formatINR(p.price)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={p.isFeatured}
                                                    onCheckedChange={() => handleToggleFeatured(p)}
                                                    aria-label={`Toggle featured for ${p.name}`}
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {p.isFeatured ? 'Featured' : 'Standard'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(p)}
                                                >
                                                    <Pencil data-icon="inline-start" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(p.id, p.name)}
                                                >
                                                    <Trash2 data-icon="inline-start" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
    );
}

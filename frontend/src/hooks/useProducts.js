import { useState, useMemo, useEffect, useCallback } from 'react';
import { PettikadaiAPI } from '../api/pettikadaiApi';

export const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Accessories'];

function mapProduct(p) {
    return {
        id: p.product_id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: Number(p.price),
        image: p.image_url,
        description: p.description
    };
}

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('default');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const refreshProducts = useCallback(async () => {
        const res = await PettikadaiAPI.getProducts();
        if (res?.success && Array.isArray(res.products)) {
            setProducts(res.products.map(mapProduct));
        }
    }, []);

    useEffect(() => {
        refreshProducts();
    }, [refreshProducts]);

    const productMap = useMemo(
        () => new Map(products.map((p) => [p.id, p])),
        [products]
    );

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        const filtered = products.filter((p) => {
            const matchesSearch = `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term);
            const matchesCategory = category === 'All' || p.category === category;
            return matchesSearch && matchesCategory;
        });

        if (sort === 'low-high') return [...filtered].sort((a, b) => a.price - b.price);
        if (sort === 'high-low') return [...filtered].sort((a, b) => b.price - a.price);
        if (sort === 'name') return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        return filtered;
    }, [products, search, category, sort]);

    return {
        products,
        productMap,
        filteredProducts,
        search,
        setSearch,
        category,
        setCategory,
        sort,
        setSort,
        selectedProduct,
        setSelectedProduct,
        refreshProducts
    };
}

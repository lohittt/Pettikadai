import { useState, useMemo, useEffect } from 'react';
import { PettikadaiAPI } from '../api/pettikadaiApi';

const INITIAL_PRODUCTS = [
    {
        id: 'nike-air-max-red',
        name: 'Nike Air Max Red',
        brand: 'Nike',
        category: 'Fashion',
        price: 8499,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'
    },
    {
        id: 'nike-air-force-1',
        name: 'Nike Air Force 1',
        brand: 'Nike',
        category: 'Fashion',
        price: 7499,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600'
    },
    {
        id: 'nike-sneakers',
        name: 'Nike Sneakers',
        brand: 'Nike',
        category: 'Fashion',
        price: 6999,
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600'
    },
    {
        id: 'iphone-15',
        name: 'iPhone 15',
        brand: 'Apple',
        category: 'Electronics',
        price: 59999,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'
    },
    {
        id: 'wireless-headphones',
        name: 'Wireless Headphones',
        brand: 'Sony',
        category: 'Electronics',
        price: 4999,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'
    },
    {
        id: 'galaxy-smart-watch',
        name: 'Galaxy Smart Watch',
        brand: 'Samsung',
        category: 'Electronics',
        price: 12499,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'
    },
    {
        id: 'dell-inspiron-laptop',
        name: 'Dell Inspiron Laptop',
        brand: 'Dell',
        category: 'Electronics',
        price: 54999,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'
    },
    {
        id: 'jbl-portable-speaker',
        name: 'Portable Bluetooth Speaker',
        brand: 'JBL',
        category: 'Electronics',
        price: 3499,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'
    },
    {
        id: 'rayban-classic-sunglasses',
        name: 'Classic Sunglasses',
        brand: 'Ray-Ban',
        category: 'Accessories',
        price: 2999,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600'
    },
    {
        id: 'wildcraft-travel-backpack',
        name: 'Travel Backpack',
        brand: 'Wildcraft',
        category: 'Accessories',
        price: 1999,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'
    },
    {
        id: 'fossil-classic-analog-watch',
        name: 'Classic Analog Watch',
        brand: 'Fossil',
        category: 'Accessories',
        price: 5499,
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600'
    },
    {
        id: 'leather-wallet',
        name: 'Premium Leather Wallet',
        brand: 'Leather',
        category: 'Accessories',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600'
    }
];

export const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Accessories'];

export function useProducts() {
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('default');
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        let active = true;
        PettikadaiAPI.getProducts().then((res) => {
            if (!active || !res?.success || !Array.isArray(res.products) || res.products.length === 0) return;
            setProducts(
                res.products.map((p) => ({
                    id: p.product_id,
                    name: p.name,
                    brand: p.brand,
                    category: p.category,
                    price: Number(p.price),
                    image: p.image_url,
                    description: p.description
                }))
            );
        });
        return () => {
            active = false;
        };
    }, []);

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
        setSelectedProduct
    };
}

'use strict';

(() => {
    //Local storage keys and maximum quantity for cart items
    const STORAGE_KEYS = {
        cart: 'shopease_cart',
        wishlist: 'shopease_wishlist',
        address: 'shopease_address'
    };
    const MAX_QTY = 99;

    // Utility functions for DOM selection
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    // Format a number as Indian Rupees currency
    const fmt = value => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);

    // Cache DOM elements for later use
    const dom = {
        grid: $('#product-grid'),
        search: $('#search-input'),
        sort: $('#sort-select'),
        categories: $('#category-buttons'),
        cartItems: $('#cart-items'),
        cartSummary: $('#cart-summary'),
        cartTotal: $('#cart-grand-total'),
        cartTemplate: $('#cart-item-template'),
        wishlistButton: $('#wishlist-button'),
        cartNotification: $('#cart-notification'),
        wishlistModal: $('#wishlist-modal'),
        wishlistItems: $('#wishlist-products'),
        wishlistEmpty: $('#wishlist-empty'),
        wishlistTemplate: $('#wishlist-product-template'),
        productDetailModal: $('#product-detail-modal'),
        productDetailImage: $('#product-detail-image'),
        productDetailCategory: $('#product-detail-category'),
        productDetailTitle: $('#product-detail-title'),
        productDetailPrice: $('#product-detail-price'),
        productDetailDescription: $('#product-detail-description'),
        productDetailCart: $('#product-detail-cart'),
        checkoutButton: $('#checkout-button'),
        checkout: $('#checkout-modal'),
        checkoutProducts: $('#checkout-products'),
        checkoutTemplate: $('#checkout-product-template'),
        checkoutTotal: $('#checkout-total'),
        addressModal: $('#address-modal'),
        addressForm: $('#address-form'),
        addressInput: $('#address-input'),
        addressButton: $('.checkout-action'),
        placeOrderButton: $('.place-order-btn')
    };

    //define read and save functions to handle localStorage with error handling
    const read = (key, fallback) => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS[key])) ?? fallback;
        } catch {
            return fallback;
        }
    };

    //object to stringify and save to localStorage, with error handling
    const save = (key, value) => {
        try {
            localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
        } catch {
            // Storage is optional; the current session still works.
        }
    };

    //extract product data from the DOM and store it in a Map for easy access
    const products = new Map($$('.product-card', dom.grid).map(card => [
        card.dataset.productId,
        {
            id: card.dataset.productId,
            name: $('h3', card).textContent.trim(),
            brand: $('.product-category', card).textContent.trim(),
            category: card.dataset.category,
            price: Number(card.dataset.price),
            image: $('img', card).src
        }
    ]));

    //cart initialization and state management
    const storedCart = read('cart', {});
    const storedWishlist = read('wishlist', []);

    //data validation and sanitization for cart and wishlist, ensuring only valid products are included and quantities are within limits
    //core logic for managing the state of the cart, wishlist, and address, including functions to update the state and synchronize it with localStorage.
    const state = {
        cart: Object.fromEntries(
            Object.entries(storedCart && typeof storedCart === 'object' && !Array.isArray(storedCart) ? storedCart : {})
                .map(([id, quantity]) => [id, Math.max(0, Math.min(MAX_QTY, Number(quantity) || 0))])
                .filter(([id, quantity]) => products.has(id) && quantity > 0)
        ),
        wishlist:[...new Set((Array.isArray(storedWishlist) ? storedWishlist : [])
        .filter(id => products.has(id)))],
        address: read('address', '')
    };

    //local storage state management function to update the state and save it to localStorage if necessary
    const setState = (key, value) => {
        state[key] = value;
        if (key in STORAGE_KEYS) save(key, value);
    };

    //calculate the total number of items in the cart
    const cartCount = () => Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
    //calculate the total price of items in the cart
    const cartTotal = () => Object.entries(state.cart)
        .reduce((sum, [id, qty]) => sum + products.get(id).price * qty, 0);

    
     //event listener to toggle the visibility of modals and manage the page's scroll behavior when modals are open or closed
    function setOverlay(overlay, open) {
        if (!overlay) return;
        overlay.classList.toggle('active', open);
        overlay.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
    }

    // Open the reusable product detail dialog for the selected product.
    function productToggle(id) {
        const product = products.get(id);
        if (!product) return;

        dom.productDetailImage.src = product.image;
        dom.productDetailImage.alt = product.name;
        dom.productDetailCategory.textContent = `${product.brand} · ${product.category}`;
        dom.productDetailTitle.textContent = product.name;
        dom.productDetailPrice.textContent = fmt(product.price);
        dom.productDetailDescription.textContent =
            `Explore the ${product.name} from ${product.brand}, selected from our ${product.category.toLowerCase()} collection.`;
        dom.productDetailCart.dataset.productId = id;
        setOverlay(dom.productDetailModal, true);
    }
    
    //function to open the wishlist modal and render its contents
    function openWishlist() {
        renderWishlist();
        setOverlay(dom.wishlistModal, true);
    }

    //function to update the wishlist button with the current number of items       
    function updateWishlistButton() {
        const count = state.wishlist.length;
        dom.wishlistButton.setAttribute('aria-label', `Wishlist${count ? ` (${count})` : ''}`);
    }

    //function to synchronize the wishlist buttons with the current state
    function syncWishlistButtons() {
        $$('.add-to-wishlist', dom.grid).forEach(button => {
            const id = button.closest('.product-card').dataset.productId;
            const active = state.wishlist.includes(id);
            button.classList.toggle('active', active);
            button.textContent = active ? '♥' : '♡';
            button.setAttribute('aria-pressed', active);
            button.setAttribute('title', active ? 'Remove from Wishlist' : 'Add to Wishlist');
        });
    }

    //toggle wishlist state for a product and update the UI accordingly
    function toggleWishlist(id) {
        const exists = state.wishlist.includes(id);
        setState('wishlist', exists
            ? state.wishlist.filter(item => item !== id)
            : [...state.wishlist, id]);
        renderWishlist();
        syncWishlistButtons();
    }

    //add a product to the cart, ensuring the quantity does not exceed the maximum allowed
    function addToCart(id, quantity = 1) {
        const product = products.get(id);
        if (!product) return;
        const next = Math.min((state.cart[id] || 0) + quantity, MAX_QTY);
        setState('cart', { ...state.cart, [id]: next });
        renderCart();
        showCartNotification(`${products.get(id).name} added to cart ✓`);
    }

    //display a temporary notification when an item is added to the cart
    function showCartNotification(message) {
        dom.cartNotification.textContent = message;
        dom.cartNotification.hidden = false;
        clearTimeout(showCartNotification.timer);
        showCartNotification.timer = setTimeout(() => {
            dom.cartNotification.hidden = true;
        }, 2800);
    }

    //remove a product from the cart and update the UI
    function removeFromCart(id) {
        const { [id]: removed, ...remaining } = state.cart;
        setState('cart', remaining);
        renderCart();
    }

    //Javascript function to fill a template row with product data, handling both text and object properties
    function fillTemplate(row, data) {
        Object.entries(data).forEach(([field, value]) => {
            const element = $(`[data-field="${field}"]`, row);
            if (!element) return;
            if (typeof value === 'object') Object.assign(element, value);
            else element.textContent = value;
        });
    }

    //display the wishlist items in the wishlist modal, updating the UI based on the current state
    function renderWishlist() {
        dom.wishlistItems.replaceChildren(...state.wishlist.map(id => {
            const product = products.get(id);
            const row = dom.wishlistTemplate.content.firstElementChild.cloneNode(true);
            row.dataset.productId = id;
            fillTemplate(row, {
                image: { src: product.image, alt: product.name },
                name: product.name,
                category: product.brand,
                price: fmt(product.price)
            });
            return row;
        }));
        const empty = state.wishlist.length === 0;
        dom.wishlistEmpty.hidden = !empty;
        dom.wishlistItems.hidden = empty;
        updateWishlistButton();
    }

    //display the cart items in the cart modal, updating the UI based on the current state
    function renderCart() {
        const entries = Object.entries(state.cart);
        dom.cartItems.replaceChildren(...entries.map(([id, quantity]) => {
            const product = products.get(id);
            if (!product) return;
            const row = dom.cartTemplate.content.firstElementChild.cloneNode(true);
            row.dataset.productId = id;
            fillTemplate(row, {
                image: { src: product.image, alt: product.name },
                name: product.name,
                category: product.brand,
                price: fmt(product.price),
                total: fmt(product.price * quantity),
                quantity: { value: quantity, max: MAX_QTY }
            });
            return row;
        }));
        dom.cartSummary.hidden = entries.length === 0;
        dom.cartTotal.textContent = fmt(cartTotal());
    }

    //display the checkout items in the checkout modal, updating the UI based on the current state
    function renderCheckout() {
        dom.checkoutProducts.replaceChildren(...Object.entries(state.cart).map(([id, quantity]) => {
            const product = products.get(id);
            if (!product) return;
            const row = dom.checkoutTemplate.content.firstElementChild.cloneNode(true);
            fillTemplate(row, {
                image: { src: product.image, alt: product.name },
                name: product.name,
                quantity: `${quantity} × ${fmt(product.price)}`,
                total: fmt(product.price * quantity)
            });
            return row;
        }));
        dom.checkoutTotal.textContent = fmt(cartTotal());
        $('.checkout-option p').textContent = state.address || 'Add your shipping address.';
        dom.addressButton.textContent = state.address ? 'Edit Address' : 'Add Address';
    }

    // Render the product grid, filtering and sorting based on user input
    function renderProducts() {
        const search = dom.search.value.trim().toLowerCase();
        const category = $('.category-button.active', dom.categories)?.dataset.category || 'All';
        //store all product cards in the grid for filtering and sorting
        const cards = $$('.product-card', dom.grid);

        // Filter products based on search query and selected category
        cards.forEach(card => {
            const product = products.get(card.dataset.productId);
            const matchesSearch = `${product.name} ${product.brand} ${card.dataset.category}`.toLowerCase().includes(search);
            const matchesCategory = category === 'All' || card.dataset.category === category;
            card.hidden = !matchesSearch || !matchesCategory;
        });

        // Sort the visible products based on the selected sorting option
        const sorted = [...cards].sort((a, b) => {
            const first = products.get(a.dataset.productId);
            const second = products.get(b.dataset.productId);
            if (dom.sort.value === 'low-high') return first.price - second.price;
            if (dom.sort.value === 'high-low') return second.price - first.price;
            if (dom.sort.value === 'name') return first.name.localeCompare(second.name);
            return 0;
        });
        // Append the sorted products back to the grid
        dom.grid.append(...sorted);
    }

    // Open the address modal and pre-fill it with the current address for editing
    function editAddress() {
        dom.addressInput.value = state.address;
        setOverlay(dom.addressModal, true);
        dom.addressInput.focus();
    }

    // Validate the address input, ensuring it meets the required criteria before submission
    function validateAddress() {
    const address = dom.addressInput.value.trim();
    // Reset previous validation message
    dom.addressInput.setCustomValidity('');
    // Check empty input
    if (!address) {
        dom.addressInput.setCustomValidity(
            'Please enter your shipping address.'
        );
    }
    // Check minimum length
    else if (address.length < 5) {
        dom.addressInput.setCustomValidity(
            'Address must contain at least 5 characters.'
        );
    }
    // Check maximum length
    else if (address.length > 200) {
        dom.addressInput.setCustomValidity(
            'Address cannot exceed 200 characters.'
        );
    }
    return dom.addressInput.checkValidity();
    }

    // Handle the order placement process, confirming with the user and clearing the cart upon confirmation
    function placeOrder() {
        if (!cartCount()) return;
        if (!window.confirm(`Place order for ${fmt(cartTotal())}?`)) return;
        setState('cart', {});
        renderCart();
        setOverlay(dom.checkout, false);
    }


    // Event Listener for adding products to the cart when the "Add to Cart" button is clicked
    dom.grid.addEventListener('click', event => {
        const card = event.target.closest('.product-card');
        if (!card) return;
        const id = card.dataset.productId;
        if (event.target.closest('.add-to-cart')) {
            addToCart(id);
            return;
        }
        if (!event.target.closest('.add-to-wishlist')) productToggle(id);
    });

    $$('.product-card', dom.grid).forEach(card => {
        card.tabIndex = 0;
        card.setAttribute('role', 'group');
        card.setAttribute('aria-label', `View details for ${products.get(card.dataset.productId).name}`);
    });

    dom.grid.addEventListener('keydown', event => {
        const card = event.target.closest('.product-card');
        if (!card || event.target !== card || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        productToggle(card.dataset.productId);
    });

    // Event Listener for toggling products in the wishlist when the "Add to Wishlist" button is clicked
    $$('.add-to-wishlist', dom.grid).forEach(button => {
        button.type = 'button';
        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(button.closest('.product-card').dataset.productId);
        });
    });

    // Event Listener for filtering products by category when a category button is clicked
    dom.categories.addEventListener('click', event => {
        const button = event.target.closest('.category-button');
        if (!button) return;
        $$('.category-button', dom.categories).forEach(item => item.classList.toggle('active', item === button));
        renderProducts();
    });

    // Event Listener for searching products when the search input is changed
    dom.search.addEventListener('input', renderProducts);
    // Event Listener for sorting products when the sort select is changed
    dom.sort.addEventListener('change', renderProducts);
    // Event Listener for removing products from the cart when the "Remove" button is clicked
    dom.cartItems.addEventListener('click', event => {
        const button = event.target.closest('[data-action="remove"]');
        if (button) removeFromCart(button.closest('.cart-item').dataset.productId);
    });
    // Event Listener for updating product quantities in the cart when the quantity input is changed
    dom.cartItems.addEventListener('change', event => {
        if (!event.target.matches('[data-field="quantity"]')) return;
        const id = event.target.closest('.cart-item').dataset.productId;
        const quantity = Math.max(1, Math.min(MAX_QTY, Math.floor(event.target.value) || 1));
        setState('cart', { ...state.cart, [id]: quantity });
        renderCart();
    });

    // Reload and validate cart state.
    window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEYS.cart) {
    }
    });

    // Event Listener for opening the wishlist modal when the "Wishlist" button is clicked
    dom.wishlistButton.setAttribute('aria-controls', 'wishlist-modal');
    document.addEventListener('click', event => {
        if (event.target.closest('#wishlist-button')) openWishlist();
    });

    // Event Listeners for managing the wishlist modal, including opening, closing, and removing items
    $('#close-wishlist').addEventListener('click', () => setOverlay(dom.wishlistModal, false));
    dom.wishlistModal.addEventListener('click', event => {
        if (event.target === dom.wishlistModal) setOverlay(dom.wishlistModal, false);
        const remove = event.target.closest('[data-action="remove"]');
        if (remove) toggleWishlist(remove.closest('[data-product-id]').dataset.productId);
    });

    // Event Listeners for managing the product detail modal, including adding to cart and closing the modal
    dom.productDetailCart.addEventListener('click', () => {
        addToCart(dom.productDetailCart.dataset.productId);
        setOverlay(dom.productDetailModal, false);
    });
    $('#close-product-detail').addEventListener('click', () => setOverlay(dom.productDetailModal, false));
    dom.productDetailModal.addEventListener('click', event => {
        if (event.target === dom.productDetailModal) setOverlay(dom.productDetailModal, false);
    });

    // Event Listener for opening the checkout modal when the "Checkout" button is clicked, and managing the checkout process
    dom.checkoutButton.addEventListener('click', () => {
        if (!cartCount()) return;
        renderCheckout();
        setOverlay(dom.checkout, true);
    });
    // Event Listener for closing the checkout modal when the "Close" button is clicked or when clicking outside the modal
    $('#close-checkout').addEventListener('click', () => setOverlay(dom.checkout, false));
    dom.checkout.addEventListener('click', event => {
        if (event.target === dom.checkout) setOverlay(dom.checkout, false);
    });

    //Event Listener for opening the address modal when the "Add/Edit Address" button is clicked, and handling the address form submission
    dom.addressButton.addEventListener('click', editAddress);

    // Event Listener for handling the address form submission, updating the state and UI accordingly
    dom.addressForm.addEventListener('submit', event => {
    event.preventDefault();
    // Validate address before proceeding
    if (!validateAddress()) {
        dom.addressInput.reportValidity();
        return;
    }
    const address = dom.addressInput.value.trim();
    // Update address only after successful validation
    setState('address', address);
    renderCheckout();
    setOverlay(dom.addressModal, false);
    });

    // Clear validation errors when the user modifies the address
    dom.addressInput.addEventListener('input', () => {
    dom.addressInput.setCustomValidity('');
    });

    // Event Listeners for closing the address modal when the "Close" button is clicked or when clicking outside the modal
    $('#close-address').addEventListener('click', () => setOverlay(dom.addressModal, false));
    dom.addressModal.addEventListener('click', event => {
        if (event.target === dom.addressModal) setOverlay(dom.addressModal, false);
    });
    dom.placeOrderButton.addEventListener('click', placeOrder);

    // Event Listener for closing modals when the Escape key is pressed
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            setOverlay(dom.wishlistModal, false);
            setOverlay(dom.productDetailModal, false);
            setOverlay(dom.checkout, false);
            setOverlay(dom.addressModal, false);
        }
    });

    renderWishlist();
    syncWishlistButtons();
    renderCart();
    renderProducts();
})();

# Pettikadai

Pettikadai is a simple, friendly online shopping storefront for browsing everyday products in one place. Users can search and sort products, filter them by category, open product details, add items to a cart, and save favourites to a wishlist.

The project is intentionally small and runs entirely in the browser. It is a front-end demo rather than a connected e-commerce system, so there is no server, database, real payment gateway, or order API behind it.

## Features

- Product browsing with category filters
- Search by product name, brand, or category
- Sorting by price or name
- Product detail pop-ups
- Shopping cart with editable quantities
- Wishlist with add, remove, and empty states
- Checkout review screen
- Delivery address form
- Indian Rupee (INR) price formatting
- Responsive layout for desktop, tablet, and mobile screens
- Keyboard-friendly product cards and Escape-to-close dialogs

## Tech stack

- **HTML5** - page structure, product markup, templates, and accessible dialog labels
- **CSS3** - layout, responsive breakpoints, visual styling, and modal states
- **Vanilla JavaScript** - search, filtering, sorting, cart, wishlist, checkout, and UI updates
- **Web Storage API** - keeps cart items, wishlist items, and the delivery address in the browser
- **Unsplash** - product and hero images loaded from external image URLs

There are no frameworks, build tools, or package dependencies. The product list is currently written directly in `index.html`, while `main.js` reads that markup and manages the interactive state.

## Getting started

Because this is a static website, it can be opened directly in a browser. For the smoothest local experience, serve the folder with a small static server such as VS Code Live Server.

1. Open the project folder.
2. Start a static server, or open `index.html` in a browser.
3. Browse the products and try the cart and wishlist interactions.

## How edge cases are handled

The app is designed to stay usable even when the browser gives it unexpected input:

- **Missing or damaged saved data:** Invalid `localStorage` values are ignored and replaced with safe empty defaults.
- **Outdated product IDs:** Cart and wishlist entries are checked against the products currently on the page, so removed products are not rendered.
- **Duplicate wishlist entries:** Wishlist IDs are de-duplicated before the state is used.
- **Invalid quantities:** Cart quantities are converted to numbers, limited to a maximum of `99`, and prevented from becoming zero or negative.
- **Empty cart:** Checkout does nothing when there are no items, and the cart summary remains hidden.
- **Empty wishlist:** A clear empty-state message is shown instead of an empty list.
- **Storage restrictions:** If browser storage is unavailable or full, the current session still works in memory.
- **Invalid addresses:** Addresses must contain between 5 and 200 characters before they can be saved.
- **Accidental orders:** Placing an order requires confirmation. Confirming clears the demo cart; it does not send a real order.
- **Unknown products:** Actions for missing product IDs are safely ignored rather than causing the interface to crash.
- **Modal usability:** Dialogs can be closed with their close button, by clicking outside them, or by pressing `Escape`. Page scrolling is also paused while a modal is open.

## Project files

- `index.html` - page content and product data
- `style.css` - all layout and visual styles
- `main.js` - application behavior and browser-side state management
- `favicon.svg` - site icon

## Note

This project is best suited as a learning project, portfolio demo, or starting point for a fuller store. A production version would need a backend, authenticated users, server-side inventory and pricing, secure payments, order persistence, and real delivery integration.

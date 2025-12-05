// Use Firebase first, then fallback to local products
async function getAllProducts() {
    // try firebase
    if (window.firebaseHelpers && typeof window.firebaseHelpers.fetchProducts === 'function') {
        const remote = await window.firebaseHelpers.fetchProducts();
        if (Array.isArray(remote) && remote.length > 0) {
            // normalize id to number if possible
            window.products = remote.map(p => ({ ...p, id: Number(p.id) || p.id }));
            localStorage.setItem('products_cache', JSON.stringify(window.products));
            return window.products;
        }
    }
    // try cached localStorage fallback
    const cached = (() => {
        try { return JSON.parse(localStorage.getItem('products_cache') || 'null'); } catch (e) { return null; }
    })();
    if (Array.isArray(cached) && cached.length) return cached;

    // fallback to in-file generator (100 products)
    if (!window.products || !Array.isArray(window.products) || window.products.length === 0) {
        const base = [
            { id: 1, name: 'Neon Keyboard Pro', description: 'RGB mechanical keyboard', price: 89.99, rating: 4, status: 'in_stock' },
            { id: 2, name: 'Cyber Mouse', description: 'Wireless gaming mouse', price: 49.99, rating: 5, status: 'in_stock' },
            { id: 3, name: 'LED Headphones', description: 'Premium audio experience', price: 129.99, rating: 4, status: 'in_stock' },
            { id: 4, name: 'Neon Monitor Stand', description: 'Ergonomic dual monitor mount', price: 59.99, rating: 3, status: 'in_stock' },
            { id: 5, name: 'USB-C Hub Elite', description: '7-in-1 connectivity solution', price: 79.99, rating: 5, status: 'in_stock' },
            { id: 6, name: 'Glowing Desk Lamp', description: 'Smart LED desk lighting', price: 69.99, rating: 4, status: 'in_stock' },
            { id: 7, name: 'Neon Cable Set', description: 'Premium braided cables (5-pack)', price: 39.99, rating: 4, status: 'in_stock' },
            { id: 8, name: 'Wireless Charger', description: 'Fast charging pad', price: 34.99, rating: 5, status: 'in_stock' },
            { id: 9, name: 'RGB Mousepad', description: 'Large gaming mousepad with lights', price: 44.99, rating: 4, status: 'in_stock' },
            { id: 10, name: 'Mechanical Switch Set', description: '100-pack switches', price: 99.99, rating: 5, status: 'in_stock' }
        ];
        window.products = base.slice();
        for (let i = 11; i <= 100; i++) {
            window.products.push({
                id: i,
                name: `Neon Product ${i}`,
                description: `High-quality neon tech item #${i}`,
                price: Math.floor(Math.random() * (200 - 20 + 1)) + 20,
                rating: Math.floor(Math.random() * 5) + 1,
                status: Math.random() > 0.1 ? 'in_stock' : 'out_of_order'
            });
        }
        localStorage.setItem('products_cache', JSON.stringify(window.products));
    }
    return window.products;
}

async function getProductById(id) {
    const all = await getAllProducts();
    return all.find(p => Number(p.id) === Number(id));
}

// ====== UTILITY FUNCTIONS ======
function getAllProducts() {
    return products;
}

function getProductById(id) {
    return products.find(p => p.id === id);
}

function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.length;
}

function addItemToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        const users = JSON.parse(localStorage.getItem('neonUsers')) || [];
        return users.find(u => u.username === user);
    }
    return null;
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

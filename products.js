// products.js - loads 100 products, handles search, cart, filters, sorting, wishlist, quick view

(function(){
	// --- Helpers & storage-aware product source ---
	function ensureProductsArray() {
		// If data.js defined a global "products", use it; otherwise create fallback
		if (typeof products !== 'undefined' && Array.isArray(products) && products.length > 0) {
			return products;
		}
		// Fallback: create 100 products if data.js not loaded
		const arr = [];
		for (let i = 1; i <= 100; i++) {
			arr.push({
				id: i,
				name: `Neon Product ${i}`,
				description: `High-quality neon tech item #${i}`,
				price: (Math.random() * 180 + 20),
				rating: Math.floor(Math.random() * 5) + 1,
				status: Math.random() > 0.1 ? 'in_stock' : 'out_of_order'
			});
		}
		window.products = arr;
		return arr;
	}

	// --- Storage helpers ---
	function getCart() {
		try { return JSON.parse(localStorage.getItem('cart')) || []; } 
		catch(e) { return []; }
	}
	function saveCart(cart) {
		localStorage.setItem('cart', JSON.stringify(cart));
	}
	function getCartTotal() {
		return getCart().length;
	}
	function addItemToCart(product) {
		const cart = getCart();
		cart.push({ id: product.id, name: product.name, price: product.price, addedAt: Date.now() });
		saveCart(cart);
	}

	function getCurrentUser() {
		const u = localStorage.getItem('currentUser');
		if (!u) return null;
		const users = JSON.parse(localStorage.getItem('neonUsers')) || [];
		return users.find(x => x.username === u) || { name: u };
	}

	// --- UI: bars & intro ---
	function createBars() {
		const container = document.getElementById('bars-container');
		if (!container) return;
		if (container.dataset.inited) return;
		const count = 50;
		for (let i = 0; i < count; i++) {
			const key = document.createElement('div');
			key.className = 'piano-key ' + (i % 2 === 0 ? 'white' : 'black');
			key.style.animationDelay = (i * 0.03) + 's';
			key.setAttribute('aria-hidden', 'true');
			container.appendChild(key);
		}
		container.dataset.inited = '1';
	}

	function initIntro() {
		setTimeout(() => {
			const intro = document.getElementById('intro');
			const page = document.getElementById('products-page');
			if (intro) intro.style.display = 'none';
			if (page) page.classList.remove('hidden');
			updateCartBadge();
			checkUserSession();
			loadProducts();
		}, 800);
	}

	// --- Render products with features ---
	let allProducts = [];
	let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
	let compareList = JSON.parse(localStorage.getItem('compareList')) || [];

	function renderProducts(list) {
		const grid = document.getElementById('productGrid');
		if (!grid) return;
		grid.innerHTML = '';
		
		if (!Array.isArray(list) || list.length === 0) {
			grid.innerHTML = '<p style="grid-column:1/-1; color:#aaa; text-align:center; padding:3rem;">No products found</p>';
			return;
		}
		
		list.forEach((p, idx) => {
			const isOut = p.status === 'out_of_order';
			const isWishlisted = wishlist.some(w => w.id === p.id);
			const inCompare = compareList.some(c => c.id === p.id);
			const card = document.createElement('div');
			card.className = 'product-card' + (isOut ? ' out-of-order' : '');
			card.setAttribute('role','article');
			card.innerHTML = `
				<div class="product-image" aria-hidden="true"><span>Image</span></div>
				${isOut ? '<div class="out-of-order-badge">Out of Order</div>' : ''}
				<div class="product-stock ${isOut ? 'stock-out' : 'stock-in'}">${isOut ? 'Out of Stock' : 'In Stock'}</div>
				<button class="wishlist-btn ${isWishlisted ? 'wishlisted' : ''}" onclick="toggleWishlist(${p.id})" title="Add to wishlist">
					${isWishlisted ? '❤️' : '🤍'}
				</button>
				<h3>${escapeHtml(p.name)}</h3>
				<p>${escapeHtml(p.description)}</p>
				<div class="product-rating">${'⭐'.repeat(p.rating)}</div>
				<div class="product-price">$${p.price.toFixed(2)}</div>
				<div class="product-actions">
					<button class="add-to-cart-btn" ${isOut ? 'disabled' : ''} data-id="${p.id}">
						${isOut ? 'Unavailable' : 'Add to Cart'}
					</button>
					<button class="quick-view-btn" onclick="quickView(${p.id})">👁️</button>
					<button class="quick-view-btn ${inCompare ? 'in-compare' : ''}" onclick="addToCompare(${p.id})" title="Compare">⚖️</button>
				</div>
			`;
			grid.appendChild(card);
		});
	}

	function toggleWishlist(id) {
		const product = allProducts.find(p => p.id === id);
		if (!product) return;
		const idx = wishlist.findIndex(w => w.id === id);
		if (idx === -1) {
			wishlist.push({ id: product.id, name: product.name, price: product.price });
		} else {
			wishlist.splice(idx, 1);
		}
		localStorage.setItem('wishlist', JSON.stringify(wishlist));
		renderProducts(allProducts);
	}

	function addToCompare(id) {
		const product = allProducts.find(p => p.id === id);
		if (!product) return;
		const idx = compareList.findIndex(c => c.id === id);
		if (idx !== -1) {
			compareList.splice(idx, 1);
		} else {
			if (compareList.length >= 3) {
				alert('Max 3 products to compare');
				return;
			}
			compareList.push({ id: product.id, name: product.name, price: product.price, rating: product.rating, status: product.status });
		}
		localStorage.setItem('compareList', JSON.stringify(compareList));
		renderProducts(allProducts);
	}

	function quickView(id) {
		const product = allProducts.find(p => p.id === id);
		if (!product) return;
		const modal = document.createElement('div');
		modal.className = 'quick-view-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<button class="modal-close" onclick="this.closest('.quick-view-modal').remove()">✕</button>
				<h2>${escapeHtml(product.name)}</h2>
				<div class="modal-image">Image placeholder</div>
				<p>${escapeHtml(product.description)}</p>
				<div class="modal-rating">⭐ ${product.rating}/5</div>
				<div class="modal-price">$${product.price.toFixed(2)}</div>
				<button class="add-to-cart-btn" onclick="addToCart(${product.id}); this.closest('.quick-view-modal').remove();">Add to Cart</button>
			</div>
		`;
		document.body.appendChild(modal);
	}

	// --- Filtering & Sorting ---
	function setupFilters() {
		const priceMin = document.getElementById('filterPriceMin');
		const priceMax = document.getElementById('filterPriceMax');
		const ratingFilter = document.getElementById('filterRating');
		const sortBtn = document.getElementById('sortBtn');
		
		function applyFilters() {
			let filtered = allProducts.slice();
			if (priceMin?.value) filtered = filtered.filter(p => p.price >= parseFloat(priceMin.value));
			if (priceMax?.value) filtered = filtered.filter(p => p.price <= parseFloat(priceMax.value));
			if (ratingFilter?.value) filtered = filtered.filter(p => p.rating >= parseInt(ratingFilter.value));
			renderProducts(filtered);
		}
		
		priceMin?.addEventListener('change', applyFilters);
		priceMax?.addEventListener('change', applyFilters);
		ratingFilter?.addEventListener('change', applyFilters);
		
		sortBtn?.addEventListener('change', (e) => {
			const val = e.target.value;
			const sorted = allProducts.slice();
			if (val === 'price-asc') sorted.sort((a,b) => a.price - b.price);
			else if (val === 'price-desc') sorted.sort((a,b) => b.price - a.price);
			else if (val === 'rating') sorted.sort((a,b) => b.rating - a.rating);
			else if (val === 'newest') sorted.sort((a,b) => b.id - a.id);
			renderProducts(sorted);
		});
	}

	// --- Load and search ---
	function loadProducts() {
		allProducts = ensureProductsArray();
		renderProducts(allProducts);
	}

	function setupSearch() {
		const input = document.getElementById('searchBar');
		if (!input) return;
		let timeout;
		input.addEventListener('input', () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				const q = input.value.trim().toLowerCase();
				if (!q) return renderProducts(allProducts);
				const filtered = allProducts.filter(p =>
					(p.name && p.name.toLowerCase().includes(q)) ||
					(p.description && p.description.toLowerCase().includes(q))
				);
				renderProducts(filtered);
			}, 200);
		});
	}

	// --- cart/button delegation ---
	function setupCartButtons() {
		document.addEventListener('click', (e) => {
			const btn = e.target.closest('.add-to-cart-btn');
			if (!btn) return;
			const id = parseInt(btn.dataset.id,10);
			const product = allProducts.find(p => p.id === id);
			if (!product) return alert('Product not found');
			if (product.status === 'out_of_order') {
				alert('This product is currently out of order');
				return;
			}
			addItemToCart(product);
			updateCartBadge();
			alert(`Added ${product.name} to cart`);
		});
	}

	// --- cart badge & user session ---
	function updateCartBadge() {
		const b = document.getElementById('cartBadge');
		if (!b) return;
		const count = getCartTotal();
		b.textContent = count;
	}

	function checkUserSession() {
		const currentUserName = localStorage.getItem('currentUser');
		const userInfo = document.getElementById('userInfo');
		const logoutBtn = document.getElementById('logoutBtn');
		if (currentUserName && userInfo) {
			userInfo.textContent = `👤 ${currentUserName}`;
			if (logoutBtn) logoutBtn.classList.remove('hidden');
			document.querySelectorAll('button[onclick*="login"], button[onclick*="signup"]').forEach(btn => btn.classList.add('hidden'));
		}
	}

	// --- safe nav funcs exposed for inline onclicks ---
	window.go = function(page){ window.location.href = page + '.html'; };
	window.toggleUserMenu = function(){
		const m = document.getElementById('userMenu');
		if (m) m.classList.toggle('hidden');
	};
	window.logoutUser = function(){
		if (confirm('Logout?')) {
			localStorage.removeItem('currentUser');
			localStorage.removeItem('authToken');
			window.location.href = 'login.html';
		}
	};
	window.getCartTotal = getCartTotal;
	window.quickView = quickView;
	window.toggleWishlist = toggleWishlist;
	window.addToCompare = addToCompare;
	window.addToCart = function(id) {
		const product = allProducts.find(p => p.id === id);
		if (product) addItemToCart(product);
	};
	window.escapeHtml = escapeHtml;

	function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

	// --- init on load ---
	window.addEventListener('load', function(){
		createBars();
		initIntro();
		setupSearch();
		setupCartButtons();
		setupFilters();
		document.querySelectorAll('button[onclick*="login"], button[onclick*="signup"]').forEach(btn => {
			if (localStorage.getItem('currentUser')) btn.classList.add('hidden');
		});
	});

	window.loadProducts = loadProducts;
})();

(function(){
	const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
	const grid = document.getElementById('wishlistGrid');

	setTimeout(() => {
		document.getElementById('intro').style.display = 'none';
		document.getElementById('wishlist-page').classList.remove('hidden');
	}, 700);

	function renderWishlist() {
		grid.innerHTML = '';
		if (wishlist.length === 0) {
			grid.innerHTML = '<p style="grid-column:1/-1; color:#aaa; text-align:center; padding:3rem;">Your wishlist is empty</p>';
			return;
		}
		
		wishlist.forEach(item => {
			const card = document.createElement('div');
			card.className = 'product-card';
			card.innerHTML = `
				<div class="product-image">Image</div>
				<h3>${item.name}</h3>
				<div class="product-price">$${item.price.toFixed(2)}</div>
				<div class="product-actions">
					<button class="add-to-cart-btn" onclick="addToCart(${item.id})">Add to Cart</button>
					<button class="quick-view-btn" onclick="removeFromWishlist(${item.id})">Remove</button>
				</div>
			`;
			grid.appendChild(card);
		});
	}

	window.removeFromWishlist = function(id) {
		const idx = wishlist.findIndex(w => w.id === id);
		if (idx !== -1) {
			wishlist.splice(idx, 1);
			localStorage.setItem('wishlist', JSON.stringify(wishlist));
			renderWishlist();
		}
	};

	window.go = function(page) { window.location.href = page + '.html'; };
	window.addToCart = function(id) { alert('Added to cart'); };

	renderWishlist();
})();

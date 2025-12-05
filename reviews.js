// Product reviews logic
// ...existing code...

document.addEventListener('DOMContentLoaded', () => {
    // Placeholder for reviews
    document.getElementById('reviews-list').innerHTML = '<p>No reviews yet.</p>';
});

(function(){
	const reviews = JSON.parse(localStorage.getItem('productReviews')) || [];
	const list = document.getElementById('reviews-list');

	function renderReviews() {
		if (!list) return;
		list.innerHTML = '';
		
		if (reviews.length === 0) {
			list.innerHTML = '<p style="color: #aaa; text-align: center; padding: 3rem;">No reviews yet</p>';
			return;
		}

		reviews.forEach(r => {
			const div = document.createElement('div');
			div.style.cssText = 'border: 2px solid #0ff; border-radius: 10px; padding: 1.5rem; margin: 1rem 0; background: rgba(0,0,34,0.7);';
			div.innerHTML = `
				<div style="display: flex; justify-content: space-between; align-items: center;">
					<h3 style="color: #0ff; margin: 0;">${r.productName}</h3>
					<div style="color: #ff0;">⭐ ${r.rating}/5</div>
				</div>
				<p style="color: #aaa; margin: 0.5rem 0;"><strong>${r.userName}</strong></p>
				<p style="color: #ddd; margin: 0.5rem 0;">${r.text}</p>
				<small style="color: #666;">${new Date(r.date).toLocaleDateString()}</small>
			`;
			list.appendChild(div);
		});
	}

	renderReviews();
})();

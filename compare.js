(function(){
	const compareList = JSON.parse(localStorage.getItem('compareList')) || [];

	setTimeout(() => {
		document.getElementById('intro').style.display = 'none';
		document.getElementById('compare-page').classList.remove('hidden');
	}, 700);

	function renderCompare() {
		if (compareList.length === 0) {
			document.getElementById('compareMsg').style.display = 'block';
			return;
		}
		document.getElementById('compareMsg').style.display = 'none';

		compareList.slice(0, 3).forEach((p, i) => {
			const idx = i + 1;
			document.getElementById(`comp${idx}`).textContent = p.name;
			document.getElementById(`price${idx}`).textContent = `$${p.price.toFixed(2)}`;
			document.getElementById(`rating${idx}`).textContent = `⭐ ${p.rating}/5`;
			document.getElementById(`status${idx}`).textContent = p.status === 'out_of_order' ? 'Out of Stock' : 'In Stock';
		});
	}

	window.go = function(page) { window.location.href = page + '.html'; };
	renderCompare();
})();

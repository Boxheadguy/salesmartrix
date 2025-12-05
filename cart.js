// Shopping cart logic for Sales Matrix
// ...existing code...

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsDiv = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Example: Load cart items from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    renderCart(cart);

    checkoutBtn.addEventListener('click', () => {
        alert('Checkout feature coming soon!');
    });

    function renderCart(cart) {
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }
        cartItemsDiv.innerHTML = cart.map(item => `
            <div class="cart-item">
                <span>${item.name}</span> - <span>${item.price}</span>
                <button onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        `).join('');
    }
});

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    location.reload();
}

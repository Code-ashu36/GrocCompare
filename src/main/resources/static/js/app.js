// 1. Splash Screen Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) splash.style.opacity = '0';
        setTimeout(() => splash.classList.add('hidden'), 800);
    }, 2500);
});

// 2. Wishlist Logic (Using LocalStorage)
let wishlist = JSON.parse(localStorage.getItem('grocWishlist')) || [];

function toggleWishlist() {
    const box = document.getElementById('wishlist-container');
    box.classList.toggle('hidden');
}

function addToWishlist(name, price) {
    if (!wishlist.find(i => i.name === name)) {
        wishlist.push({ name, price });
        localStorage.setItem('grocWishlist', JSON.stringify(wishlist));
        renderWishlist();
    }
}

function removeFromWishlist(name) {
    wishlist = wishlist.filter(i => i.name !== name);
    localStorage.setItem('grocWishlist', JSON.stringify(wishlist));
    renderWishlist();
}

function renderWishlist() {
    const container = document.getElementById('wishlist-items');
    if (wishlist.length === 0) {
        container.innerHTML = '<p style="font-size:0.8rem; color:#aaa;">No items saved.</p>';
        return;
    }
    container.innerHTML = wishlist.map(item => `
        <div class="wish-item">
            <div>${item.name.substring(0, 15)}...<br><span>₹${item.price}</span></div>
            <div class="remove-wish" onclick="removeFromWishlist('${item.name}')">REMOVE</div>
        </div>
    `).join('');
}

// 3. Search & View Management
async function performSearch() {
    const query = document.getElementById('item-search').value;
    const location = document.getElementById('location-picker').value;
    const loader = document.getElementById('loader');

    if (!query) return;
    switchView('compare');

    if (loader) loader.classList.remove('hidden');
    document.getElementById('comparison-results').innerHTML = '';

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
        const data = await response.json();
        renderResults(data);
    } catch (error) {
        console.error("Fetch failed", error);
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

function renderResults(data) {
    const grid = document.getElementById('comparison-results');
    if (!data.comparisonResults) return;

    data.comparisonResults.forEach(p => {
        const card = `
            <div class="product-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="deal-tag ${p.priceStatus === 'Low' ? 'best-deal' : ''}">
                        ${p.platformId}
                    </span>
                    <span class="icon" onclick="addToWishlist('${p.productName}', ${p.currentPrice})" style="cursor:pointer;">♡</span>
                </div>
                <h3>${p.productName}</h3>
                <p class="price">₹${p.currentPrice.toFixed(2)} <span class="history-trigger" title="Price History">📈</span></p>
                <p class="rate">Rate: ₹${p.normalizedPrice.toFixed(2)} /unit</p>
                <a href="${p.productLink}" target="_blank" class="buy-btn">Compare Prices</a>
            </div>`;
        grid.insertAdjacentHTML('beforeend', card);
    });
}

// 4. Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderWishlist();
    
    // Header Search Link
    window.handleHeaderSearch = (e) => {
        if (e.key === 'Enter') {
            document.getElementById('item-search').value = document.getElementById('header-query').value;
            performSearch();
        }
    };
});

// Rest of your Budget/Theme logic...
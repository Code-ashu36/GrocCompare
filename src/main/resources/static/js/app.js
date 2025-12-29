/**
 * GrocCompare Pro - Main Application Logic
 * Fixed Functionality for Minimalist UI
 */

// 1. Splash Screen Management
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.classList.add('hidden'), 800);
        }
    }, 2000); // 2-second splash
});

// 2. Global State & Wishlist
let wishlist = JSON.parse(localStorage.getItem('grocWishlist')) || [];

// 3. View Switcher Logic
function switchView(viewId) {
    const compareView = document.getElementById('comparison-view');
    const budgetAsst = document.getElementById('budget-assistant');
    const hero = document.getElementById('hero-section');
    const navCompare = document.getElementById('nav-compare');
    const navBudget = document.getElementById('nav-budget');

    if (viewId === 'budget') {
        compareView.classList.add('hidden');
        budgetAsst.classList.remove('hidden');
        hero.classList.add('hidden'); // Hide hero to focus on budget
        navBudget.classList.add('active');
        navCompare.classList.remove('active');
    } else {
        compareView.classList.remove('hidden');
        budgetAsst.classList.add('hidden');
        hero.classList.remove('hidden');
        navCompare.classList.add('active');
        navBudget.classList.remove('active');
    }
}

// 4. Header Search Functionality
function handleHeaderSearch(event) {
    if (event.key === 'Enter') {
        const headerVal = document.getElementById('header-query').value;
        if (headerVal) {
            document.getElementById('item-search').value = headerVal;
            performSearch();
        }
    }
}

// 5. Quick Search (Pills)
function quickSearch(itemQuery) {
    const mainInput = document.getElementById('item-search');
    mainInput.value = itemQuery;
    performSearch();
}

// 6. Main Search Logic (Comparison Engine)
async function performSearch() {
    const query = document.getElementById('item-search').value;
    const location = document.getElementById('location-picker').value;
    const loader = document.getElementById('loader');
    const grid = document.getElementById('comparison-results');
    const summary = document.getElementById('results-summary');

    if (!query) return;

    // Ensure we are in comparison view
    switchView('compare');

    // UI Feedback
    if (loader) loader.classList.remove('hidden');
    grid.innerHTML = '';
    summary.style.display = 'none';

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
        const data = await response.json();
        
        if (loader) loader.classList.add('hidden');
        renderResults(data);
    } catch (error) {
        if (loader) loader.classList.add('hidden');
        console.error("Search failed:", error);
    }
}

function renderResults(data) {
    const grid = document.getElementById('comparison-results');
    const summary = document.getElementById('results-summary');
    
    if (!data || !data.comparisonResults || data.comparisonResults.length === 0) {
        summary.style.display = 'block';
        summary.innerHTML = "No live deals found. Try another product.";
        return;
    }

    summary.style.display = 'block';
    summary.innerHTML = `Found <strong>${data.comparisonResults.length}</strong> deals. Best: ${data.globalBestDeal.platformId} (₹${data.globalBestDeal.currentPrice})`;

    data.comparisonResults.forEach(product => {
        const isBest = product.priceStatus === 'Low';
        const card = `
            <div class="product-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="deal-tag ${isBest ? 'best-deal' : ''}">
                        ${isBest ? 'Best Deal' : 'Market Price'} • ${product.platformId}
                    </span>
                    <span class="icon" onclick="addToWishlist('${product.productName.replace(/'/g, "\\'")}', ${product.currentPrice})" style="cursor:pointer; opacity:0.4;">♡</span>
                </div>
                <h3>${product.productName}</h3>
                <p class="price">₹${product.currentPrice.toFixed(2)} <span class="history-trigger" title="Price Trend">📈</span></p>
                <p class="rate">Rate: ₹${product.normalizedPrice.toFixed(2)}/unit</p>
                <a href="${product.productLink}" target="_blank" class="buy-btn">Compare Prices</a>
            </div>`;
        grid.insertAdjacentHTML('beforeend', card);
    });
}

// 7. Wishlist Operations
function addToWishlist(name, price) {
    if (!wishlist.find(i => i.name === name)) {
        wishlist.push({ name, price });
        localStorage.setItem('grocWishlist', JSON.stringify(wishlist));
        renderWishlist();
        alert("Added to saved items!");
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
            <div>${item.name.substring(0, 18)}...<br><strong>₹${item.price}</strong></div>
            <div class="remove-wish" onclick="removeFromWishlist('${item.name.replace(/'/g, "\\'")}')">REMOVE</div>
        </div>
    `).join('');
}

function toggleWishlist() {
    const box = document.getElementById('wishlist-container');
    box.classList.toggle('hidden');
}

// 8. Budget Assistant Logic
function handleCalculateBudget() {
    const budget = document.getElementById('monthly-budget').value;
    const size = document.getElementById('household-size').value;
    const resultsBox = document.getElementById('budget-results');

    if (!budget || !size) return;
    const perPerson = budget / size;

    resultsBox.innerHTML = `
        <h3 style="margin-bottom:10px;">✅ AI Strategy (₹${budget})</h3>
        <p>Target: ₹${Math.round(perPerson)} per person/month.</p>
        <ul style="margin-top:10px; padding-left:20px; text-align:left;">
            <li><strong>Bulk Buying:</strong> Buy staples (Atta, Sugar) in 10kg+ packs to lower unit price.</li>
            <li><strong>Store Swap:</strong> Use the Comparison Engine daily for Milk and Vegetables.</li>
            <li><strong>Brand Neutrality:</strong> Switch to store labels (e.g., BigBasket Popular) for 20% savings.</li>
        </ul>`;
}

// 9. Initializers
document.addEventListener('DOMContentLoaded', () => {
    renderWishlist();
    
    // Main Search Click
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.onclick = performSearch;

    // Main Search Enter Key
    const mainInput = document.getElementById('item-search');
    if (mainInput) {
        mainInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // Budget Calculate Click
    const calcBtn = document.getElementById('calculate-budget-btn');
    if (calcBtn) calcBtn.onclick = handleCalculateBudget;

    // Dark Mode Toggle
    const themeBtn = document.getElementById('dark-mode-toggle');
    if (themeBtn) {
        themeBtn.onclick = () => document.body.classList.toggle('dark-mode');
    }
});
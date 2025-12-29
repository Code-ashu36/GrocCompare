/**
 * GrocCompare Pro - Premium Minimal Logic
 */

// 1. Splash Screen Fade Logic
window.addEventListener('load', () => {
    // Artificial delay to show premium splash
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.classList.add('hidden');
            }, 1000);
        }
    }, 2800); 
});

// 2. Global State & Initialization
let currentView = 'compare';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme from LocalStorage
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Event Listeners
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleTheme);
    
    document.getElementById('item-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    renderWishlist();
});

// 3. Theme Management (Fixed Contrast)
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// 4. View Management
function switchView(viewId) {
    const compareSection = document.getElementById('comparison-view');
    const budgetSection = document.getElementById('budget-assistant');
    const heroSection = document.querySelector('.premium-hero');

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    if (viewId === 'budget') {
        compareSection.classList.add('hidden');
        budgetSection.classList.remove('hidden');
        heroSection.classList.add('hidden');
        document.getElementById('nav-budget').classList.add('active');
    } else {
        compareSection.classList.remove('hidden');
        budgetSection.classList.add('hidden');
        heroSection.classList.remove('hidden');
        document.getElementById('nav-compare').classList.add('active');
    }
}

// 5. Header Search Link
function handleHeaderSearch(event) {
    if (event.key === 'Enter') {
        const val = document.getElementById('header-query').value;
        document.getElementById('item-search').value = val;
        performSearch();
    }
}

function quickSearch(item) {
    document.getElementById('item-search').value = item;
    performSearch();
}

// 6. Backend API Interaction
async function performSearch() {
    const query = document.getElementById('item-search').value;
    const location = document.getElementById('location-picker').value;
    const loader = document.getElementById('loader');
    const grid = document.getElementById('comparison-results');

    if (!query) return;

    // UI state
    switchView('compare');
    loader.classList.remove('hidden');
    grid.innerHTML = '';

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
        const data = await response.json();
        
        renderResults(data);
    } catch (error) {
        console.error("Fetch failed", error);
    } finally {
        loader.classList.add('hidden');
    }
}

// 7. Results Rendering (Ultra-Clean Card)
function renderResults(data) {
    const grid = document.getElementById('comparison-results');
    const summary = document.getElementById('results-summary');

    if (!data.comparisonResults || data.comparisonResults.length === 0) {
        summary.innerHTML = "No products found.";
        return;
    }

    summary.innerHTML = `Found ${data.comparisonResults.length} market deals. Best: ${data.globalBestDeal.platformId}`;

    data.comparisonResults.forEach(p => {
        const card = `
            <div class="product-card">
                <div class="best-deal-tag">${p.platformId}</div>
                <h3>${p.productName}</h3>
                <p class="price">₹${p.currentPrice.toFixed(2)}</p>
                <p class="rate">₹${p.normalizedPrice.toFixed(2)} per unit</p>
                <a href="${p.productLink}" target="_blank" class="compare-outline-btn">Compare Price</a>
            </div>`;
        grid.insertAdjacentHTML('beforeend', card);
    });
}

// 8. Budget Assistant Strategy
function handleCalculateBudget() {
    const budget = document.getElementById('monthly-budget').value;
    const size = document.getElementById('household-size').value;
    const resultDiv = document.getElementById('budget-results');

    if (!budget || !size) return;
    const ppp = Math.round(budget / size);

    resultDiv.innerHTML = `
        <div class="premium-card" style="background:#f9f9f9; padding:20px; border-radius:15px; margin-top:20px;">
            <h4>Monthly Strategy: ₹${ppp} per person</h4>
            <ul style="margin-top:15px; text-align:left; padding-left:20px; font-size:0.9rem; color:#555;">
                <li>Switch to store brands for staples to save up to 20%.</li>
                <li>Compare Milk and Oil daily as these have high price volatility.</li>
            </ul>
        </div>
    `;
}

// Placeholder for Wishlist
function renderWishlist() {
    // Basic implementation for the sidebar box
}
function toggleWishlist() {
    document.getElementById('wishlist-container').classList.toggle('hidden');
}
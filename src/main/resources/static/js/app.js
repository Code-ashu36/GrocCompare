/**
 * GrocCompare Pro | Premium Logic Engine
 */

// 1. Splash Screen & Initialization
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.classList.add('hidden'), 1000);
        }
    }, 2500); // Premium loading duration
});

document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    const themeBtn = document.getElementById('dark-mode-toggle');
    themeBtn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };

    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

    // Search Buttons
    document.getElementById('search-btn').onclick = performSearch;
    document.getElementById('item-search').onkeypress = (e) => {
        if (e.key === 'Enter') performSearch();
    };
});

// 2. View Management
function switchView(viewId) {
    const compareView = document.getElementById('comparison-view');
    const budgetView = document.getElementById('budget-assistant');
    const hero = document.querySelector('.hero-sky');

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    if (viewId === 'budget') {
        compareView.classList.add('hidden');
        budgetView.classList.remove('hidden');
        hero.classList.add('hidden');
        document.getElementById('nav-budget').classList.add('active');
    } else {
        compareView.classList.remove('hidden');
        budgetView.classList.add('hidden');
        hero.classList.remove('hidden');
        document.getElementById('nav-compare').classList.add('active');
    }
}

// 3. Search Implementation
async function performSearch() {
    const query = document.getElementById('item-search').value;
    const location = document.getElementById('location-picker').value;
    const loader = document.getElementById('loader');
    const grid = document.getElementById('comparison-results');

    if (!query) return;

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

// 4. Accent-Driven UI Rendering
function renderResults(data) {
    const grid = document.getElementById('comparison-results');
    const summary = document.getElementById('results-summary');
    
    // Pastel color rotation
    const accents = ['#dbe9ff', '#ebe5ff', '#e4fff3', '#fff4e6'];

    if (!data.comparisonResults || data.comparisonResults.length === 0) {
        summary.innerHTML = "No live market data found.";
        return;
    }

    summary.innerHTML = `Analyzing ${data.comparisonResults.length} market sources. Best Price at ${data.globalBestDeal.platformId}.`;

    data.comparisonResults.forEach((p, index) => {
        const randomAccent = accents[index % accents.length];
        const card = `
            <div class="product-card" style="--card-accent: ${randomAccent}">
                <div class="card-img-block">
                    <img src="${p.imageUrl}" alt="product">
                </div>
                <div class="card-body">
                    <div class="deal-badge" style="background: ${p.priceStatus === 'Low' ? '#f0fff6' : 'rgba(0,0,0,0.05)'}">
                        ${p.priceStatus === 'Low' ? 'Best Deal' : 'Market Price'} • ${p.platformId}
                    </div>
                    <h3>${p.productName}</h3>
                    <p class="price-large">₹${p.currentPrice.toFixed(2)}</p>
                    <p class="rate-muted">Rate: ₹${p.normalizedPrice.toFixed(2)}/unit</p>
                    <a href="${p.productLink}" target="_blank" class="compare-btn-minimal">Compare Price</a>
                </div>
            </div>`;
        grid.insertAdjacentHTML('beforeend', card);
    });
}

// 5. Budget logic (Restored)
function handleCalculateBudget() {
    const budget = document.getElementById('monthly-budget').value;
    const size = document.getElementById('household-size').value;
    const resultBox = document.getElementById('budget-results');

    if (!budget || !size) return;
    const perPerson = Math.round(budget / size);

    resultBox.innerHTML = `
        <div class="budget-strategy-card" style="background: var(--grey-100); padding: 30px; border-radius: 20px; border: 1px solid var(--grey-200); margin-top: 30px;">
            <h3>AI Spending Strategy</h3>
            <p>Target: ₹${perPerson} per person/month.</p>
            <ul style="margin-top:15px; text-align:left; padding-left:20px; font-size:0.9rem; line-height:1.6;">
                <li><strong>Dynamic Comparison:</strong> Use live search for Milk and Atta to capture 10% market variance.</li>
                <li><strong>Bulk Advantage:</strong> Buying 5kg+ packs reduces the normalized unit rate by ~15%.</li>
            </ul>
        </div>`;
}

// 6. Header/Quick search
function handleHeaderSearch(e) { if (e.key === 'Enter') { document.getElementById('item-search').value = document.getElementById('header-query').value; performSearch(); } }
function quickSearch(item) { document.getElementById('item-search').value = item; performSearch(); }
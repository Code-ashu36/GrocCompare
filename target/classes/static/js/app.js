// Global State
let shoppingList = []; 

// Quick Search Handler
function quickSearch(itemQuery) {
    const input = document.getElementById('item-search');
    if (input) {
        input.value = itemQuery;
        const btn = document.getElementById('search-btn');
        if (btn) btn.click();
    }
}

// View Controller
function switchView(viewId) {
    const compareView = document.getElementById('comparison-view');
    const budgetAsst = document.getElementById('budget-assistant'); 
    const sidebar = document.getElementById('shortcuts-sidebar');
    
    if (!compareView || !budgetAsst) return;

    if (viewId === 'budget') {
        compareView.style.display = 'none';
        budgetAsst.style.display = 'block';
        if (sidebar) sidebar.style.display = 'none';
    } else {
        compareView.style.display = 'block';
        budgetAsst.style.display = 'none';
        if (sidebar) sidebar.style.display = 'block';
    }

    const navLinks = document.querySelectorAll('.header nav a');
    navLinks.forEach(link => {
        link.classList.remove('active-link');
        if (link.id === `nav-${viewId}`) link.classList.add('active-link');
    });
}

async function getSearchResults(query) {
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loader-text');
    const location = document.getElementById('location-picker').value;

    if (loaderText) loaderText.textContent = `Fetching live prices for ${location}...`;
    if (loader) loader.classList.remove('hidden');

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
        const data = await response.json();
        if (loader) loader.classList.add('hidden');
        return data;
    } catch (error) {
        if (loader) loader.classList.add('hidden');
        console.error("Search failed:", error);
        return null;
    }
}

// Replace your renderResults function with this version
function renderResults(data) {
    const resultsContainer = document.getElementById('comparison-results');
    const summaryContainer = document.getElementById('results-summary');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = ''; 

    if (!data || !data.comparisonResults || data.comparisonResults.length === 0) {
        if (summaryContainer) {
            summaryContainer.style.display = 'block';
            summaryContainer.innerHTML = "No results found.";
        }
        return;
    }

    if (summaryContainer) {
        summaryContainer.style.display = 'block';
        summaryContainer.innerHTML = `✅ Found ${data.comparisonResults.length} deals. Best: ${data.globalBestDeal.platformId} (₹${data.globalBestDeal.price.toFixed(2)})`;
    }

    data.comparisonResults.forEach(product => {
        const unitPrice = product.normalizedPrice ? product.normalizedPrice.toFixed(2) : product.currentPrice.toFixed(2);
        
        // Ensure productLink matches your Java Record field name exactly
        const finalLink = product.productLink || "#";
        const isValid = finalLink !== "#";

        let badgeColor = "#FFC107"; 
        let badgeText = "Fair Price";
        if (product.priceStatus === "Low") { badgeColor = "#4CAF50"; badgeText = "Great Deal"; }
        else if (product.priceStatus === "High") { badgeColor = "#F44336"; badgeText = "High Price"; }

        // We use a real <a> tag here for the best browser compatibility
        const card = `
            <div class="product-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h3 style="margin:0;">${product.platformId}</h3>
                    <span style="background: ${badgeColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7em; font-weight: bold;">${badgeText}</span>
                </div>
                <p><strong>${product.productName}</strong></p>
                <p>Price: <span style="font-size: 1.2em; color: var(--success-color); font-weight: bold;">₹${product.currentPrice.toFixed(2)}</span></p>
                <p style="color: #777; font-size: 0.8em; margin-bottom: 15px;">Rate: ₹${unitPrice} per kg/L</p>
                
                <a href="${finalLink}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
                    <button class="buy-btn" ${!isValid ? 'disabled style="opacity:0.5;"' : ''} onclick="console.log('Opening: ${finalLink}')">
                        ${isValid ? 'Buy Now' : 'Link Unavailable'}
                    </button>
                </a>
            </div>
        `;
        resultsContainer.insertAdjacentHTML('beforeend', card);
    });
}

function handleCalculateBudget() {
    const budget = parseInt(document.getElementById('monthly-budget').value);
    const size = parseInt(document.getElementById('household-size').value);
    const resultsBox = document.getElementById('budget-results');
    if (!resultsBox) return;

    const perPerson = budget / size;
    let strategy = perPerson < 3500 ? 
        `<li><strong>Buy Bulk:</strong> 5kg packs save ~15%.</li><li><strong>Store Brands:</strong> Switch to 'Fresho' for 20% off.</li>` : 
        `<li><strong>Value Packs:</strong> Buy boxes of 6+ to lower unit price.</li><li><strong>Weekly Sales:</strong> Check rates on Mondays.</li>`;

    resultsBox.style.backgroundColor = perPerson < 3500 ? "#F44336" : "#4CAF50";
    resultsBox.innerHTML = `
        <h3 style="color: white;">✅ AI Coach Strategy</h3>
        <p style="color: white;">Budget: ₹${budget} | ₹${Math.round(perPerson)} per person</p>
        <ul style="text-align: left; margin-top: 15px; color: white;">${strategy}</ul>
    `;
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    switchView('compare'); 

    const navCompare = document.getElementById('nav-compare');
    const navBudget = document.getElementById('nav-budget');
    const budgetBtn = document.getElementById('calculate-budget-btn');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('item-search');
    const themeBtn = document.getElementById('dark-mode-toggle');

    if (navCompare) navCompare.onclick = () => switchView('compare');
    if (navBudget) navBudget.onclick = () => switchView('budget');
    if (budgetBtn) budgetBtn.onclick = handleCalculateBudget;

    if (themeBtn) themeBtn.onclick = () => document.body.classList.toggle('dark-mode');

    if (searchBtn) {
        searchBtn.onclick = async () => {
            const data = await getSearchResults(searchInput.value);
            if (data) renderResults(data);
        };
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); searchBtn.click(); }
        });
    }
});
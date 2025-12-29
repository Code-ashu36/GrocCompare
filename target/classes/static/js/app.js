function quickSearch(itemQuery) {
    const input = document.getElementById('item-search');
    if (input) {
        input.value = itemQuery;
        document.getElementById('search-btn')?.click();
    }
}

function switchView(viewId) {
    const compareView = document.getElementById('comparison-view');
    const budgetAsst = document.getElementById('budget-assistant'); 
    const sidebar = document.getElementById('shortcuts-sidebar');
    
    if (viewId === 'budget') {
        compareView.style.display = 'none';
        budgetAsst.style.display = 'block';
        if (sidebar) sidebar.style.display = 'none';
    } else {
        compareView.style.display = 'block';
        budgetAsst.style.display = 'none';
        if (sidebar) sidebar.style.display = 'block';
    }

    document.querySelectorAll('.header nav a').forEach(link => {
        link.classList.toggle('active-link', link.id === `nav-${viewId}`);
    });
}

async function getSearchResults(query) {
    const loader = document.getElementById('loader');
    const location = document.getElementById('location-picker').value;
    document.getElementById('loader-text').textContent = `Fetching live prices for ${location}...`;
    loader?.classList.remove('hidden');

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
        const data = await response.json();
        loader?.classList.add('hidden');
        return data;
    } catch (error) {
        loader?.classList.add('hidden');
        return null;
    }
}

function renderResults(data) {
    const resultsContainer = document.getElementById('comparison-results');
    const summaryContainer = document.getElementById('results-summary');
    resultsContainer.innerHTML = ''; 

    if (!data?.comparisonResults?.length) {
        summaryContainer.style.display = 'block';
        summaryContainer.innerHTML = "No results found.";
        return;
    }

    summaryContainer.style.display = 'block';
    summaryContainer.innerHTML = `✅ Found ${data.comparisonResults.length} deals. Best: ${data.globalBestDeal.platformId} (₹${data.globalBestDeal.price.toFixed(2)})`;

    data.comparisonResults.forEach(product => {
        const unitPrice = product.normalizedPrice?.toFixed(2) || product.currentPrice.toFixed(2);
        const finalLink = product.productLink || "#";
        const isValid = finalLink !== "#";

        let badgeColor = "#FFC107"; let badgeText = "Fair Price";
        if (product.priceStatus === "Low") { badgeColor = "#4CAF50"; badgeText = "Great Deal"; }
        else if (product.priceStatus === "High") { badgeColor = "#F44336"; badgeText = "High Price"; }

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
                    <button class="buy-btn" ${!isValid ? 'disabled style="opacity:0.5;"' : ''}>
                        ${isValid ? 'Buy Now' : 'Link Unavailable'}
                    </button>
                </a>
            </div>`;
        resultsContainer.insertAdjacentHTML('beforeend', card);
    });
}

function handleCalculateBudget() {
    const budget = parseInt(document.getElementById('monthly-budget').value);
    const size = parseInt(document.getElementById('household-size').value);
    const perPerson = budget / size;
    const resultsBox = document.getElementById('budget-results');

    let strategy = perPerson < 3500 ? 
        `<li><strong>Buy Bulk:</strong> 5kg packs save ~15%.</li><li><strong>Store Brands:</strong> Switch to 'Fresho' for 20% off.</li>` : 
        `<li><strong>Value Packs:</strong> Buy boxes of 6+ to lower unit price.</li><li><strong>Weekly Sales:</strong> Check rates on Mondays.</li>`;

    resultsBox.style.backgroundColor = perPerson < 3500 ? "#F44336" : "#4CAF50";
    resultsBox.innerHTML = `<h3 style="color: white;">✅ AI Coach Strategy</h3><p style="color: white;">₹${Math.round(perPerson)} per person</p><ul style="text-align: left; margin-top: 15px; color: white;">${strategy}</ul>`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-compare').onclick = () => switchView('compare');
    document.getElementById('nav-budget').onclick = () => switchView('budget');
    document.getElementById('calculate-budget-btn').onclick = handleCalculateBudget;
    document.getElementById('dark-mode-toggle').onclick = () => document.body.classList.toggle('dark-mode');
    
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('item-search');
    
    searchBtn.onclick = async () => {
        const data = await getSearchResults(searchInput.value);
        if (data) renderResults(data);
    };
});
// GLOBAL STATE
let currentCategory = 'grocery';
let searchHistory = [];

// 1. CATEGORY SWITCHER
function switchCategory(category, element) {
    currentCategory = category;
    
    // Update UI Buttons
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    // Update Placeholder
    const input = document.getElementById('item-search');
    input.placeholder = `Search for ${category}...`;

    // Auto-search if text exists
    if(input.value) performSearch();
}

// 2. SEARCH LOGIC
async function performSearch() {
    const query = document.getElementById('item-search').value;
    const location = document.getElementById('location-picker').value;
    const loader = document.getElementById('loader');
    const grid = document.getElementById('comparison-results');

    if(!query) return;

    loader.classList.remove('hidden');
    grid.innerHTML = '';

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}&location=${location}&category=${currentCategory}`);
        const data = await response.json();
        
        renderCards(data.comparisonResults);
        addToHistory(query);
    } catch (e) {
        console.error("Search failed", e);
    } finally {
        loader.classList.add('hidden');
    }
}

// 3. RENDER UI
function renderCards(products) {
    const grid = document.getElementById('comparison-results');
    products.forEach(p => {
        const badgeColor = p.priceStatus === 'Low' ? '#22c55e' : (p.priceStatus === 'High' ? '#ef4444' : '#f59e0b');
        const card = `
            <div class="product-card">
                <div class="img-wrapper">
                    <img src="${p.imageUrl}" alt="product">
                </div>
                <div class="card-body">
                    <div class="card-meta">
                        <span class="badge" style="background:${badgeColor}">${p.priceStatus}</span>
                        <span class="source">${p.platformId}</span>
                    </div>
                    <h4>${p.productName}</h4>
                    <p class="price">₹${p.price.toFixed(2)}</p>
                    <a href="${p.productLink}" target="_blank" class="buy-btn">View Deal</a>
                </div>
            </div>`;
        grid.insertAdjacentHTML('beforeend', card);
    });
}

// 4. HISTORY SIDEBAR
function addToHistory(query) {
    if(!searchHistory.includes(query)) {
        searchHistory.unshift(query);
        if(searchHistory.length > 5) searchHistory.pop();
        updateHistoryUI();
    }
}

function updateHistoryUI() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = searchHistory.map(item => 
        `<button class="history-item" onclick="document.getElementById('item-search').value='${item}'; performSearch();">🕒 ${item}</button>`
    ).join('');
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-btn').onclick = performSearch;
    document.getElementById('item-search').onkeypress = (e) => { if(e.key === 'Enter') performSearch(); };
    document.getElementById('dark-mode-toggle').onclick = () => document.body.classList.toggle('dark-mode');
});
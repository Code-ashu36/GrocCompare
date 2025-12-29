/**
 * GrocCompare Pro - Main Application Logic
 * Modern Premium UI Implementation
 */

// Global State
let currentCategory = 'grocery'; // Default category for the switch bar
let searchHistory = [];

/**
 * 1. View Controller
 * Switches between the Comparison Search and the Budget Assistant
 */
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

    // Update Navigation UI
    const navLinks = document.querySelectorAll('.header nav a');
    navLinks.forEach(link => {
        link.classList.remove('active-link');
        if (link.id === `nav-${viewId}`) link.classList.add('active-link');
    });
}

/**
 * 2. Quick Search Handler
 * Triggered by the pill-shaped buttons in the Hero section
 */
function quickSearch(itemQuery) {
    const input = document.getElementById('item-search');
    if (input) {
        input.value = itemQuery;
        performSearch(); // Trigger the main search logic
    }
}

/**
 * 3. Main Search Execution
 * Fetches data from the Java Backend
 */
async function performSearch() {
    const input = document.getElementById('item-search');
    const query = input.value;
    const location = document.getElementById('location-picker').value;
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loader-text');

    if (!query) return;

    // Show Loader with Premium Feedback
    if (loaderText) loaderText.textContent = `Analyzing market prices in ${location}...`;
    if (loader) loader.classList.remove('hidden');

    try {
        // Updated Fetch to include category parameter for functional switching
        const response = await fetch(`/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&category=${currentCategory}`);
        const data = await response.json();
        
        renderResults(data);
    } catch (error) {
        console.error("Search failed:", error);
        const summaryContainer = document.getElementById('results-summary');
        if (summaryContainer) summaryContainer.innerHTML = "Unable to fetch live prices. Please try again.";
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

/**
 * 4. Results Rendering
 * Builds the Premium White Card Grid
 */
function renderResults(data) {
    const resultsContainer = document.getElementById('comparison-results');
    const summaryContainer = document.getElementById('results-summary');
    
    if (!resultsContainer) return;
    resultsContainer.innerHTML = ''; 

    // Handle Empty Results
    if (!data || !data.comparisonResults || data.comparisonResults.length === 0) {
        if (summaryContainer) {
            summaryContainer.innerHTML = "No products found matching your search.";
        }
        return;
    }

    // Update Summary with Best Deal Info
    if (summaryContainer) {
        summaryContainer.innerHTML = `Found <strong>${data.comparisonResults.length}</strong> results. Best deal at <strong>${data.globalBestDeal.platformId}</strong>.`;
    }

    // Create Cards
    data.comparisonResults.forEach(product => {
        const unitPrice = product.normalizedPrice ? product.normalizedPrice.toFixed(2) : product.currentPrice.toFixed(2);
        const finalLink = product.productLink || "#";
        const isValid = finalLink !== "#";

        // Logic for "Best Deal" vs "Standard" tag
        let tagClass = "deal-tag";
        let badgeText = "Fair Price";
        if (product.priceStatus === "Low") { 
            tagClass += " best-deal"; 
            badgeText = "Best Price"; 
        } else if (product.priceStatus === "High") {
            badgeText = "Premium Price";
        }

        const card = `
            <div class="product-card">
                <span class="${tagClass}">${badgeText} • ${product.platformId}</span>
                <h3>${product.productName}</h3>
                <p class="price">₹${product.currentPrice.toFixed(2)}</p>
                <p class="rate">Rate: ₹${unitPrice} per kg/L</p>
                <a href="${finalLink}" target="_blank" rel="noopener noreferrer" class="buy-btn">
                    ${isValid ? 'Compare Prices' : 'Check Store'}
                </a>
            </div>
        `;
        resultsContainer.insertAdjacentHTML('beforeend', card);
    });
}

/**
 * 5. Budget Assistant Logic
 * Provides the AI Coach strategy
 */
function handleCalculateBudget() {
    const budget = parseInt(document.getElementById('monthly-budget').value);
    const size = parseInt(document.getElementById('household-size').value);
    const resultsBox = document.getElementById('budget-results');
    
    if (!resultsBox) return;

    const perPerson = budget / size;
    let strategy = perPerson < 3500 ? 
        `<li><strong>Bulk Buying:</strong> Focus on 5kg+ packs for staples.</li>
         <li><strong>Local Brands:</strong> Switch to in-house labels for 20% savings.</li>` : 
        `<li><strong>Premium Selection:</strong> Compare high-end brands for seasonal offers.</li>
         <li><strong>Subscription Benefits:</strong> Use loyalty points for delivery fee waivers.</li>`;

    resultsBox.style.background = "#f9f9f9";
    resultsBox.style.color = "#333";
    resultsBox.style.border = "1px solid #eee";
    
    resultsBox.innerHTML = `
        <h3 style="margin-bottom:10px;">✅ AI Coach Strategy</h3>
        <p>Budget: ₹${budget} | ~₹${Math.round(perPerson)} per person</p>
        <ul style="text-align: left; margin-top: 15px; padding-left:20px;">${strategy}</ul>
    `;
}

/**
 * 6. Initialization
 * Sets up Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initial View
    switchView('compare'); 

    // Search Button Click
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.onclick = performSearch;
    }

    // Search on Enter Key
    const searchInput = document.getElementById('item-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }

    // Budget Assistant Button
    const budgetBtn = document.getElementById('calculate-budget-btn');
    if (budgetBtn) {
        budgetBtn.onclick = handleCalculateBudget;
    }

    // Theme Toggle (Kept for future dark mode functionality)
    const themeBtn = document.getElementById('dark-mode-toggle');
    if (themeBtn) {
        themeBtn.onclick = () => document.body.classList.toggle('dark-mode');
    }
});
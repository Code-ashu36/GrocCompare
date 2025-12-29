/**
 * GrocCompare Pro | Functionality & Transition Logic
 */

let allProducts = []; 

// 1. Splash Screen & Smooth Entry
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.classList.add('hidden'), 1000);
        }
    }, 2800); 
});

// 2. Smooth View Management (Choppiness Fixed)
function switchView(viewId) {
    const compareSection = document.getElementById('comparison-view');
    const budgetSection = document.getElementById('budget-assistant');
    const heroSection = document.querySelector('.premium-hero');

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Smooth Fade Out
    [compareSection, budgetSection].forEach(el => el.style.opacity = '0');

    setTimeout(() => {
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
        
        // Smooth Fade In
        setTimeout(() => {
            const activeEl = viewId === 'budget' ? budgetSection : compareSection;
            activeEl.style.opacity = '1';
        }, 50);
    }, 400);
}

// 3. Search & Real Filtering Logic
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
        
        allProducts = data.comparisonResults;
        
        // Dynamic Price Slider Range Setup
        const prices = allProducts.map(p => p.currentPrice);
        const slider = document.querySelector('.accent-range');
        if (slider && prices.length > 0) {
            slider.min = Math.floor(Math.min(...prices));
            slider.max = Math.ceil(Math.max(...prices));
            slider.value = slider.max;
        }

        renderResults(allProducts);
    } catch (error) {
        console.error("Search failed", error);
    } finally {
        loader.classList.add('hidden');
    }
}

// Real Filter Logic (No longer a gimmick)
function filterByPrice(maxPrice) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const price = parseFloat(card.dataset.price);
        card.style.display = (price <= maxPrice) ? 'flex' : 'none';
    });
}

// 4. Render Results (Image Fitting Fixed)
function renderResults(products) {
    const grid = document.getElementById('comparison-results');
    const accents = ['#dbe9ff', '#ebe5ff', '#e4fff3', '#fff4e6'];

    products.forEach((p, index) => {
        const accent = accents[index % accents.length];
        const card = `
            <div class="product-card" data-price="${p.currentPrice}">
                <div class="card-img-block" style="background-color: ${accent};">
                    <img src="${p.imageUrl}" alt="${p.productName}" 
                         style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;"
                         onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                </div>
                <div class="card-body">
                    <div class="best-deal-tag" style="background: ${p.priceStatus === 'Low' ? '#e4fff3' : '#eee'}">
                        ${p.platformId}
                    </div>
                    <h3>${p.productName}</h3>
                    <p class="price" style="color: var(--text-main); font-weight: 800; font-size: 1.6rem;">₹${p.currentPrice.toFixed(2)}</p>
                    <p class="rate" style="color: var(--text-muted); font-size: 0.8rem;">₹${p.normalizedPrice.toFixed(2)}/unit</p>
                    <a href="${p.productLink}" target="_blank" class="compare-outline-btn">Compare Price</a>
                </div>
            </div>`;
        grid.insertAdjacentHTML('beforeend', card);
    });
}

// 5. Initialization
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

    document.getElementById('dark-mode-toggle').onclick = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };

    const priceSlider = document.querySelector('.accent-range');
    if (priceSlider) {
        priceSlider.addEventListener('input', (e) => filterByPrice(e.target.value));
    }
});
/**
 * GrocCompare Pro | Premium Logic Engine
 * UPDATED: Multi-Engine Viewport & Discovery APIs
 */

let allProducts = []; 

window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    const appContent = document.getElementById('app-content');
    
    setTimeout(() => {
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.classList.add('hidden');
                if (!appContent) {
                    window.location.href = "/login";
                } else {
                    appContent.style.display = 'block';
                    appContent.classList.add('fade-in');
                }
            }, 1000);
        }
    }, 2500); 
});

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('dark-mode-toggle');
    if (themeBtn) {
        themeBtn.onclick = () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        };
    }
    
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.onclick = performSearch;

    const itemSearch = document.getElementById('item-search');
    if (itemSearch) {
        itemSearch.onkeypress = (e) => {
            if (e.key === 'Enter') performSearch();
        };
    }

    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }

    const priceSlider = document.querySelector('.accent-range');
    if (priceSlider) {
        priceSlider.addEventListener('input', (e) => filterByPrice(e.target.value));
    }
});

function switchView(viewId) {
    const compareView = document.getElementById('comparison-view');
    const budgetView = document.getElementById('budget-assistant');
    const cabsView = document.getElementById('cabs-view');
    const subsView = document.getElementById('subs-view');
    const hero = document.querySelector('.hero-sky');

    if (!compareView || !budgetView || !cabsView || !subsView) return; 

    [compareView, budgetView, cabsView, subsView].forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
    });

    setTimeout(() => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        [compareView, budgetView, cabsView, subsView].forEach(v => v.classList.add('hidden'));

        if (viewId === 'budget') {
            budgetView.classList.remove('hidden');
            if(hero) hero.classList.add('hidden');
            document.getElementById('nav-budget').classList.add('active');
            triggerFadeIn(budgetView);
        } 
        else if (viewId === 'cabs') {
            cabsView.classList.remove('hidden');
            if(hero) hero.classList.add('hidden');
            document.getElementById('nav-cabs').classList.add('active');
            triggerFadeIn(cabsView);
        }
        else if (viewId === 'subs') {
            subsView.classList.remove('hidden');
            if(hero) hero.classList.add('hidden');
            document.getElementById('nav-subs').classList.add('active');
            triggerFadeIn(subsView);
        }
        else {
            compareView.classList.remove('hidden');
            if(hero) hero.classList.remove('hidden');
            document.getElementById('nav-compare').classList.add('active');
            triggerFadeIn(compareView);
        }
    }, 300);
}

function triggerFadeIn(element) {
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 50);
}

/**
 * FIXED: Cab Search with Functional "Book Now" Buttons
 */
async function searchCabs() {
    const from = document.getElementById('cab-from')?.value;
    const to = document.getElementById('cab-to')?.value;
    const resultsGrid = document.getElementById('cab-results-grid');

    if (!from || !to || !resultsGrid) {
        console.error("Identification Error: Required HTML elements not found.");
        return;
    }

    resultsGrid.innerHTML = '<div class="spinner-modern"></div>';

    try {
        const response = await fetch(`/api/cabs/compare?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
        
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        resultsGrid.innerHTML = '';
        
        if (!data || data.length === 0) {
            resultsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 40px; background: var(--grey-100); border-radius: 20px;">
                    <h3>Identification: No Fares Found</h3>
                    <p>Gemini AI could not find specific pricing for this route. Try major landmarks.</p>
                </div>`;
            return;
        }

        data.forEach(cab => {
            // Generate Universal Deep Link for Booking
            const bookingUrl = `https://m.uber.com/looking?pickup=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;
            
            resultsGrid.insertAdjacentHTML('beforeend', `
                <div class="product-card" style="--card-accent: var(--accent-mint)">
                    <div class="card-body">
                        <div class="deal-badge" style="background: #f0fff6">${cab.platform || 'Cab'}</div>
                        <h3 style="margin: 10px 0;">${cab.type || 'Standard'}</h3>
                        <p class="price-large">₹${cab.price || '---'}</p>
                        <p class="rate-muted">ETA: ${cab.eta || 'Check App'}</p>
                        <a href="${bookingUrl}" target="_blank" class="compare-btn-minimal" style="text-decoration:none; display:block;">Book Now</a>
                    </div>
                </div>`);
        });
    } catch (err) { 
        console.error("Cab search identification failed", err);
        resultsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 20px; color: #dc3545;"><strong>Error:</strong> ${err.message}</div>`;
    }
}

/**
 * FIXED: Subscription Search with Functional "Get Deal" Buttons
 */
async function searchSubs() {
    const query = document.getElementById('sub-query')?.value;
    const resultsGrid = document.getElementById('subs-results-grid');

    if (!query || !resultsGrid) return;
    resultsGrid.innerHTML = '<div class="spinner-modern"></div>';

    try {
        const response = await fetch(`/api/subs/compare?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        resultsGrid.innerHTML = '';
        
        if (!data || data.length === 0) {
            resultsGrid.innerHTML = '<p class="summary-label" style="grid-column: 1/-1; text-align:center;">No subscription deals found.</p>';
            return;
        }

        // Mapping platform names to official deal pages
        const dealMap = {
            "JIO": "https://www.jio.com/selfcare/plans/mobility/ott-plans/",
            "AIRTEL": "https://www.airtel.in/xstream/plans",
            "NETFLIX": "https://www.netflix.com/signup",
            "PRIME": "https://www.amazon.in/amazonprime"
        };

        data.forEach(sub => {
            const platformKey = (sub.platform || "").toUpperCase();
            const dealUrl = dealMap[platformKey] || `https://www.google.com/search?q=${encodeURIComponent(sub.platform + " " + sub.planName)}`;

            resultsGrid.insertAdjacentHTML('beforeend', `
                <div class="product-card" style="--card-accent: var(--accent-purple)">
                    <div class="card-body">
                        <div class="deal-badge" style="background: rgba(0,0,0,0.05)">${sub.platform}</div>
                        <h3 style="margin: 10px 0;">${sub.planName}</h3>
                        <p class="price-large">${sub.price}</p>
                        <p class="rate-muted" style="color:#6a1b9a; font-weight:bold;">${sub.bestDeal}</p>
                        <a href="${dealUrl}" target="_blank" class="compare-btn-minimal" style="text-decoration:none; display:block;">Get Deal</a>
                    </div>
                </div>`);
        });
    } catch (err) { 
        console.error("Subscription search failed", err);
        resultsGrid.innerHTML = '<p class="summary-label">Discovery engine busy.</p>';
    }
}

async function performSearch() {
    const query = document.getElementById('item-search')?.value;
    const location = document.getElementById('location-picker')?.value;
    const loader = document.getElementById('loader');
    const grid = document.getElementById('comparison-results');
    if (!query || !loader || !grid) return;

    switchView('compare');
    loader.classList.remove('hidden');
    grid.innerHTML = '';

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
        const data = await response.json();
        allProducts = data.comparisonResults;

        if (allProducts.length > 0) {
            const prices = allProducts.map(p => p.currentPrice);
            const slider = document.querySelector('.accent-range');
            if (slider) {
                slider.min = Math.floor(Math.min(...prices));
                slider.max = Math.ceil(Math.max(...prices));
                slider.value = slider.max;
            }
        }
        renderResults(allProducts);
    } catch (error) { console.error("Search failed", error); } finally { loader.classList.add('hidden'); }
}

function filterByPrice(maxPrice) {
    document.querySelectorAll('.product-card').forEach(card => {
        const price = parseFloat(card.getAttribute('data-price'));
        card.style.display = (price <= maxPrice) ? 'flex' : 'none';
    });
}

function renderResults(dataList) {
    const grid = document.getElementById('comparison-results');
    const summary = document.getElementById('results-summary');
    const accents = ['#dbe9ff', '#ebe5ff', '#e4fff3', '#fff4e6'];
    if (!grid || !summary) return;

    if (dataList.length === 0) {
        summary.innerHTML = "No live deals found.";
        return;
    }
    summary.innerHTML = `Analyzing ${dataList.length} market sources. Best price: ₹${dataList[0].currentPrice}`;
    
    dataList.forEach((p, index) => {
        const accent = accents[index % accents.length];
        const card = `
            <div class="product-card" style="--card-accent: ${accent}" data-price="${p.currentPrice}">
                <div class="card-img-block">
                    <img src="${p.imageUrl}" alt="product" onerror="this.src='https://via.placeholder.com/150'">
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

function toggleChat() {
    const chat = document.getElementById('chat-box');
    if (chat) chat.classList.toggle('hidden');
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msgBox = document.getElementById('chat-messages');
    if (!input || !msgBox) return;

    const userMsg = input.value;
    if (!userMsg) return;

    msgBox.insertAdjacentHTML('beforeend', `<div style="text-align:right; margin-bottom:10px;"><span style="background:var(--grey-100); padding:8px 15px; border-radius:12px; display:inline-block; font-weight:500;">${userMsg}</span></div>`);
    input.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: userMsg })
        });
        const data = await response.json();
        msgBox.insertAdjacentHTML('beforeend', `<div class="pill-btn accent-purple" style="margin-bottom:10px; width:fit-content; border:none; color:#333; text-align:left;">${data.reply}</div>`);
        msgBox.scrollTop = msgBox.scrollHeight;
    } catch (err) { console.error(err); }
}

function handleCalculateBudget() {
    const budget = document.getElementById('monthly-budget')?.value;
    const size = document.getElementById('household-size')?.value;
    const resultBox = document.getElementById('budget-results');
    if (!budget || !size || !resultBox) return;
    const perPerson = Math.round(budget / size);

    resultBox.innerHTML = `
        <div class="budget-strategy-card" style="background: var(--grey-100); padding: 40px; border-radius: 24px; border: 1px solid var(--grey-200); margin-top: 30px;">
            <h3 style="font-size: 1.6rem; margin-bottom: 20px;">✅ AI Spending Strategy</h3>
            <p style="font-size: 1.2rem; margin-bottom: 15px;">Monthly Target: <strong>₹${perPerson}</strong> per person.</p>
            <ul style="text-align:left; padding-left:25px; font-size:1.1rem; line-height:1.8;">
                <li>Compare normalized rates to find hidden bulk savings.</li>
                <li>Track weekly Monday resets for the lowest market deals.</li>
            </ul>
        </div>`;
}

function handleHeaderSearch(e) { 
    if (e.key === 'Enter') { 
        const headerVal = document.getElementById('header-query')?.value;
        const mainInput = document.getElementById('item-search');
        if (mainInput && headerVal) {
            mainInput.value = headerVal; 
            performSearch(); 
        }
    } 
}

function quickSearch(item) { 
    const mainInput = document.getElementById('item-search');
    if (mainInput) {
        mainInput.value = item; 
        performSearch(); 
    }
}
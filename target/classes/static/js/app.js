/**
 * GrocCompare Pro | Premium Logic Engine
 * UPDATED: Smooth View Transitions & Chat Integration
 */

// 1. Splash Screen & Initialization
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.classList.add('hidden'), 1000);
        }
    }, 2500); 
});

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('dark-mode-toggle');
    themeBtn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    document.getElementById('search-btn').onclick = performSearch;
    document.getElementById('item-search').onkeypress = (e) => {
        if (e.key === 'Enter') performSearch();
    };

    // Chat Enter Listener
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    const priceSlider = document.querySelector('.accent-range');
    if (priceSlider) {
        priceSlider.addEventListener('input', (e) => {
            filterByPrice(e.target.value);
        });
    }
});

// 2. Smooth View Management
function switchView(viewId) {
    const compareView = document.getElementById('comparison-view');
    const budgetView = document.getElementById('budget-assistant');
    const hero = document.querySelector('.hero-sky');

    [compareView, budgetView].forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
    });

    setTimeout(() => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

        if (viewId === 'budget') {
            compareView.classList.add('hidden');
            budgetView.classList.remove('hidden');
            if(hero) hero.classList.add('hidden');
            document.getElementById('nav-budget').classList.add('active');
            setTimeout(() => {
                budgetView.style.opacity = '1';
                budgetView.style.transform = 'translateY(0)';
            }, 50);
        } else {
            compareView.classList.remove('hidden');
            budgetView.classList.add('hidden');
            if(hero) hero.classList.remove('hidden');
            document.getElementById('nav-compare').classList.add('active');
            setTimeout(() => {
                compareView.style.opacity = '1';
                compareView.style.transform = 'translateY(0)';
            }, 50);
        }
    }, 300);
}

// --- Chatbot Logic ---
function toggleChat() {
    const chat = document.getElementById('chat-box');
    chat.classList.toggle('hidden');
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msgBox = document.getElementById('chat-messages');
    const userMsg = input.value;
    if (!userMsg) return;

    // Show User Message
    msgBox.insertAdjacentHTML('beforeend', `<div style="text-align:right; margin-bottom:10px;"><span style="background:var(--grey-100); padding:8px 15px; border-radius:12px; display:inline-block;">${userMsg}</span></div>`);
    input.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: userMsg })
        });
        const data = await response.json();
        
        // Show AI Message using the premium pastel accent
        msgBox.insertAdjacentHTML('beforeend', `<div class="pill-btn accent-purple" style="margin-bottom:10px; width:fit-content; border:none; color:inherit;">${data.reply}</div>`);
        msgBox.scrollTop = msgBox.scrollHeight;
    } catch (err) {
        msgBox.insertAdjacentHTML('beforeend', `<div style="color:red; font-size:0.8rem; margin-bottom:10px;">Chat error. Please try again.</div>`);
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
        if (data.comparisonResults && data.comparisonResults.length > 0) {
            const prices = data.comparisonResults.map(p => p.currentPrice);
            const slider = document.querySelector('.accent-range');
            if (slider) {
                slider.min = Math.floor(Math.min(...prices));
                slider.max = Math.ceil(Math.max(...prices));
                slider.value = slider.max;
            }
        }
        renderResults(data);
    } catch (error) { console.error("Fetch failed", error); } finally { loader.classList.add('hidden'); }
}

function filterByPrice(maxPrice) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const price = parseFloat(card.getAttribute('data-price'));
        if (price <= maxPrice) card.style.display = 'flex';
        else card.style.display = 'none';
    });
}

function renderResults(data) {
    const grid = document.getElementById('comparison-results');
    const summary = document.getElementById('results-summary');
    const accents = ['#dbe9ff', '#ebe5ff', '#e4fff3', '#fff4e6'];
    if (!data.comparisonResults || data.comparisonResults.length === 0) {
        summary.innerHTML = "No live market data found.";
        return;
    }
    summary.innerHTML = `Analyzing ${data.comparisonResults.length} market sources. Best Price at ${data.globalBestDeal.platformId}.`;
    data.comparisonResults.forEach((p, index) => {
        const randomAccent = accents[index % accents.length];
        const card = `
            <div class="product-card" style="--card-accent: ${randomAccent}" data-price="${p.currentPrice}">
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

// 5. Budget Strategy
function handleCalculateBudget() {
    const budget = document.getElementById('monthly-budget').value;
    const size = document.getElementById('household-size').value;
    const resultBox = document.getElementById('budget-results');
    if (!budget || !size) return;
    const perPerson = Math.round(budget / size);

    resultBox.innerHTML = `
        <div class="budget-strategy-card" style="background: var(--grey-100); padding: 40px; border-radius: 24px; border: 1px solid var(--grey-200); margin-top: 30px;">
            <h3 style="font-size: 1.6rem; margin-bottom: 20px;">✅ AI Spending Strategy</h3>
            <p style="font-size: 1.2rem; margin-bottom: 15px;">Your Monthly Target: <strong>₹${perPerson}</strong> per person.</p>
            <ul style="text-align:left; padding-left:25px; font-size:1.1rem; line-height:1.8;">
                <li><strong>Dynamic Comparison:</strong> Use live search for staples to capture market variance.</li>
                <li><strong>Bulk Advantage:</strong> Buying 5kg+ packs reduces the normalized unit rate significantly.</li>
                <li><strong>Rate Tracking:</strong> Check your dashboard every Monday for new weekly deals.</li>
            </ul>
        </div>`;
}

function handleHeaderSearch(e) { if (e.key === 'Enter') { document.getElementById('item-search').value = document.getElementById('header-query').value; performSearch(); } }
function quickSearch(item) { document.getElementById('item-search').value = item; performSearch(); }
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) { splash.style.opacity = '0'; setTimeout(() => splash.classList.add('hidden'), 800); }
    }, 2000);
});

function switchView(viewId) {
    const comp = document.getElementById('comparison-view');
    const budg = document.getElementById('budget-assistant');
    const hero = document.querySelector('.premium-hero');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    comp.style.opacity = '0'; budg.style.opacity = '0';
    setTimeout(() => {
        if (viewId === 'budget') {
            comp.classList.add('hidden'); budg.classList.remove('hidden'); hero.classList.add('hidden');
            document.getElementById('nav-budget').classList.add('active');
        } else {
            comp.classList.remove('hidden'); budg.classList.add('hidden'); hero.classList.remove('hidden');
            document.getElementById('nav-compare').classList.add('active');
        }
        setTimeout(() => { (viewId === 'budget' ? budg : comp).style.opacity = '1'; }, 50);
    }, 400);
}

function filterByPrice(max) {
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = parseFloat(card.dataset.price) <= max ? 'flex' : 'none';
    });
}

async function performSearch() {
    const q = document.getElementById('item-search').value;
    const l = document.getElementById('location-picker').value;
    const loader = document.getElementById('loader');
    if (!q) return;
    switchView('compare');
    loader.classList.remove('hidden');
    document.getElementById('comparison-results').innerHTML = '';
    try {
        const res = await fetch(`/search?query=${encodeURIComponent(q)}&location=${encodeURIComponent(l)}`);
        const data = await res.json();
        const slider = document.querySelector('.accent-range');
        if (data.comparisonResults.length > 0) {
            const prices = data.comparisonResults.map(p => p.currentPrice);
            slider.min = Math.min(...prices); slider.max = Math.max(...prices); slider.value = slider.max;
        }
        renderResults(data.comparisonResults);
    } catch (e) { console.error(e); } finally { loader.classList.add('hidden'); }
}

function renderResults(prods) {
    const grid = document.getElementById('comparison-results');
    const colors = ['#dbe9ff', '#ebe5ff', '#e4fff3', '#fff4e6'];
    prods.forEach((p, i) => {
        grid.insertAdjacentHTML('beforeend', `
            <div class="product-card" data-price="${p.currentPrice}">
                <div class="card-img-block" style="background:${colors[i%4]}">
                    <img src="${p.imageUrl}" onerror="this.src='https://via.placeholder.com/150'">
                </div>
                <div class="card-body">
                    <div class="best-deal-tag" style="font-size:0.7rem; color:#999">${p.platformId}</div>
                    <h3>${p.productName}</h3>
                    <div class="price">₹${p.currentPrice.toFixed(2)}</div>
                    <a href="${p.productLink}" target="_blank" style="text-decoration:none; color:#333; font-weight:600; margin-top:10px; display:block">Compare Prices</a>
                </div>
            </div>`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    document.getElementById('dark-mode-toggle').onclick = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };
    document.getElementById('search-btn').onclick = performSearch;
    document.querySelector('.accent-range').oninput = (e) => filterByPrice(e.target.value);
});
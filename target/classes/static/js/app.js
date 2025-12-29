async function getSearchResults(query) {
    const loader = document.getElementById('loader');
    const location = document.getElementById('location-picker').value;
    loader.classList.remove('hidden');

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
        const data = await response.json();
        loader.classList.add('hidden');
        renderResults(data);
    } catch (error) {
        loader.classList.add('hidden');
        console.error("Search failed:", error);
    }
}

function renderResults(data) {
    const container = document.getElementById('comparison-results');
    container.innerHTML = '';

    data.comparisonResults.forEach(product => {
        const card = `
            <div class="product-card">
                <img src="${product.imageUrl}" class="product-img">
                <div style="padding: 15px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span class="badge" style="background:${product.priceStatus==='Low'?'#00b894':'#fdcb6e'}">${product.priceStatus}</span>
                        <small>${product.platformId}</small>
                    </div>
                    <h3 style="font-size:1rem; margin:10px 0;">${product.productName}</h3>
                    <p style="font-weight:bold; color:#764ba2;">₹${product.currentPrice}</p>
                    <a href="${product.productLink}" target="_blank" class="buy-link" 
                       style="display:block; background:#764ba2; color:white; text-align:center; padding:10px; border-radius:8px; text-decoration:none;">
                       Buy Now
                    </a>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', card);
    });
}

function switchCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    // For now, logic remains same, but this sets the stage for Phase 2 APIs
}

document.getElementById('search-btn').onclick = () => {
    const q = document.getElementById('item-search').value;
    if(q) getSearchResults(q);
};
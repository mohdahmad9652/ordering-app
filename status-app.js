// --------- status-app.js -----------
// REQUIRED: Set your deployed Apps Script URL here
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCI7NyB495spcXrcPGS63oaWNi_OpPYvtrEcqNBRCfYgnwpMZ-pVE37M0c1heJmQEj/exec';

// Utility: JSONP request for Apps Script
function makeJsonpRequest(url, params = {}, callbackName = 'callback') {
    return new Promise((resolve, reject) => {
        const cb = `cb${Math.floor(Math.random()*100000)}${Date.now()}`;
        params[callbackName] = cb;
        const queryParams = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
        const scriptUrl = url + (url.indexOf('?') > -1 ? '&' : '?') + queryParams;
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        window[cb] = function(response) {
            delete window[cb];
            document.body.removeChild(script);
            resolve(response);
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

function showLoading() {
    document.getElementById('statusResults').style.display = 'block';
    document.getElementById('noResults').style.display = 'none';
    document.getElementById('orderNumber').textContent = 'Loading...';
    document.getElementById('statusBadge').innerHTML = '<span class="status status--info">Loading...</span>';
}

function showNoResults() {
    document.getElementById('statusResults').style.display = 'none';
    document.getElementById('noResults').style.display = 'block';
}

function showOrder(order) {
    document.getElementById('statusResults').style.display = 'block';
    document.getElementById('noResults').style.display = 'none';
    document.getElementById('orderNumber').textContent = `Order #${order.orderNumber}`;
    document.getElementById('statusBadge').innerHTML = `<span class="status status--info">${order.orderStatus}</span>`;
    document.getElementById('partyName').textContent = order.partyName || '-';
    document.getElementById('orderDate').textContent = order.orderDate || '-';
    document.getElementById('expectedDelivery').textContent = order.expectedDelivery || '-';
    document.getElementById('contactInfo').textContent = order.contact || '-';
    document.getElementById('deliveryStatus').textContent = order.delivered || '-';
    updateTimeline(order.orderStatus);
}

function updateTimeline(curStatus) {
    const statusOrder = ['New','Cad Done','RPT DONE','Casting Procces','Ready For Delivery','Delivered'];
    const currentIdx = statusOrder.indexOf(curStatus);
    document.querySelectorAll('.timeline-step').forEach((step, idx) => {
        step.classList.remove('completed','current');
        if(idx < currentIdx) step.classList.add('completed');
        else if(idx === currentIdx) step.classList.add('current');
    });
}

function runStatusCheck() {
    const orderNumber = document.getElementById('orderStatusSearch').value.trim();
    if (!orderNumber) return;
    showLoading();
    makeJsonpRequest(APPS_SCRIPT_URL, { action: 'read' }).then(res => {
        const orders = res && res.data ? res.data : [];
        const order = orders.find(o => o.orderNumber.toLowerCase() === orderNumber.toLowerCase());
        if(order) showOrder(order);
        else showNoResults();
    }).catch(err => {
        showNoResults();
    });
}

document.getElementById('checkStatusBtn').addEventListener('click', runStatusCheck);
document.getElementById('orderStatusSearch').addEventListener('keypress', e => {
    if(e.key==='Enter') runStatusCheck();
});

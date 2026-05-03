// ==================== LocalStorage Helpers ====================
const STORAGE_KEYS = {
    materials: 'wamid_materials',
    products: 'wamid_products',
    quotes: 'wamid_quotes',
    company: 'wamid_company',
    view: 'materialsView'
};

function getData(key) {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS[key]) || '[]');
}

function setData(key, data) {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== Image Handling ====================
function previewImage(event, previewId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById(previewId);
            img.src = e.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// ==================== Company Info ====================
function loadCompanyInfo() {
    const company = JSON.parse(localStorage.getItem(STORAGE_KEYS.company) || '{}');
    const logos = document.querySelectorAll('#companyLogo');
    logos.forEach(logo => {
        if(company.name) logo.textContent = company.name;
    });
}

function saveCompany(e) {
    e.preventDefault();
    const company = {
        name: document.getElementById('compName').value,
        address: document.getElementById('compAddress').value,
        phones: document.getElementById('compPhones').value,
        logo: document.getElementById('compLogoPreview').src || ''
    };
    localStorage.setItem(STORAGE_KEYS.company, JSON.stringify(company));
    alert('✅ تم حفظ إعدادات الشركة بنجاح!');
    loadCompanyInfo();
}

// ==================== Materials ====================
function addMaterial(e) {
    e.preventDefault();
    const materials = getData('materials');

    const material = {
        id: generateId(),
        name: document.getElementById('matName').value,
        price: parseFloat(document.getElementById('matPrice').value),
        stock: parseFloat(document.getElementById('matStock').value) || 0,
        color: document.getElementById('matColor').value,
        image: document.getElementById('matPreview').src || ''
    };

    materials.push(material);
    setData('materials', materials);

    e.target.reset();
    document.getElementById('matPreview').style.display = 'none';
    renderMaterials();
    updateDashboard();
    alert('✅ تم إضافة المادة بنجاح!');
}

function renderMaterials() {
    const container = document.getElementById('materialsContainer');
    if (!container) return;

    const materials = getData('materials');
    const view = localStorage.getItem(STORAGE_KEYS.view) || 'card';

    container.className = view === 'card' ? 'cards-view' : 'list-view';
    container.innerHTML = '';

    materials.forEach(mat => {
        const el = view === 'card' ? createMaterialCard(mat) : createMaterialListItem(mat);
        container.appendChild(el);
    });
}

function createMaterialCard(mat) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
        <div style="background:${mat.color}; height:10px;"></div>
        ${mat.image ? `<img src="${mat.image}" class="card-image" alt="${mat.name}">` : '<div class="card-image" style="display:flex;align-items:center;justify-content:center;color:#999;">لا توجد صورة</div>'}
        <div class="card-body">
            <h3 class="card-title">${mat.name}</h3>
            <p class="card-price">${mat.price.toFixed(2)} ج.م</p>
            <p class="card-stock">📦 المخزون: ${mat.stock} وحدة</p>
            <div class="card-actions">
                <button class="btn btn-secondary" onclick="editMaterial('${mat.id}')">✏️ تعديل</button>
                <button class="btn btn-danger" onclick="deleteMaterial('${mat.id}')">🗑️ حذف</button>
            </div>
        </div>
    `;
    return div;
}

function createMaterialListItem(mat) {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
        ${mat.image ? `<img src="${mat.image}" alt="${mat.name}">` : '<div style="width:60px;height:60px;background:'+mat.color+';border-radius:6px;"></div>'}
        <div class="list-item-info">
            <h4>${mat.name}</h4>
            <p>${mat.price.toFixed(2)} ج.م | المخزون: ${mat.stock}</p>
        </div>
        <div class="list-item-actions">
            <button class="btn btn-secondary" onclick="editMaterial('${mat.id}')">✏️</button>
            <button class="btn btn-danger" onclick="deleteMaterial('${mat.id}')">🗑️</button>
        </div>
    `;
    return div;
}

function setView(view) {
    localStorage.setItem(STORAGE_KEYS.view, view);
    document.querySelectorAll('.view-toggle button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(view === 'card' ? 'بطاقات' : 'قائمة'));
    });
    renderMaterials();
}

function deleteMaterial(id) {
    if(!confirm('هل أنت متأكد من الحذف؟')) return;
    const materials = getData('materials').filter(m => m.id !== id);
    setData('materials', materials);
    renderMaterials();
    updateDashboard();
}

function editMaterial(id) {
    const mat = getData('materials').find(m => m.id === id);
    if(!mat) return;

    const newPrice = prompt('السعر الجديد:', mat.price);
    const newStock = prompt('الكمية الجديدة في المخزون:', mat.stock);

    if(newPrice !== null) {
        const materials = getData('materials');
        const index = materials.findIndex(m => m.id === id);
        materials[index].price = parseFloat(newPrice) || mat.price;
        materials[index].stock = parseFloat(newStock) !== null ? parseFloat(newStock) : mat.stock;
        setData('materials', materials);
        renderMaterials();
    }
}

// ==================== Products & BOM ====================
function addBomRow() {
    const container = document.getElementById('bomItems');
    const materials = getData('materials');

    const row = document.createElement('div');
    row.className = 'bom-row';
    row.innerHTML = `
        <div class="form-group">
            <label>المادة الخام</label>
            <select class="bom-material" onchange="calculateBOM()">
                <option value="">اختر مادة</option>
                ${materials.map(m => `<option value="${m.id}" data-price="${m.price}">${m.name} (${m.price} ج.م)</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>الكمية المطلوبة</label>
            <input type="number" class="bom-qty" min="0" step="0.01" value="1" oninput="calculateBOM()">
        </div>
        <div class="form-group">
            <label>التكلفة</label>
            <input type="text" class="bom-cost" readonly value="0">
        </div>
        <div class="form-group">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.parentElement.remove(); calculateBOM();">❌</button>
        </div>
    `;
    container.appendChild(row);
}

function calculateBOM() {
    let totalCost = parseFloat(document.getElementById('prodBasePrice').value) || 0;

    document.querySelectorAll('.bom-row').forEach(row => {
        const select = row.querySelector('.bom-material');
        const qty = parseFloat(row.querySelector('.bom-qty').value) || 0;
        const option = select.options[select.selectedIndex];

        if(option && option.value) {
            const price = parseFloat(option.dataset.price) || 0;
            const cost = price * qty;
            row.querySelector('.bom-cost').value = cost.toFixed(2);
            totalCost += cost;
        }
    });

    window.currentBOMCost = totalCost;
    calculatePreview();
    return totalCost;
}

function updateMarginLabel() {
    const type = document.getElementById('marginType').value;
    document.getElementById('marginLabel').textContent = type === 'percent' ? 'النسبة (%)' : 'القيمة (جنيه)';
    calculatePreview();
}

function calculatePreview() {
    const cost = window.currentBOMCost || parseFloat(document.getElementById('prodBasePrice').value) || 0;
    const marginType = document.getElementById('marginType').value;
    const marginValue = parseFloat(document.getElementById('marginValue').value) || 0;

    let finalPrice = cost;
    if(marginType === 'percent') {
        finalPrice = cost + (cost * marginValue / 100);
    } else {
        finalPrice = cost + marginValue;
    }

    document.getElementById('previewCost').textContent = cost.toFixed(2);
    document.getElementById('previewPrice').textContent = finalPrice.toFixed(2);
    document.getElementById('previewProfit').textContent = (finalPrice - cost).toFixed(2);
}

function addProduct(e) {
    e.preventDefault();
    const products = getData('products');

    const bom = [];
    document.querySelectorAll('.bom-row').forEach(row => {
        const select = row.querySelector('.bom-material');
        const qty = parseFloat(row.querySelector('.bom-qty').value) || 0;
        if(select.value && qty > 0) {
            const mat = getData('materials').find(m => m.id === select.value);
            bom.push({
                materialId: select.value,
                materialName: mat ? mat.name : '',
                quantity: qty,
                unitCost: mat ? mat.price : 0
            });
        }
    });

    const cost = calculateBOM();
    const marginType = document.getElementById('marginType').value;
    const marginValue = parseFloat(document.getElementById('marginValue').value) || 0;

    let finalPrice = cost;
    if(marginType === 'percent') {
        finalPrice = cost + (cost * marginValue / 100);
    } else {
        finalPrice = cost + marginValue;
    }

    const product = {
        id: generateId(),
        name: document.getElementById('prodName').value,
        basePrice: parseFloat(document.getElementById('prodBasePrice').value) || 0,
        color: document.getElementById('prodColor').value,
        image: document.getElementById('prodPreview').src || '',
        bom: bom,
        cost: cost,
        marginType: marginType,
        marginValue: marginValue,
        finalPrice: finalPrice
    };

    products.push(product);
    setData('products', products);

    e.target.reset();
    document.getElementById('prodPreview').style.display = 'none';
    document.getElementById('bomItems').innerHTML = '';
    addBomRow();
    window.currentBOMCost = 0;
    calculatePreview();
    renderProducts();
    updateDashboard();
    alert('✅ تم إضافة المنتج بنجاح!');
}

function renderProducts() {
    const container = document.getElementById('productsContainer');
    if(!container) return;

    const products = getData('products');
    container.className = 'cards-view';
    container.innerHTML = '';

    products.forEach(prod => {
        const div = document.createElement('div');
        div.className = 'card';

        let bomHtml = prod.bom.map(b => `<li>${b.materialName} × ${b.quantity} = ${(b.quantity * b.unitCost).toFixed(2)} ج.م</li>`).join('');

        div.innerHTML = `
            <div style="background:${prod.color}; height:10px;"></div>
            ${prod.image ? `<img src="${prod.image}" class="card-image" alt="${prod.name}">` : '<div class="card-image" style="display:flex;align-items:center;justify-content:center;color:#999;">لا توجد صورة</div>'}
            <div class="card-body">
                <h3 class="card-title">${prod.name}</h3>
                <p>💰 التكلفة: ${prod.cost.toFixed(2)} ج.م</p>
                <p>🏷️ السعر النهائي: ${prod.finalPrice.toFixed(2)} ج.م</p>
                <p>📈 الربح: ${(prod.finalPrice - prod.cost).toFixed(2)} ج.م</p>
                <details>
                    <summary>مكونات المنتج (${prod.bom.length})</summary>
                    <ul style="margin-top:0.5rem; padding-right:1.2rem;">${bomHtml}</ul>
                </details>
                <div class="card-actions">
                    <button class="btn btn-danger" onclick="deleteProduct('${prod.id}')">🗑️ حذف</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteProduct(id) {
    if(!confirm('هل أنت متأكد من الحذف؟')) return;
    const products = getData('products').filter(p => p.id !== id);
    setData('products', products);
    renderProducts();
    updateDashboard();
}

// ==================== Quotes ====================
function addQuoteItem() {
    const container = document.getElementById('quoteItems');
    const products = getData('products');

    const row = document.createElement('div');
    row.className = 'form-row';
    row.innerHTML = `
        <div class="form-group">
            <label>المنتج</label>
            <select class="quote-product" onchange="calculateQuote()">
                <option value="">اختر منتج</option>
                ${products.map(p => `<option value="${p.id}" data-price="${p.finalPrice}">${p.name} (${p.finalPrice.toFixed(2)} ج.م)</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>الكمية</label>
            <input type="number" class="quote-qty" min="1" value="1" oninput="calculateQuote()">
        </div>
        <div class="form-group">
            <label>الإجمالي</label>
            <input type="text" class="quote-total" readonly value="0">
        </div>
        <div class="form-group">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.parentElement.remove(); calculateQuote();">❌</button>
        </div>
    `;
    container.appendChild(row);
}

function calculateQuote() {
    let grandTotal = 0;
    let materialsNeeded = {};

    document.querySelectorAll('#quoteItems .form-row').forEach(row => {
        const select = row.querySelector('.quote-product');
        const qty = parseFloat(row.querySelector('.quote-qty').value) || 0;
        const option = select.options[select.selectedIndex];

        if(option && option.value) {
            const price = parseFloat(option.dataset.price) || 0;
            const total = price * qty;
            row.querySelector('.quote-total').value = total.toFixed(2);
            grandTotal += total;

            const product = getData('products').find(p => p.id === select.value);
            if(product) {
                product.bom.forEach(b => {
                    const needed = b.quantity * qty;
                    materialsNeeded[b.materialId] = (materialsNeeded[b.materialId] || 0) + needed;
                });
            }
        }
    });

    document.getElementById('quoteTotal').textContent = grandTotal.toFixed(2);
    window.currentMaterialsNeeded = materialsNeeded;
    return { total: grandTotal, materials: materialsNeeded };
}

function createQuote(e) {
    e.preventDefault();
    const calc = calculateQuote();

    const materials = getData('materials');
    const insufficient = [];

    for(let [matId, needed] of Object.entries(calc.materials)) {
        const mat = materials.find(m => m.id === matId);
        if(mat && mat.stock < needed) {
            insufficient.push(`${mat.name} (متوفر: ${mat.stock}, مطلوب: ${needed})`);
        }
    }

    if(insufficient.length > 0) {
        alert('⚠️ الكميات غير كافية في المخزون:\n' + insufficient.join('\n'));
        return;
    }

    const quotes = getData('quotes');
    const quote = {
        id: generateId(),
        client: document.getElementById('quoteClient').value,
        date: document.getElementById('quoteDate').value,
        items: [],
        total: calc.total,
        materialsUsed: calc.materials
    };

    document.querySelectorAll('#quoteItems .form-row').forEach(row => {
        const select = row.querySelector('.quote-product');
        const qty = parseFloat(row.querySelector('.quote-qty').value) || 0;
        if(select.value && qty > 0) {
            const product = getData('products').find(p => p.id === select.value);
            quote.items.push({
                productId: select.value,
                productName: product ? product.name : '',
                quantity: qty,
                unitPrice: product ? product.finalPrice : 0,
                total: qty * (product ? product.finalPrice : 0)
            });
        }
    });

    quotes.push(quote);
    setData('quotes', quotes);

    for(let [matId, needed] of Object.entries(calc.materials)) {
        const matIndex = materials.findIndex(m => m.id === matId);
        if(matIndex !== -1) {
            materials[matIndex].stock -= needed;
        }
    }
    setData('materials', materials);

    e.target.reset();
    document.getElementById('quoteItems').innerHTML = '';
    addQuoteItem();
    renderQuotes();
    renderMaterials();
    updateDashboard();
    alert('✅ تم إنشاء الطلب وخصم الكميات من المخزون!');
}

function renderQuotes() {
    const container = document.getElementById('quotesList');
    if(!container) return;

    const quotes = getData('quotes');
    container.innerHTML = '<h2>الطلبات السابقة</h2>';

    quotes.slice().reverse().forEach(q => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.style.marginBottom = '1rem';

        const itemsList = q.items.map(i => `${i.productName} × ${i.quantity}`).join(', ');

        div.innerHTML = `
            <div class="list-item-info">
                <h4>عرض سعر #${q.id.substr(-4)} - ${q.client}</h4>
                <p>التاريخ: ${q.date} | المنتجات: ${itemsList}</p>
                <p>الإجمالي: ${q.total.toFixed(2)} ج.م</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-secondary" onclick="viewQuote('${q.id}')">👁️ عرض</button>
                <button class="btn btn-danger" onclick="deleteQuote('${q.id}')">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function viewQuote(id) {
    const quote = getData('quotes').find(q => q.id === id);
    if(!quote) return;

    alert(`عرض سعر #${quote.id.substr(-4)}
العميل: ${quote.client}
التاريخ: ${quote.date}
المنتجات:
${quote.items.map(i => `- ${i.productName}: ${i.quantity} × ${i.unitPrice.toFixed(2)} = ${i.total.toFixed(2)} ج.م`).join('\n')}
الإجمالي: ${quote.total.toFixed(2)} ج.م`);
}

function deleteQuote(id) {
    if(!confirm('هل أنت متأكد من الحذف؟')) return;
    const quotes = getData('quotes').filter(q => q.id !== id);
    setData('quotes', quotes);
    renderQuotes();
    updateDashboard();
}

function printQuote() {
    const calc = calculateQuote();
    const company = JSON.parse(localStorage.getItem(STORAGE_KEYS.company) || '{}');
    const date = document.getElementById('quoteDate').value;
    const client = document.getElementById('quoteClient').value;

    document.getElementById('printCompanyName').textContent = company.name || 'وميض';
    document.getElementById('printCompanyAddress').textContent = company.address || '';
    document.getElementById('printCompanyPhones').textContent = company.phones || '';
    if(company.logo) document.getElementById('printLogo').src = company.logo;

    document.getElementById('printQuoteNo').textContent = 'QT-' + Date.now().toString().substr(-6);
    document.getElementById('printQuoteDate').textContent = date;
    document.getElementById('printClient').textContent = client;
    document.getElementById('printTotal').textContent = calc.total.toFixed(2);

    const tbody = document.getElementById('printItems');
    tbody.innerHTML = '';

    document.querySelectorAll('#quoteItems .form-row').forEach((row, index) => {
        const select = row.querySelector('.quote-product');
        const qty = row.querySelector('.quote-qty').value;
        const total = row.querySelector('.quote-total').value;
        const option = select.options[select.selectedIndex];

        if(option && option.value) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${option.text.split('(')[0]}</td>
                <td>${qty}</td>
                <td>${(parseFloat(total)/parseFloat(qty)).toFixed(2)}</td>
                <td>${total}</td>
            `;
            tbody.appendChild(tr);
        }
    });

    window.print();
}

// ==================== Dashboard ====================
function updateDashboard() {
    const mats = getData('materials');
    const prods = getData('products');
    const quotes = getData('quotes');

    const matCount = document.getElementById('materialsCount');
    const prodCount = document.getElementById('productsCount');
    const quoteCount = document.getElementById('quotesCount');

    if(matCount) matCount.textContent = mats.length;
    if(prodCount) prodCount.textContent = prods.length;
    if(quoteCount) quoteCount.textContent = quotes.length;
}

// ==================== Data Management ====================
function exportData() {
    const data = {
        materials: getData('materials'),
        products: getData('products'),
        quotes: getData('quotes'),
        company: JSON.parse(localStorage.getItem(STORAGE_KEYS.company) || '{}'),
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wamid-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(data.materials) setData('materials', data.materials);
            if(data.products) setData('products', data.products);
            if(data.quotes) setData('quotes', data.quotes);
            if(data.company) localStorage.setItem(STORAGE_KEYS.company, JSON.stringify(data.company));

            alert('✅ تم استيراد البيانات بنجاح! سيتم تحديث الصفحة.');
            location.reload();
        } catch(err) {
            alert('❌ خطأ في قراءة الملف!');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if(!confirm('⚠️ هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع!')) return;
    if(!confirm('تأكيد نهائي: سيتم مسح كل المواد والمنتجات والطلبات!')) return;

    localStorage.removeItem(STORAGE_KEYS.materials);
    localStorage.removeItem(STORAGE_KEYS.products);
    localStorage.removeItem(STORAGE_KEYS.quotes);
    localStorage.removeItem(STORAGE_KEYS.company);

    alert('🗑️ تم مسح جميع البيانات');
    location.reload();
}

// ==================== LocalStorage Helpers ====================
const STORAGE_KEYS = {
    materials: 'wamid_materials',
    products: 'wamid_products',
    quotes: 'wamid_quotes',
    company: 'wamid_company',
    expenses: 'wamid_expenses',
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

// ==================== Toast Notifications ====================
function toast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️' };
    t.innerHTML = `<span>${icons[type] || '✅'}</span> ${msg}`;
    container.appendChild(t);
    setTimeout(() => {
        t.style.animation = 'toastIn 0.3s ease reverse forwards';
        setTimeout(() => t.remove(), 300);
    }, 3000);
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
        if (company.name) logo.textContent = company.name;
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
    toast('تم حفظ إعدادات الشركة بنجاح!');
    loadCompanyInfo();
}

// ==================== Materials ====================
function updateUnitLabels() {
    const unit = document.getElementById('matUnit').value;
    const label = document.getElementById('pricePerUnitLabel');
    if (label) label.textContent = unit;
    const hint = document.getElementById('unitsPerPkgHint');
    if (hint) hint.textContent = `كم ${unit} في الباكيدج الواحد؟`;
    calcPackagePreview();
}

function togglePackage() {
    const isPackage = document.getElementById('isPackage').checked;
    document.getElementById('packageFields').classList.toggle('visible', isPackage);
    document.getElementById('simpleFields').style.display = isPackage ? 'none' : 'block';
}

function toggleEditPackage() {
    const isPackage = document.getElementById('editIsPackage').checked;
    document.getElementById('editPackageFields').classList.toggle('visible', isPackage);
    document.getElementById('editSimpleFields').style.display = isPackage ? 'none' : 'block';
    calcEditPackagePreview();
}

function calcPackagePreview() {
    const unit = document.getElementById('matUnit') ? document.getElementById('matUnit').value : 'وحدة';
    const unitsPerPkg = parseFloat(document.getElementById('unitsPerPackage') ? document.getElementById('unitsPerPackage').value : 0) || 0;
    const pkgPrice = parseFloat(document.getElementById('packagePrice') ? document.getElementById('packagePrice').value : 0) || 0;
    const pkgStock = parseFloat(document.getElementById('packageStock') ? document.getElementById('packageStock').value : 0) || 0;
    const preview = document.getElementById('packageCalcPreview');
    if (!preview) return;
    if (unitsPerPkg > 0 && pkgPrice > 0) {
        const pricePerUnit = pkgPrice / unitsPerPkg;
        const totalStock = unitsPerPkg * pkgStock;
        preview.innerHTML = `💡 سعر الـ${unit} الواحد: <strong>${pricePerUnit.toFixed(4)} ج.م</strong> | إجمالي المخزون: <strong>${totalStock.toFixed(2)} ${unit}</strong>`;
    } else {
        preview.innerHTML = 'أدخل سعر الباكيدج وعدد الوحدات في الباكيدج';
    }
}

function calcEditPackagePreview() {
    const unit = document.getElementById('editMatUnit') ? document.getElementById('editMatUnit').value : 'وحدة';
    const unitsPerPkg = parseFloat(document.getElementById('editUnitsPerPackage') ? document.getElementById('editUnitsPerPackage').value : 0) || 0;
    const pkgPrice = parseFloat(document.getElementById('editPackagePrice') ? document.getElementById('editPackagePrice').value : 0) || 0;
    const pkgStock = parseFloat(document.getElementById('editPackageStock') ? document.getElementById('editPackageStock').value : 0) || 0;
    const preview = document.getElementById('editPackageCalcPreview');
    if (!preview) return;
    if (unitsPerPkg > 0 && pkgPrice > 0) {
        const pricePerUnit = pkgPrice / unitsPerPkg;
        const totalStock = unitsPerPkg * pkgStock;
        preview.innerHTML = `💡 سعر الـ${unit} الواحد: <strong>${pricePerUnit.toFixed(4)} ج.м</strong> | إجمالي المخزون: <strong>${totalStock.toFixed(2)} ${unit}</strong>`;
    } else {
        preview.innerHTML = 'أدخل سعر الباكيدج وعدد الوحدات في الباكيدج';
    }
}

function addMaterial(e) {
    e.preventDefault();
    const materials = getData('materials');
    const isPackage = document.getElementById('isPackage').checked;
    const unit = document.getElementById('matUnit').value;

    let material;
    if (isPackage) {
        const unitsPerPackage = parseFloat(document.getElementById('unitsPerPackage').value) || 0;
        const packagePrice = parseFloat(document.getElementById('packagePrice').value) || 0;
        const packageStock = parseFloat(document.getElementById('packageStock').value) || 0;
        if (!unitsPerPackage || !packagePrice) {
            toast('يرجى إدخال سعر الباكيدج وعدد الوحدات', 'error');
            return;
        }
        material = {
            id: generateId(),
            name: document.getElementById('matName').value,
            unit: unit,
            isPackage: true,
            packageName: document.getElementById('packageName').value,
            unitsPerPackage: unitsPerPackage,
            packagePrice: packagePrice,
            packageStock: packageStock,
            price: packagePrice / unitsPerPackage, // price per consumption unit
            stock: unitsPerPackage * packageStock,  // total stock in consumption units
            color: document.getElementById('matColor').value,
            image: document.getElementById('matPreview').src || ''
        };
    } else {
        material = {
            id: generateId(),
            name: document.getElementById('matName').value,
            unit: unit,
            isPackage: false,
            price: parseFloat(document.getElementById('matPrice').value) || 0,
            stock: parseFloat(document.getElementById('matStock').value) || 0,
            color: document.getElementById('matColor').value,
            image: document.getElementById('matPreview').src || ''
        };
    }

    materials.push(material);
    setData('materials', materials);
    e.target.reset();
    document.getElementById('matPreview').style.display = 'none';
    document.getElementById('packageFields').classList.remove('visible');
    document.getElementById('simpleFields').style.display = 'block';
    document.getElementById('isPackage').checked = false;
    if (document.getElementById('packageCalcPreview')) document.getElementById('packageCalcPreview').innerHTML = '';
    renderMaterials();
    updateDashboard();
    toast('تم إضافة المادة الخام بنجاح!');
}

function renderMaterials() {
    const container = document.getElementById('materialsContainer');
    if (!container) return;
    const materials = getData('materials');
    const view = localStorage.getItem(STORAGE_KEYS.view) || 'card';
    container.className = view === 'card' ? 'cards-view' : 'list-view';
    container.innerHTML = '';
    if (materials.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><h3>لا توجد مواد خام بعد</h3><p>أضف مادتك الأولى باستخدام النموذج أعلاه</p></div>`;
        return;
    }
    materials.forEach(mat => {
        const el = view === 'card' ? createMaterialCard(mat) : createMaterialListItem(mat);
        container.appendChild(el);
    });
}

function createMaterialCard(mat) {
    const div = document.createElement('div');
    div.className = 'card';
    const stockWarning = mat.stock <= 5;
    const unitLabel = mat.unit || 'وحدة';
    div.innerHTML = `
        <div class="card-accent-bar" style="background:${mat.color};"></div>
        ${mat.image && mat.image !== 'data:' ? `<img src="${mat.image}" class="card-image" alt="${mat.name}">` : `<div class="card-image" style="background:${mat.color}22; font-size:3rem; color:${mat.color};">📦</div>`}
        <div class="card-body">
            <h3 class="card-title">${mat.name}</h3>
            <div class="card-tags">
                <span class="tag">${unitLabel}</span>
                ${mat.isPackage ? `<span class="tag orange">📦 ${mat.packageName || 'باكيدج'}</span>` : ''}
                ${stockWarning ? '<span class="tag" style="background:rgba(214,48,49,0.1);color:var(--danger);">⚠️ مخزون منخفض</span>' : ''}
            </div>
            <div class="card-meta">
                <p class="card-price">💰 ${mat.price.toFixed(4)} ج.م / ${unitLabel}</p>
                <p class="${stockWarning ? 'card-stock' : 'card-profit'}">📦 المخزون: ${mat.stock.toFixed(2)} ${unitLabel}</p>
                ${mat.isPackage ? `<p style="font-size:0.8rem;color:var(--gray);">🏷️ ${mat.packagePrice} ج.م / ${mat.packageName} (${mat.unitsPerPackage} ${unitLabel})</p>` : ''}
            </div>
            <div class="card-actions">
                <button class="btn btn-secondary btn-sm" onclick="openEditMaterial('${mat.id}')">✏️ تعديل</button>
                <button class="btn btn-danger btn-sm" onclick="deleteMaterial('${mat.id}')">🗑️ حذف</button>
            </div>
        </div>
    `;
    return div;
}

function createMaterialListItem(mat) {
    const div = document.createElement('div');
    div.className = 'list-item';
    const unitLabel = mat.unit || 'وحدة';
    div.innerHTML = `
        ${mat.image && mat.image !== 'data:' ? `<img src="${mat.image}" alt="${mat.name}">` : `<div class="list-item-color" style="background:${mat.color};"></div>`}
        <div class="list-item-info">
            <h4>${mat.name} ${mat.isPackage ? `<span class="tag orange" style="font-size:0.75rem;">📦 ${mat.packageName}</span>` : ''}</h4>
            <p>${mat.price.toFixed(4)} ج.م / ${unitLabel} | المخزون: ${mat.stock.toFixed(2)} ${unitLabel}</p>
        </div>
        <div class="list-item-actions">
            <button class="btn btn-secondary btn-sm" onclick="openEditMaterial('${mat.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteMaterial('${mat.id}')">🗑️</button>
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
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟')) return;
    const materials = getData('materials').filter(m => m.id !== id);
    setData('materials', materials);
    renderMaterials();
    updateDashboard();
    toast('تم حذف المادة', 'warning');
}

// ---- Edit Material ----
function openEditMaterial(id) {
    const mat = getData('materials').find(m => m.id === id);
    if (!mat) return;
    document.getElementById('editMatId').value = mat.id;
    document.getElementById('editMatName').value = mat.name;
    document.getElementById('editMatUnit').value = mat.unit || 'وحدة';
    document.getElementById('editIsPackage').checked = mat.isPackage || false;

    if (mat.isPackage) {
        document.getElementById('editPackageFields').classList.add('visible');
        document.getElementById('editSimpleFields').style.display = 'none';
        document.getElementById('editPackageName').value = mat.packageName || '';
        document.getElementById('editUnitsPerPackage').value = mat.unitsPerPackage || '';
        document.getElementById('editPackagePrice').value = mat.packagePrice || '';
        document.getElementById('editPackageStock').value = mat.packageStock || 0;
    } else {
        document.getElementById('editPackageFields').classList.remove('visible');
        document.getElementById('editSimpleFields').style.display = 'block';
        document.getElementById('editMatPrice').value = mat.price || '';
        document.getElementById('editMatStock').value = mat.stock || 0;
    }

    document.getElementById('editModal').classList.add('open');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('open');
}

function saveEditMaterial() {
    const id = document.getElementById('editMatId').value;
    const materials = getData('materials');
    const index = materials.findIndex(m => m.id === id);
    if (index === -1) return;

    const isPackage = document.getElementById('editIsPackage').checked;
    const unit = document.getElementById('editMatUnit').value;
    const mat = materials[index];

    mat.name = document.getElementById('editMatName').value;
    mat.unit = unit;
    mat.isPackage = isPackage;

    if (isPackage) {
        const unitsPerPackage = parseFloat(document.getElementById('editUnitsPerPackage').value) || 0;
        const packagePrice = parseFloat(document.getElementById('editPackagePrice').value) || 0;
        const packageStock = parseFloat(document.getElementById('editPackageStock').value) || 0;
        mat.packageName = document.getElementById('editPackageName').value;
        mat.unitsPerPackage = unitsPerPackage;
        mat.packagePrice = packagePrice;
        mat.packageStock = packageStock;
        mat.price = unitsPerPackage > 0 ? packagePrice / unitsPerPackage : mat.price;
        mat.stock = unitsPerPackage * packageStock;
    } else {
        mat.price = parseFloat(document.getElementById('editMatPrice').value) || mat.price;
        mat.stock = parseFloat(document.getElementById('editMatStock').value) || 0;
    }

    materials[index] = mat;
    setData('materials', materials);
    closeEditModal();
    renderMaterials();
    updateDashboard();
    toast('تم تحديث المادة بنجاح!');
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
            <select class="bom-material" onchange="onBomMaterialChange(this); calculateBOM();">
                <option value="">اختر مادة...</option>
                ${materials.map(m => {
                    const unitLabel = m.unit || 'وحدة';
                    return `<option value="${m.id}" data-price="${m.price}" data-unit="${unitLabel}" data-stock="${m.stock}">${m.name} (${m.price.toFixed(4)} ج.م/${unitLabel})</option>`;
                }).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>الكمية المستهلكة <span class="bom-unit-badge">(وحدة)</span></label>
            <input type="number" class="bom-qty" min="0.001" step="0.001" value="1" oninput="calculateBOM()">
        </div>
        <div class="form-group">
            <label>الكمية المتاحة</label>
            <input type="text" class="bom-available" readonly value="-" style="background:var(--light);color:var(--gray);">
        </div>
        <div class="form-group">
            <label>التكلفة</label>
            <input type="text" class="bom-cost bom-cost-val" readonly value="0.00">
        </div>
        <div class="form-group" style="align-self:flex-end;">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.bom-row').remove(); calculateBOM();">❌</button>
        </div>
    `;
    container.appendChild(row);
}

function onBomMaterialChange(select) {
    const row = select.closest('.bom-row');
    const option = select.options[select.selectedIndex];
    const unitBadge = row.querySelector('.bom-unit-badge');
    const available = row.querySelector('.bom-available');
    if (option && option.value) {
        const unit = option.dataset.unit || 'وحدة';
        const stock = parseFloat(option.dataset.stock) || 0;
        if (unitBadge) unitBadge.textContent = `(${unit})`;
        if (available) available.value = `${stock.toFixed(2)} ${unit}`;
    } else {
        if (unitBadge) unitBadge.textContent = '(وحدة)';
        if (available) available.value = '-';
    }
}

function calculateBOM() {
    let totalCost = 0;
    document.querySelectorAll('.bom-row').forEach(row => {
        const select = row.querySelector('.bom-material');
        const qty = parseFloat(row.querySelector('.bom-qty').value) || 0;
        const option = select.options[select.selectedIndex];
        if (option && option.value) {
            const price = parseFloat(option.dataset.price) || 0;
            const cost = price * qty;
            row.querySelector('.bom-cost').value = cost.toFixed(4);
            totalCost += cost;
        } else {
            row.querySelector('.bom-cost').value = '0.00';
        }
    });
    window.currentBOMCost = totalCost;
    calculatePreview();
    return totalCost;
}

function updateMarginLabel() {
    const type = document.getElementById('marginType').value;
    const label = document.getElementById('marginLabel');
    if (label) label.textContent = type === 'percent' ? 'النسبة (%)' : 'القيمة (ج.م)';
    calculatePreview();
}

function calculatePreview() {
    const cost = window.currentBOMCost || 0;
    const marginType = document.getElementById('marginType') ? document.getElementById('marginType').value : 'percent';
    const marginValue = parseFloat(document.getElementById('marginValue') ? document.getElementById('marginValue').value : 0) || 0;
    const roundedInput = document.getElementById('finalPriceRounded');

    let finalPrice = cost;
    if (marginType === 'percent') {
        finalPrice = cost + (cost * marginValue / 100);
    } else {
        finalPrice = cost + marginValue;
    }

    // Check if manual rounding is set
    const rounded = roundedInput ? parseFloat(roundedInput.value) : NaN;
    const displayPrice = (!isNaN(rounded) && rounded > 0) ? rounded : finalPrice;

    const costEl = document.getElementById('previewCost');
    const priceEl = document.getElementById('previewPrice');
    const profitEl = document.getElementById('previewProfit');
    if (costEl) costEl.textContent = cost.toFixed(2);
    if (priceEl) priceEl.textContent = displayPrice.toFixed(2);
    if (profitEl) profitEl.textContent = (displayPrice - cost).toFixed(2);

    window.currentFinalPrice = displayPrice;
    window.currentCost = cost;
}

function addProduct(e) {
    e.preventDefault();
    const products = getData('products');

    const bom = [];
    document.querySelectorAll('.bom-row').forEach(row => {
        const select = row.querySelector('.bom-material');
        const qty = parseFloat(row.querySelector('.bom-qty').value) || 0;
        if (select.value && qty > 0) {
            const mat = getData('materials').find(m => m.id === select.value);
            bom.push({
                materialId: select.value,
                materialName: mat ? mat.name : '',
                quantity: qty,
                unit: mat ? (mat.unit || 'وحدة') : 'وحدة',
                unitCost: mat ? mat.price : 0
            });
        }
    });

    const cost = calculateBOM();
    const marginType = document.getElementById('marginType').value;
    const marginValue = parseFloat(document.getElementById('marginValue').value) || 0;
    const roundedInput = document.getElementById('finalPriceRounded');
    const rounded = roundedInput ? parseFloat(roundedInput.value) : NaN;

    let finalPrice = cost;
    if (marginType === 'percent') {
        finalPrice = cost + (cost * marginValue / 100);
    } else {
        finalPrice = cost + marginValue;
    }

    if (!isNaN(rounded) && rounded > 0) finalPrice = rounded;

    const product = {
        id: generateId(),
        name: document.getElementById('prodName').value,
        color: document.getElementById('prodColor').value,
        image: document.getElementById('prodPreview') ? document.getElementById('prodPreview').src : '',
        bom: bom,
        cost: cost,
        marginType: marginType,
        marginValue: marginValue,
        finalPrice: finalPrice,
        finalPriceRounded: (!isNaN(rounded) && rounded > 0) ? rounded : null
    };

    products.push(product);
    setData('products', products);
    e.target.reset();
    if (document.getElementById('prodPreview')) document.getElementById('prodPreview').style.display = 'none';
    document.getElementById('bomItems').innerHTML = '';
    addBomRow();
    window.currentBOMCost = 0;
    calculatePreview();
    renderProducts();
    updateDashboard();
    toast('تم إضافة المنتج بنجاح!');
}

function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    const products = getData('products');
    container.className = 'cards-view';
    container.innerHTML = '';
    if (products.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">🏭</div><h3>لا توجد منتجات بعد</h3><p>أضف منتجك الأول باستخدام النموذج أعلاه</p></div>`;
        return;
    }
    products.forEach(prod => {
        const div = document.createElement('div');
        div.className = 'card';
        const profit = prod.finalPrice - prod.cost;
        const margin = prod.cost > 0 ? ((profit / prod.cost) * 100).toFixed(1) : 0;
        let bomHtml = prod.bom.map(b => `<li>${b.materialName} × ${b.quantity} ${b.unit || ''} = ${(b.quantity * b.unitCost).toFixed(4)} ج.م</li>`).join('');
        div.innerHTML = `
            <div class="card-accent-bar" style="background:${prod.color};"></div>
            ${prod.image && prod.image !== 'data:' ? `<img src="${prod.image}" class="card-image" alt="${prod.name}">` : `<div class="card-image" style="background:${prod.color}22; font-size:3rem; color:${prod.color};">🏭</div>`}
            <div class="card-body">
                <h3 class="card-title">${prod.name}</h3>
                <div class="card-tags">
                    <span class="tag">هامش ${margin}%</span>
                    ${prod.finalPriceRounded ? '<span class="tag orange">🔢 سعر مُقرَّب</span>' : ''}
                </div>
                <div class="card-meta">
                    <p style="color:var(--gray);">💰 التكلفة: ${prod.cost.toFixed(2)} ج.م</p>
                    <p class="card-final-price">🏷️ السعر النهائي: ${prod.finalPrice.toFixed(2)} ج.م</p>
                    <p class="card-profit">📈 الربح: ${profit.toFixed(2)} ج.م</p>
                </div>
                <details>
                    <summary>🧩 المكونات (${prod.bom.length})</summary>
                    <ul>${bomHtml}</ul>
                </details>
                <div class="card-actions" style="margin-top:0.75rem;">
                    <button class="btn btn-secondary btn-sm" onclick="openEditProduct('${prod.id}')">✏️ تعديل</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${prod.id}')">🗑️ حذف</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const products = getData('products').filter(p => p.id !== id);
    setData('products', products);
    renderProducts();
    updateDashboard();
    toast('تم حذف المنتج', 'warning');
}

// ---- Edit Product ----
function openEditProduct(id) {
    const prod = getData('products').find(p => p.id === id);
    if (!prod) return;
    document.getElementById('editProdId').value = id;
    document.getElementById('editProdName').value = prod.name;
    document.getElementById('editProdColor').value = prod.color;
    document.getElementById('editMarginType').value = prod.marginType;
    document.getElementById('editMarginValue').value = prod.marginValue;
    document.getElementById('editFinalPriceRounded').value = prod.finalPriceRounded || '';
    window.editingProdCost = prod.cost;
    updateEditMarginLabel();
    document.getElementById('editProductModal').classList.add('open');
}

function closeEditProductModal() {
    document.getElementById('editProductModal').classList.remove('open');
}

function updateEditMarginLabel() {
    const type = document.getElementById('editMarginType').value;
    document.getElementById('editMarginLabel').textContent = type === 'percent' ? 'النسبة (%)' : 'القيمة (ج.م)';
    updateEditPreview();
}

function updateEditPreview() {
    const cost = window.editingProdCost || 0;
    const marginType = document.getElementById('editMarginType').value;
    const marginValue = parseFloat(document.getElementById('editMarginValue').value) || 0;
    const roundedVal = parseFloat(document.getElementById('editFinalPriceRounded').value);

    let finalPrice = cost;
    if (marginType === 'percent') {
        finalPrice = cost + (cost * marginValue / 100);
    } else {
        finalPrice = cost + marginValue;
    }
    if (!isNaN(roundedVal) && roundedVal > 0) finalPrice = roundedVal;

    document.getElementById('editPreviewCost').textContent = cost.toFixed(2);
    document.getElementById('editPreviewPrice').textContent = finalPrice.toFixed(2);
    document.getElementById('editPreviewProfit').textContent = (finalPrice - cost).toFixed(2);
}

function saveEditProduct() {
    const id = document.getElementById('editProdId').value;
    const products = getData('products');
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return;

    const prod = products[index];
    const cost = prod.cost;
    const marginType = document.getElementById('editMarginType').value;
    const marginValue = parseFloat(document.getElementById('editMarginValue').value) || 0;
    const roundedVal = parseFloat(document.getElementById('editFinalPriceRounded').value);

    let finalPrice = cost;
    if (marginType === 'percent') {
        finalPrice = cost + (cost * marginValue / 100);
    } else {
        finalPrice = cost + marginValue;
    }
    if (!isNaN(roundedVal) && roundedVal > 0) finalPrice = roundedVal;

    prod.name = document.getElementById('editProdName').value;
    prod.color = document.getElementById('editProdColor').value;
    prod.marginType = marginType;
    prod.marginValue = marginValue;
    prod.finalPrice = finalPrice;
    prod.finalPriceRounded = (!isNaN(roundedVal) && roundedVal > 0) ? roundedVal : null;

    products[index] = prod;
    setData('products', products);
    closeEditProductModal();
    renderProducts();
    toast('تم تحديث المنتج بنجاح!');
}

// ==================== Quotes ====================
function addQuoteItem() {
    const container = document.getElementById('quoteItems');
    const products = getData('products');

    const row = document.createElement('div');
    row.className = 'form-row';
    row.style.cssText = 'background:var(--light);padding:1rem;border-radius:var(--radius-sm);margin-bottom:0.75rem;border:1px solid var(--border);';
    row.innerHTML = `
        <div class="form-group">
            <label>المنتج</label>
            <select class="quote-product" onchange="calculateQuote()">
                <option value="">اختر منتج...</option>
                ${products.map(p => `<option value="${p.id}" data-price="${p.finalPrice}">${p.name} (${p.finalPrice.toFixed(2)} ج.م)</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>الكمية</label>
            <input type="number" class="quote-qty" min="1" value="1" oninput="calculateQuote()">
        </div>
        <div class="form-group">
            <label>الإجمالي</label>
            <input type="text" class="quote-total" readonly value="0.00" style="background:rgba(0,184,148,0.05);color:var(--secondary);font-weight:700;">
        </div>
        <div class="form-group" style="align-self:flex-end;">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.form-row').remove(); calculateQuote();">❌</button>
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
        if (option && option.value) {
            const price = parseFloat(option.dataset.price) || 0;
            const total = price * qty;
            row.querySelector('.quote-total').value = total.toFixed(2);
            grandTotal += total;
            const product = getData('products').find(p => p.id === select.value);
            if (product) {
                product.bom.forEach(b => {
                    const needed = b.quantity * qty;
                    materialsNeeded[b.materialId] = (materialsNeeded[b.materialId] || 0) + needed;
                });
            }
        }
    });

    const totalEl = document.getElementById('quoteTotal');
    if (totalEl) totalEl.textContent = grandTotal.toFixed(2);
    window.currentMaterialsNeeded = materialsNeeded;
    return { total: grandTotal, materials: materialsNeeded };
}

function createQuote(e) {
    e.preventDefault();
    const calc = calculateQuote();
    const materials = getData('materials');
    const insufficient = [];

    for (let [matId, needed] of Object.entries(calc.materials)) {
        const mat = materials.find(m => m.id === matId);
        if (mat && mat.stock < needed) {
            insufficient.push(`${mat.name} (متوفر: ${mat.stock.toFixed(2)} ${mat.unit || ''}, مطلوب: ${needed.toFixed(2)} ${mat.unit || ''})`);
        }
    }

    if (insufficient.length > 0) {
        toast('⚠️ كميات غير كافية: ' + insufficient.join(' | '), 'error');
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
        if (select.value && qty > 0) {
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

    for (let [matId, needed] of Object.entries(calc.materials)) {
        const matIndex = materials.findIndex(m => m.id === matId);
        if (matIndex !== -1) materials[matIndex].stock -= needed;
    }
    setData('materials', materials);

    e.target.reset();
    document.getElementById('quoteItems').innerHTML = '';
    document.getElementById('quoteDate').valueAsDate = new Date();
    addQuoteItem();
    renderQuotes();
    updateDashboard();
    toast('تم إنشاء الطلب وخصم الكميات من المخزون!');
}

function renderQuotes() {
    const container = document.getElementById('quotesList');
    if (!container) return;
    const quotes = getData('quotes');
    container.innerHTML = '';

    if (quotes.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><h3>لا توجد طلبات بعد</h3><p>أنشئ طلبك الأول باستخدام النموذج أعلاه</p></div>`;
        return;
    }

    const title = document.createElement('h2');
    title.style.cssText = 'font-size:1.1rem;font-weight:700;color:var(--gray);margin-bottom:1rem;';
    title.textContent = `📋 الطلبات السابقة (${quotes.length})`;
    container.appendChild(title);

    quotes.slice().reverse().forEach(q => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.style.marginBottom = '0.75rem';
        const itemsList = q.items.map(i => `${i.productName} × ${i.quantity}`).join(', ');
        div.innerHTML = `
            <div style="width:44px;height:44px;background:rgba(108,92,231,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">📋</div>
            <div class="list-item-info">
                <h4>طلب #${q.id.substr(-4).toUpperCase()} — ${q.client}</h4>
                <p>📅 ${q.date} | ${itemsList}</p>
                <p style="color:var(--primary);font-weight:700;">💰 ${q.total.toFixed(2)} ج.م</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-danger btn-sm" onclick="deleteQuote('${q.id}')">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteQuote(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    const quotes = getData('quotes').filter(q => q.id !== id);
    setData('quotes', quotes);
    renderQuotes();
    updateDashboard();
    toast('تم حذف الطلب', 'warning');
}

function printQuote() {
    const calc = calculateQuote();
    const company = JSON.parse(localStorage.getItem(STORAGE_KEYS.company) || '{}');
    const date = document.getElementById('quoteDate').value;
    const client = document.getElementById('quoteClient').value;

    document.getElementById('printCompanyName').textContent = company.name || 'وميض';
    document.getElementById('printCompanyAddress').textContent = company.address || '';
    document.getElementById('printCompanyPhones').textContent = company.phones || '';
    if (company.logo && document.getElementById('printLogo')) document.getElementById('printLogo').src = company.logo;

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
        if (option && option.value) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${index + 1}</td><td>${option.text.split('(')[0].trim()}</td><td>${qty}</td><td>${(parseFloat(total)/parseFloat(qty)).toFixed(2)}</td><td>${total}</td>`;
            tbody.appendChild(tr);
        }
    });

    window.print();
}

// ==================== Expenses ====================
function addExpense(e) {
    e.preventDefault();
    const expenses = getData('expenses');
    const icons = {
        electricity: '⚡', water: '💧', internet: '📡', rent: '🏠', gas: '🔥', phone: '📞', other: '💼'
    };
    const category = document.getElementById('expCategory').value;

    const expense = {
        id: generateId(),
        name: document.getElementById('expName').value,
        category: category,
        icon: icons[category] || '💼',
        amount: parseFloat(document.getElementById('expAmount').value) || 0,
        period: document.getElementById('expPeriod').value,
        notes: document.getElementById('expNotes') ? document.getElementById('expNotes').value : ''
    };

    expenses.push(expense);
    setData('expenses', expenses);
    e.target.reset();
    renderExpenses();
    toast('تم إضافة المصروف بنجاح!');
}

function renderExpenses() {
    const container = document.getElementById('expensesList');
    if (!container) return;
    const expenses = getData('expenses');

    // Update summary
    const monthly = expenses.filter(e => e.period === 'monthly').reduce((s, e) => s + e.amount, 0);
    const yearly = expenses.filter(e => e.period === 'yearly').reduce((s, e) => s + e.amount, 0);
    const monthlyFromYearly = yearly / 12;
    const totalMonthly = monthly + monthlyFromYearly;

    const sumEl = document.getElementById('expensesSummary');
    if (sumEl) {
        sumEl.innerHTML = `
            <div class="exp-sum-item"><div class="label">إجمالي شهري</div><div class="value">${totalMonthly.toFixed(2)} ج.م</div></div>
            <div class="exp-sum-item"><div class="label">إجمالي سنوي</div><div class="value">${(totalMonthly * 12).toFixed(2)} ج.م</div></div>
            <div class="exp-sum-item"><div class="label">التكلفة اليومية</div><div class="value">${(totalMonthly / 30).toFixed(2)} ج.م</div></div>
        `;
    }

    container.innerHTML = '';
    if (expenses.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">💸</div><h3>لا توجد مصاريف مسجلة</h3><p>أضف مصاريفك التشغيلية للتتبع الكامل للتكاليف</p></div>`;
        return;
    }

    expenses.forEach(exp => {
        const div = document.createElement('div');
        div.className = 'expense-item';
        const monthlyAmt = exp.period === 'yearly' ? exp.amount / 12 : exp.amount;
        div.innerHTML = `
            <div class="expense-icon">${exp.icon}</div>
            <div class="expense-info">
                <h4>${exp.name}</h4>
                <p>${exp.period === 'monthly' ? 'شهري' : 'سنوي'} | ${exp.period === 'yearly' ? `${exp.amount} ج.م/سنة ← ${monthlyAmt.toFixed(2)} ج.م/شهر` : `${exp.amount} ج.م/شهر`}</p>
            </div>
            <div class="expense-amount">${monthlyAmt.toFixed(2)} <span style="font-size:0.75rem;opacity:0.7;">ج.م/شهر</span></div>
            <div>
                <button class="btn btn-danger btn-sm" onclick="deleteExpense('${exp.id}')">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteExpense(id) {
    if (!confirm('هل تريد حذف هذا المصروف؟')) return;
    const expenses = getData('expenses').filter(e => e.id !== id);
    setData('expenses', expenses);
    renderExpenses();
    toast('تم حذف المصروف', 'warning');
}

// ==================== Dashboard ====================
function updateDashboard() {
    const mats = getData('materials');
    const prods = getData('products');
    const quotes = getData('quotes');

    const matCount = document.getElementById('materialsCount');
    const prodCount = document.getElementById('productsCount');
    const quoteCount = document.getElementById('quotesCount');

    if (matCount) matCount.textContent = mats.length;
    if (prodCount) prodCount.textContent = prods.length;
    if (quoteCount) quoteCount.textContent = quotes.length;
}

// ==================== Data Management ====================
function exportData() {
    const data = {
        materials: getData('materials'),
        products: getData('products'),
        quotes: getData('quotes'),
        expenses: getData('expenses'),
        company: JSON.parse(localStorage.getItem(STORAGE_KEYS.company) || '{}'),
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wamid-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast('تم تصدير البيانات بنجاح!');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.materials) setData('materials', data.materials);
            if (data.products) setData('products', data.products);
            if (data.quotes) setData('quotes', data.quotes);
            if (data.expenses) setData('expenses', data.expenses);
            if (data.company) localStorage.setItem(STORAGE_KEYS.company, JSON.stringify(data.company));
            toast('تم استيراد البيانات بنجاح! جاري التحديث...');
            setTimeout(() => location.reload(), 1500);
        } catch (err) {
            toast('خطأ في قراءة الملف!', 'error');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (!confirm('⚠️ هل أنت متأكد تماماً من مسح جميع البيانات؟ لا يمكن التراجع!')) return;
    if (!confirm('تأكيد نهائي: سيتم مسح كل المواد والمنتجات والطلبات والمصاريف!')) return;
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    toast('تم مسح جميع البيانات', 'warning');
    setTimeout(() => location.reload(), 1000);
}

// --- 1. АВТЕНТИФІКАЦІЯ ТА РОЗМЕЖУВАННЯ ДОСТУПУ ---
if (!localStorage.getItem('users')) {
    const defaultUsers = [
        { username: "admin", name: "Niko Karuso", role: "Адміністратор", desc: "Головний адміністратор системи", pass: "admin123" },
        { username: "operator", name: "Дмитро Ковальчук", role: "Оператор", desc: "Комірник зміни А", pass: "user123" }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

// Функція автоматичної генерації 100+ товарів для диплому (Seed Data)
function generate100Items() {
    const categories = ["Завіси", "Ручки", "Напрямні", "Кріплення", "Опори"];
    const names = {
        "Завіси": ["CLIP-ON з доводчиком 110°", "Накладна завіса 90° Eco", "Внутрішня завіса Premium", "Кутова завіса 45°", "Трансформер 165°", "Завіса для скляних дверей", "Міні-завіса 26мм", "Карусельна завіса"],
        "Ручки": ["Ручка-профіль чорна матова", "Ручка скоба хром 128мм", "Ручка кнопка золото", "Лофт ручка залізна", "Класична бронзова ручка", "Врізна ручка для шаф-купе", "Ручка рейлінг 256мм", "Керамічна ручка з малюнком"],
        "Напрямні": ["Телескопічні повного висування 450мм", "Напрямні прихованого монтажу з push-to-open", "Роликові напрямні білі 400мм", "Тандембокс суцільнометалевий Slim", "Метабокс 500мм", "Напрямні з доводчиком Heavy Duty"],
        "Кріплення": ["Конфірмат 7х50 сталь", "Мініфікс ексцентрикова стяжка", "Шкант дерев'яний 8х35", "Рафікс стяжка полкодержатель", "Саморіз для фурнітури 3.5х16", "Кутник меблевий пластиковий", "Стяжка міжсекційна металева"],
        "Опори": ["Ніжка регульована чорна 100мм", "Опора декоративна хром", "Колесо меблеве з гальмом", "Ніжка для стола конусна 710мм", "Цокольна опора пластикова", "Підп'ятник войлочний самоклейка"]
    };

    const items = [];
    let counter = 100;

    categories.forEach(cat => {
        names[cat].forEach((name, i) => {
            // Створюємо кілька модифікацій кожного товару для кількості
            const sizes = ["M", "L", "XL", "Premium", "Standard"];
            sizes.forEach(size => {
                counter++;
                const qty = Math.floor(Math.random() * 220); // випадкова кількість
                const min = Math.floor(Math.random() * 30) + 15; // критичний ліміт
                items.push({
                    sku: `${cat[0].toUpperCase()}-${counter}`,
                    name: `${name} (${size})`,
                    type: cat,
                    quantity: qty,
                    minRequired: min,
                    supplierId: Math.floor(Math.random() * 3) + 1
                });
            });
        });
    });
    return items;
}

// Базова ініціалізація інших даних
if (!localStorage.getItem('suppliers')) {
    localStorage.setItem('suppliers', JSON.stringify([
        { id: 1, name: "ТОВ Меблеві Технології", phone: "+380441112233", email: "info@mt.ua" },
        { id: 2, name: "ФОП Смирнов Фурнітура", phone: "+380679998877", email: "smirnov.f@gmail.com" },
        { id: 3, name: "GTV Україна", phone: "+380505554433", email: "sales@gtv.com.ua" }
    ]));
}

if (!localStorage.getItem('inventory')) {
    localStorage.setItem('inventory', JSON.stringify(generate100Items()));
}

if (!localStorage.getItem('transactions')) {
    localStorage.setItem('transactions', JSON.stringify([
        { date: "24.05.2026, 10:14", sku: "Z-101", name: "Завіса CLIP-ON з доводчиком 110° (Premium)", type: "Прихід", quantity: 100 }
    ]));
}

// --- СИСТЕМА СЕСІЙ ТА ПЕРЕВІРКА ВХОДУ ---
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isLoginPage = window.location.pathname.includes('login.html');

    if (!currentUser && !isLoginPage) {
        window.location.href = 'login.html';
    } else if (currentUser && isLoginPage) {
        window.location.href = 'index.html';
    }
    return currentUser;
}

const user = checkAuth();

document.addEventListener("DOMContentLoaded", () => {
    if (user) {
        renderNavigation();
        const display = document.getElementById('user-display');
        if (display) display.innerHTML = `Користувач: <strong>${user.name}</strong> (${user.role}) <a href="#" id="logout-btn" style="margin-left:10px; color:#ef4444; text-decoration:none;">Вийти</a>`;
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            });
        }
    }

    // Ініціалізація обробника форми входу
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const uName = document.getElementById('login-username').value;
            const uPass = document.getElementById('login-password').value;
            const usersList = JSON.parse(localStorage.getItem('users'));

            const foundUser = usersList.find(u => u.username === uName && u.pass === uPass);
            if (foundUser) {
                localStorage.setItem('currentUser', JSON.stringify(foundUser));
                window.location.href = 'index.html';
            } else {
                alert('Невірний логін або пароль!');
            }
        });
    }

    // Ініціалізація сторінок
    updateGlobalStats();
    if (document.getElementById('inventory-table')) initInventoryPage();
    if (document.getElementById('suppliers-table')) initSuppliersPage();
    if (document.getElementById('transactions-table')) initTransactionsPage();
    if (document.getElementById('users-table')) initUsersPage();
    if (document.getElementById('recent-table')) renderRecentTable();
    if (document.getElementById('export-excel-btn')) {
        document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
    }
});

// Динамічний рендеринг меню на основі Ролі
function renderNavigation() {
    const navContainer = document.getElementById('main-navigation');
    if (!navContainer) return;
    
    const currentPath = window.location.pathname;
    
    let menuHtml = `
        <a href="index.html" class="${currentPath.includes('index.html') ? 'active' : ''}">📊 Дашборд</a>
        <a href="inventory.html" class="${currentPath.includes('inventory.html') ? 'active' : ''}">📦 Облік фурнітури</a>
        <a href="suppliers.html" class="${currentPath.includes('suppliers.html') ? 'active' : ''}">🤝 Постачальники</a>
        <a href="orders.html" class="${currentPath.includes('orders.html') ? 'active' : ''}">🔄 Рух складу</a>
    `;

    // Тільки Адміністратор бачить меню користувачів
    if (user && user.role === "Адміністратор") {
        menuHtml += `<a href="users.html" class="${currentPath.includes('users.html') ? 'active' : ''}">👥 Користувачі ІС</a>`;
    } else if (currentPath.includes('users.html')) {
        // Якщо оператор спробує зайти за прямим посиланням — викидаємо його
        window.location.href = 'index.html';
    }

    navContainer.innerHTML = menuHtml;
}

// --- ФУНКЦІЇ ДЛЯ СТОРІНКИ КЕРУВАННЯ КОРИСТУВАЧАМИ ---
function initUsersPage() {
    renderUsersTable();
    document.getElementById('add-user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const usersList = JSON.parse(localStorage.getItem('users'));
        
        const newUser = {
            username: document.getElementById('u-username').value,
            name: document.getElementById('u-name').value,
            role: document.getElementById('u-role').value,
            desc: document.getElementById('u-desc').value,
            pass: document.getElementById('u-pass').value
        };

        if (usersList.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
            alert('Користувач із таким логіном вже існує!');
            return;
        }

        usersList.push(newUser);
        localStorage.setItem('users', JSON.stringify(usersList));
        renderUsersTable();
        document.getElementById('add-user-form').reset();
    });
}

function renderUsersTable() {
    const usersList = JSON.parse(localStorage.getItem('users'));
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    tbody.innerHTML = "";

    usersList.forEach(u => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><code>${u.username}</code></td>
            <td><strong>${u.name}</strong></td>
            <td><span class="badge ${u.role === 'Адміністратор' ? 'badge-success' : 'badge-success'}" style="background:#cbd5e1; color:#1e293b;">${u.role}</span></td>
            <td>${u.desc || '-'}</td>
            <td><button class="btn btn-danger" ${u.username === 'admin' ? 'disabled' : ''} onclick="deleteUser('${u.username}')">Видалити</button></td>
        `;
        tbody.appendChild(row);
    });
}

function deleteUser(username) {
    if (confirm(`Видалити доступ користувачу ${username}?`)) {
        let usersList = JSON.parse(localStorage.getItem('users'));
        usersList = usersList.filter(u => u.username !== username);
        localStorage.setItem('users', JSON.stringify(usersList));
        renderUsersTable();
    }
}

// --- РЕШТА СКЛАДСЬКОЇ ЛОГІКИ (БЕЗ ЗМІН, З ПЕРЕВІРКОЮ НА ПРАВА ДОСТУПУ) ---
function getInventory() { return JSON.parse(localStorage.getItem('inventory')); }
function saveInventory(data) { localStorage.setItem('inventory', JSON.stringify(data)); }
function getSuppliers() { return JSON.parse(localStorage.getItem('suppliers')); }
function saveSuppliers(data) { localStorage.setItem('suppliers', JSON.stringify(data)); }
function getTransactions() { return JSON.parse(localStorage.getItem('transactions')); }
function saveTransactions(data) { localStorage.setItem('transactions', JSON.stringify(data)); }

function updateGlobalStats() {
    const inventory = getInventory();
    const transactions = getTransactions();
    
    const totalTypesElem = document.getElementById('total-types');
    const totalItemsElem = document.getElementById('total-items');
    const lowStockElem = document.getElementById('low-stock-count');
    const recentOpsElem = document.getElementById('recent-transactions');

    if (!inventory) return;

    let totalItemsCount = 0;
    let lowStockCount = 0;

    inventory.forEach(item => {
        totalItemsCount += parseInt(item.quantity);
        if (parseInt(item.quantity) < parseInt(item.minRequired)) {
            lowStockCount++;
        }
    });

    if (totalTypesElem) totalTypesElem.innerText = inventory.length;
    if (totalItemsElem) totalItemsElem.innerText = totalItemsCount.toLocaleString();
    if (recentOpsElem && transactions) recentOpsElem.innerText = transactions.length;
    if (lowStockElem) lowStockElem.innerText = lowStockCount;
}

function initInventoryPage() {
    renderInventoryTable();
    populateSupplierSelect();

    // Якщо роль "Оператор" - ховаємо або блокуємо форму додавання нових позицій
    if (user && user.role !== "Адміністратор") {
        const formCard = document.querySelector('.dynamic-form');
        if (formCard) formCard.style.display = 'none';
        const listCard = document.querySelector('.inventory-list');
        if (listCard) listCard.style.width = '100%';
    }

    const form = document.getElementById('add-furniture-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const inventory = getInventory();
            const newItem = {
                sku: document.getElementById('f-sku').value,
                name: document.getElementById('f-name').value,
                type: document.getElementById('f-type').value,
                quantity: parseInt(document.getElementById('f-quantity').value),
                minRequired: parseInt(document.getElementById('f-min').value),
                supplierId: parseInt(document.getElementById('f-supplier').value)
            };

            if (inventory.some(item => item.sku.toLowerCase() === newItem.sku.toLowerCase())) {
                alert('Артикул вже існує!'); return;
            }

            inventory.push(newItem);
            saveInventory(inventory);
            renderInventoryTable();
            updateGlobalStats();
            form.reset();
        });
    }

    document.getElementById('search-input').addEventListener('input', (e) => {
        renderInventoryTable(e.target.value);
    });
}

function renderInventoryTable(filterText = "") {
    const inventory = getInventory();
    const suppliers = getSuppliers();
    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) return;
    tbody.innerHTML = "";

    inventory.forEach((item, index) => {
        if (filterText && !item.name.toLowerCase().includes(filterText.toLowerCase()) && !item.sku.toLowerCase().includes(filterText.toLowerCase()) && !item.type.toLowerCase().includes(filterText.toLowerCase())) {
            return;
        }

        const supplier = suppliers.find(s => s.id === item.supplierId);
        const supplierName = supplier ? supplier.name : "Невідомий";
        const isLow = parseInt(item.quantity) < parseInt(item.minRequired);
        const statusBadge = isLow ? '<span class="badge badge-danger">Дефіцит</span>' : '<span class="badge badge-success">Норма</span>';

        // Кнопка видалення доступна тільки адміну
        const deleteBtn = (user && user.role === "Адміністратор") 
            ? `<button class="btn btn-danger" onclick="deleteInventoryItem(${index})">Видалити</button>` 
            : `<small style="color:#64748b">Немає прав</small>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.sku}</strong></td>
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td style="font-weight:bold; color: ${isLow ? 'var(--danger)' : 'inherit'}">${item.quantity} шт.</td>
            <td>${item.minRequired} шт.</td>
            <td>${supplierName}</td>
            <td>${statusBadge}</td>
            <td>${deleteBtn}</td>
        `;
        tbody.appendChild(row);
    });
}

function deleteInventoryItem(index) {
    if (confirm("Видалити позицію зі складу?")) {
        const inventory = getInventory();
        inventory.splice(index, 1);
        saveInventory(inventory);
        renderInventoryTable();
        updateGlobalStats();
    }
}

function populateSupplierSelect() {
    const suppliers = getSuppliers();
    const select = document.getElementById('f-supplier');
    if (!select) return;
    select.innerHTML = "";
    suppliers.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
}

function initSuppliersPage() {
    renderSuppliersTable();
    if (user && user.role !== "Адміністратор") {
        const formCard = document.querySelector('.dynamic-form');
        if (formCard) formCard.style.display = 'none';
        const listCard = document.querySelector('.inventory-list');
        if (listCard) listCard.style.width = '100%';
    }

    const form = document.getElementById('add-supplier-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const suppliers = getSuppliers();
            suppliers.push({
                id: Date.now(),
                name: document.getElementById('s-name').value,
                phone: document.getElementById('s-phone').value,
                email: document.getElementById('s-email').value
            });
            saveSuppliers(suppliers);
            renderSuppliersTable();
            form.reset();
        });
    }
}

function renderSuppliersTable() {
    const suppliers = getSuppliers();
    const tbody = document.querySelector('#suppliers-table tbody');
    if (!tbody) return;
    tbody.innerHTML = "";

    suppliers.forEach(s => {
        const deleteBtn = (user && user.role === "Адміністратор") 
            ? `<button class="btn btn-danger" onclick="deleteSupplier(${s.id})">Видалити</button>` 
            : `-`;
        tbody.innerHTML += `<tr><td>#</td><td><strong>${s.name}</strong></td><td>${s.phone}</td><td>${s.email}</td><td>${deleteBtn}</td></tr>`;
    });
}

function deleteSupplier(id) {
    if (confirm("Видалити постачальника?")) {
        let suppliers = getSuppliers();
        suppliers = suppliers.filter(s => s.id !== id);
        saveSuppliers(suppliers);
        renderSuppliersTable();
    }
}

function initTransactionsPage() {
    renderTransactionsTable();
    populateFurnitureSelect();

    document.getElementById('transaction-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const inventory = getInventory();
        const transactions = getTransactions();
        
        const selectedSku = document.getElementById('t-furniture').value;
        const type = document.getElementById('t-type').value;
        const qty = parseInt(document.getElementById('t-quantity').value);
        
        const idx = inventory.findIndex(item => item.sku === selectedSku);
        if (idx === -1) return;

        if (type === "Розхід" && inventory[idx].quantity < qty) {
            alert(`Недостатньо на складі! Наявність: ${inventory[idx].quantity} шт.`); return;
        }

        inventory[idx].quantity = (type === "Прихід") ? inventory[idx].quantity + qty : inventory[idx].quantity - qty;

        transactions.push({
            date: new Date().toLocaleString('uk-UA'),
            sku: selectedSku,
            name: inventory[idx].name,
            type: type,
            quantity: qty
        });

        saveInventory(inventory);
        saveTransactions(transactions);
        renderTransactionsTable();
        updateGlobalStats();
        populateFurnitureSelect();
    });
}

function renderTransactionsTable() {
    const transactions = getTransactions();
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody) return;
    tbody.innerHTML = "";

    [...transactions].reverse().slice(0, 50).forEach(tx => {
        const badgeClass = tx.type === "Прихід" ? "badge-success" : "badge-danger";
        tbody.innerHTML += `<tr><td><small>${tx.date}</small></td><td><code>${tx.sku}</code></td><td>${tx.name}</td><td><span class="badge ${badgeClass}">${tx.type}</span></td><td><strong>${tx.type === "Прихід" ? "+" : "-"}${tx.quantity} шт.</strong></td></tr>`;
    });
}

function populateFurnitureSelect() {
    const inventory = getInventory();
    const select = document.getElementById('t-furniture');
    if (!select) return;
    select.innerHTML = "";
    inventory.sort((a,b) => a.name.localeCompare(b.name)).forEach(item => {
        select.innerHTML += `<option value="${item.sku}">[${item.sku}] ${item.name} (Залишок: ${item.quantity} шт.)</option>`;
    });
}

function renderRecentTable() {
    const inventory = getInventory();
    const tbody = document.querySelector('#recent-table tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    inventory.slice(0, 5).forEach(item => {
        const isLow = parseInt(item.quantity) < parseInt(item.minRequired);
        const badge = isLow ? '<span class="badge badge-danger">Дефіцит</span>' : '<span class="badge badge-success">Норма</span>';
        tbody.innerHTML += `<tr><td><code>${item.sku}</code></td><td>${item.name}</td><td>${item.type}</td><td><strong>${item.quantity} шт.</strong></td><td>${badge}</td></tr>`;
    });
}

// --- 📊 ГЕНЕРАЦІЯ ТА СКАЧУВАННЯ ЗВІТУ В EXCEL ---
function exportToExcel() {
    const inventory = getInventory();
    const suppliers = getSuppliers();

    let excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Залишки на складі</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #1e293b; color: #ffffff; font-weight: bold; padding: 10px; border: 1px solid #cbd5e1; }
            td { padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
            .title-row { font-size: 16px; font-weight: bold; text-align: center; color: #1e293b; }
            .danger-row { background-color: #fee2e2; color: #b91c1c; }
            .success-row { background-color: #dcfce7; color: #15803d; }
        </style>
    </head>
    <body>
        <table>
            <tr><td colspan="7" class="title-row">ЗВІТ ПРО ПОТОЧНІ ЗАЛИШКИ МЕБЛЕВОЇ ФУРНІТУРИ НА СКЛАДІ</td></tr>
            <tr><td colspan="7" style="text-align:center;">Дата генерації: ${new Date().toLocaleDateString()} | Сформував: ${user ? user.name : 'Система'}</td></tr>
            <tr><td colspan="7"></td></tr>
            <thead>
                <tr>
                    <th>Артикул (SKU)</th>
                    <th>Назва фурнітури</th>
                    <th>Категорія</th>
                    <th>Поточна кількість</th>
                    <th>Мінімальний ліміт</th>
                    <th>Постачальник</th>
                    <th>Статус позиції</th>
                </tr>
            </thead>
            <tbody>
    `;

    inventory.forEach(item => {
        const supplier = suppliers.find(s => s.id === item.supplierId);
        const supplierName = supplier ? supplier.name : "Не вказано";
        const isLow = parseInt(item.quantity) < parseInt(item.minRequired);
        const statusText = isLow ? "ДЕФІЦИТ" : "Норма";
        const rowClass = isLow ? "danger-row" : "success-row";

        excelTemplate += `
            <tr>
                <td><b>${item.sku}</b></td>
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td style="font-weight:bold;">${item.quantity}</td>
                <td>${item.minRequired}</td>
                <td>${supplierName}</td>
                <td class="${rowClass}">${statusText}</td>
            </tr>
        `;
    });

    excelTemplate += `</tbody></table></body></html>`;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `Full_Warehouse_Report_${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
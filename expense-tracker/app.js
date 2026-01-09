// Expense Tracker App
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalDiv = document.getElementById('total');
const categorySummaryDiv = document.getElementById('category-summary');

const STORAGE_KEY = 'expense_tracker_data_v1';

function getExpenses() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function renderExpenses() {
    const expenses = getExpenses();
    expenseList.innerHTML = '';
    expenses.forEach((expense, idx) => {
        const li = document.createElement('li');
        li.className = 'expense-item';
        li.innerHTML = `
            <div class="expense-details">
                <strong>${expense.name}</strong> - $${expense.amount.toFixed(2)}<br>
                <span>${expense.category}</span>
            </div>
            <div class="expense-actions">
                <button class="edit" onclick="editExpense(${idx})">Edit</button>
                <button onclick="deleteExpense(${idx})">Delete</button>
            </div>
        `;
        expenseList.appendChild(li);
    });
    renderSummary(expenses);
}

function renderSummary(expenses) {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalDiv.textContent = `Total: $${total.toFixed(2)}`;
    const categories = {};
    expenses.forEach(exp => {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    categorySummaryDiv.innerHTML = Object.entries(categories)
        .map(([cat, amt]) => `<div>${cat}: $${amt.toFixed(2)}</div>`)
        .join('');
}

expenseForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('expense-name').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    if (!name || isNaN(amount) || !category) return;
    const expenses = getExpenses();
    if (expenseForm.dataset.editIdx) {
        // Edit mode
        const idx = parseInt(expenseForm.dataset.editIdx);
        expenses[idx] = { name, amount, category };
        delete expenseForm.dataset.editIdx;
        expenseForm.querySelector('button[type="submit"]').textContent = 'Add Expense';
    } else {
        expenses.push({ name, amount, category });
    }
    saveExpenses(expenses);
    expenseForm.reset();
    renderExpenses();
};

window.editExpense = function(idx) {
    const expenses = getExpenses();
    const exp = expenses[idx];
    document.getElementById('expense-name').value = exp.name;
    document.getElementById('expense-amount').value = exp.amount;
    document.getElementById('expense-category').value = exp.category;
    expenseForm.dataset.editIdx = idx;
    expenseForm.querySelector('button[type="submit"]').textContent = 'Update Expense';
};

window.deleteExpense = function(idx) {
    const expenses = getExpenses();
    expenses.splice(idx, 1);
    saveExpenses(expenses);
    renderExpenses();
};

// Initial render
renderExpenses();

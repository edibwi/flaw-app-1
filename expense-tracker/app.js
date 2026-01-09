let editingIndex = null;

function editTransaction(index) {
    const transaction = transactions[index];
    if (!transaction) return;

    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('type').value = transaction.type;
    document.getElementById('category').value = transaction.category;

    editingIndex = index;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentFilter = 'all';

// --- Report Button Navigation (index.html) ---
document.addEventListener('DOMContentLoaded', function() {
    const monthlyReportBtn = document.getElementById('monthly-report-btn');
    if (monthlyReportBtn) {
        monthlyReportBtn.addEventListener('click', function() {
            window.location.href = 'report.html';
        });
    }
    // Expense report button present, but no functionality as requested

    // --- Report Page Logic (report.html) ---
    if (window.location.pathname.endsWith('report.html')) {
                // Back button navigation
                const backBtn = document.getElementById('back-btn');
                if (backBtn) {
                    backBtn.addEventListener('click', function() {
                        window.location.href = 'index.html';
                    });
                }
        // Populate month and year dropdowns
        const monthSelect = document.getElementById('report-month');
        const yearSelect = document.getElementById('report-year');
        const showReportBtn = document.getElementById('show-report-btn');
        const reportTableBody = document.querySelector('#report-table tbody');

        // Months
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        months.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i + 1;
            opt.textContent = m;
            monthSelect.appendChild(opt);
        });

        // Years (from transactions, fallback to current year)
        let years = transactions.map(t => new Date(t.date).getFullYear());
        years = Array.from(new Set(years));
        if (years.length === 0) years = [new Date().getFullYear()];
        years.sort((a, b) => b - a);
        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        });

        // Set default to current month/year
        monthSelect.value = (new Date().getMonth() + 1).toString();
        yearSelect.value = new Date().getFullYear().toString();

        function renderReportTable(month, year) {
            // Filter transactions for selected month/year
            const filtered = transactions.filter(t => {
                const d = new Date(t.date);
                return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
            });
            reportTableBody.innerHTML = '';
            if (filtered.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 4;
                td.textContent = 'No data for this month.';
                td.style.textAlign = 'center';
                tr.appendChild(td);
                reportTableBody.appendChild(tr);
                return;
            }
            filtered.forEach(t => {
                const tr = document.createElement('tr');
                const dateTd = document.createElement('td');
                dateTd.textContent = new Date(t.date).toLocaleDateString();
                const descTd = document.createElement('td');
                descTd.textContent = t.description;
                const typeTd = document.createElement('td');
                typeTd.textContent = t.type.charAt(0).toUpperCase() + t.type.slice(1);
                typeTd.className = t.type;
                const amtTd = document.createElement('td');
                amtTd.textContent = (t.type === 'income' ? '+' : '-') + '$' + t.amount.toFixed(2);
                amtTd.className = t.type;
                tr.appendChild(dateTd);
                tr.appendChild(descTd);
                tr.appendChild(typeTd);
                tr.appendChild(amtTd);
                reportTableBody.appendChild(tr);
            });
        }

        // Initial render
        renderReportTable(monthSelect.value, yearSelect.value);

        showReportBtn.addEventListener('click', function() {
            renderReportTable(monthSelect.value, yearSelect.value);
        });
    }
});

const form = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expensesEl = document.getElementById('expenses');
const filterButtons = document.querySelectorAll('.filter-btn');

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;

    balanceEl.textContent = `$${balance.toFixed(2)}`;
    incomeEl.textContent = `$${income.toFixed(2)}`;
    expensesEl.textContent = `$${expenses.toFixed(2)}`;
}

function renderTransactions() {
    const filteredTransactions = currentFilter === 'all' 
        ? transactions 
        : transactions.filter(t => t.type === currentFilter);

    if (filteredTransactions.length === 0) {
        transactionList.innerHTML = `
            <div class="empty-state">
                <p>No ${currentFilter === 'all' ? '' : currentFilter} transactions yet.</p>
            </div>
        `;
        return;
    }

    transactionList.innerHTML = filteredTransactions.length === 0
        ? `<tr class="empty-state"><td colspan="6" style="text-align:center; color:#999;">No ${currentFilter === 'all' ? '' : currentFilter} transactions yet.</td></tr>`
        : filteredTransactions.map((transaction, index) => {
            const actualIndex = transactions.indexOf(transaction);
            return `
                <tr class="transaction-row">
                    <td class="transaction-description">${transaction.description}</td>
                    <td class="transaction-category">${transaction.category}</td>
                    <td class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</td>
                    <td class="transaction-type ${transaction.type}">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                    <td class="transaction-amount ${transaction.type}">${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}</td>
                    <td style="white-space:nowrap;">
                        <button class="edit-icon-btn" title="Edit" onclick="editTransaction(${actualIndex})">
                            <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
                                <path d="M4 20h4l10.5-10.5a2.121 2.121 0 0 0-3-3L5 17v3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M14.5 6.5l3 3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="delete-icon-btn" title="Delete" disabled>
                            <svg class="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#dc3545">
                                <path d="M3 6h18" stroke-width="2" stroke-linecap="round"/>
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2" stroke-linecap="round"/>
                                <rect x="5" y="6" width="14" height="14" rx="2" stroke-width="2"/>
                                <path d="M10 11v6" stroke-width="2" stroke-linecap="round"/>
                                <path d="M14 11v6" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
}

function addTransaction(e) {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;

    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        category,
        date: new Date().toISOString()
    };

    if (editingIndex !== null) {
        transactions.splice(editingIndex, 1);
        editingIndex = null;
    }
    transactions.unshift(transaction);
    saveTransactions();
    updateSummary();
    renderTransactions();
    form.reset();
}

function deleteTransaction(index) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions.splice(index, 1);
        saveTransactions();
        updateSummary();
        renderTransactions();
    }
}

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTransactions();
    });
});

form.addEventListener('submit', addTransaction);

updateSummary();
renderTransactions();
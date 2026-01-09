let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentFilter = 'all';

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

    transactionList.innerHTML = filteredTransactions
        .map((transaction, index) => {
            const actualIndex = transactions.indexOf(transaction);
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-meta">
                            ${transaction.category} • ${new Date(transaction.date).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                    </div>
                    <button class="delete-btn" onclick="deleteTransaction(${actualIndex})">Delete</button>
                </div>
            `;
        })
        .join('');
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
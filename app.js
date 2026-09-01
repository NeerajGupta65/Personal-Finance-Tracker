/**
 * Neeraj Expense Tracker - Student Edition (Ultra High Performance)
 * Clean Fresh Start (All old data cleared, permanent save enabled from now on)
 */

(function () {
  'use strict';

  // =========================================================================
  // CONSTANTS & STUDENT CATEGORY DEFINITIONS
  // =========================================================================

  const STUDENT_CATEGORIES = [
    { id: 'food_canteen', name: 'Canteen, Mess & Food', icon: '🍔', color: '#F43F5E' },
    { id: 'chai_snacks', name: 'Chai, Coffee & Hangouts', icon: '☕', color: '#FB923C' },
    { id: 'books_stationery', name: 'Books, Stationery & Printing', icon: '📚', color: '#6366F1' },
    { id: 'travel_metro', name: 'Bus, Metro & Auto Travel', icon: '🚌', color: '#38BDF8' },
    { id: 'hostel_rent', name: 'Hostel / PG Rent & Mess', icon: '🏠', color: '#A855F7' },
    { id: 'recharge_wifi', name: 'Mobile Recharge, Wifi & OTT', icon: '📱', color: '#EAB308' },
    { id: 'shopping_clothes', name: 'Shopping & Grooming', icon: '🛍️', color: '#EC4899' },
    { id: 'college_fees', name: 'College, Tuition & Exam Fees', icon: '🎓', color: '#10B981' },
    { id: 'tech_gadgets', name: 'Tech Gadgets & Accessories', icon: '💻', color: '#06B6D4' },
    { id: 'gaming_fun', name: 'Gaming & Entertainment', icon: '🎮', color: '#8B5CF6' },
    { id: 'health_meds', name: 'Health & Medical', icon: '💊', color: '#14B8A6' },
    { id: 'other_exp', name: 'Other Expenses', icon: '📦', color: '#94A3B8' }
  ];

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Clean Permanent Storage Keys
  const STORAGE_KEYS = {
    TRANSACTIONS: 'neeraj_fresh_expenses_v1',
    ADVANCE_EXPENSES: 'neeraj_fresh_advance_v1',
    SETTINGS: 'neeraj_fresh_settings_v1',
    GOALS: 'neeraj_fresh_wishlist_v1',
    CLEANED_FLAG: 'neeraj_fresh_cleaned_flag_v1'
  };

  const OLD_KEYS = [
    'neeraj_permanent_expenses_v1', 'neeraj_permanent_advance_v1', 'neeraj_permanent_settings_v1', 'neeraj_permanent_wishlist_v1',
    'neeraj_student_expenses_v6', 'neeraj_student_advance_v6', 'neeraj_student_settings_v6', 'neeraj_student_wishlist_v6',
    'neeraj_student_expenses_v5', 'neeraj_student_advance_v5', 'neeraj_student_settings_v5', 'neeraj_student_wishlist_v5',
    'neeraj_student_expenses_v4', 'neeraj_student_settings_v4', 'neeraj_student_wishlist_v4',
    'neeraj_finance_transactions_v3', 'neeraj_finance_settings_v3', 'neeraj_finance_goals_v3',
    'apex_finance_transactions_v2', 'apex_finance_settings_v2', 'apex_finance_goals_v2',
    'apex_finance_transactions_v1'
  ];

  function getCurrentYearMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  // =========================================================================
  // APPLICATION STATE (STARTS COMPLETELY CLEAN / 0)
  // =========================================================================

  let state = {
    transactions: [],
    advanceExpenses: [],
    goals: [],
    settings: {
      currency: 'INR',
      currencySymbol: '₹',
      monthlyAllowance: 0,
      theme: 'dark'
    },
    selectedMonth: getCurrentYearMonth(),
    filters: {
      search: '',
      category: 'all',
      sortBy: 'date-desc'
    },
    trendView: 'monthly'
  };

  // =========================================================================
  // STORAGE & PERMANENT PERSISTENCE
  // =========================================================================

  function clearOldDataOnce() {
    // If not yet cleaned, purge all old demo/temporary keys
    if (!localStorage.getItem(STORAGE_KEYS.CLEANED_FLAG)) {
      OLD_KEYS.forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      // Initialize empty arrays
      try {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.ADVANCE_EXPENSES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
          currency: 'INR',
          currencySymbol: '₹',
          monthlyAllowance: 0,
          theme: 'dark'
        }));
        localStorage.setItem(STORAGE_KEYS.CLEANED_FLAG, 'true');
      } catch (e) {}
    }
  }

  function loadStateFromStorage() {
    clearOldDataOnce();
    try {
      const savedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const savedAdv = localStorage.getItem(STORAGE_KEYS.ADVANCE_EXPENSES);
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);

      state.transactions = savedTx ? JSON.parse(savedTx) : [];
      state.advanceExpenses = savedAdv ? JSON.parse(savedAdv) : [];
      if (savedSettings) state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
      state.goals = savedGoals ? JSON.parse(savedGoals) : [];
    } catch (e) {
      state.transactions = [];
      state.advanceExpenses = [];
      state.goals = [];
    }
  }

  function saveTransactionsToStorage() {
    try { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions)); } catch (e) {}
  }

  function saveAdvanceToStorage() {
    try { localStorage.setItem(STORAGE_KEYS.ADVANCE_EXPENSES, JSON.stringify(state.advanceExpenses)); } catch (e) {}
  }

  function saveSettingsToStorage() {
    try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings)); } catch (e) {}
  }

  function saveGoalsToStorage() {
    try { localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(state.goals)); } catch (e) {}
  }

  // =========================================================================
  // FAST FORMATTERS
  // =========================================================================

  function formatCurrency(amount, customSymbol = null) {
    const sym = customSymbol !== null ? customSymbol : state.settings.currencySymbol;
    const num = Number(amount) || 0;
    return `${sym}${Math.abs(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDateHuman(dateStr) {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  function getMonthYearLabel(yearMonthStr) {
    if (!yearMonthStr || yearMonthStr === 'all') return 'All Months';
    const [y, m] = yearMonthStr.split('-').map(Number);
    return `${MONTH_NAMES[m - 1] || ''} ${y}`;
  }

  function getCategoryInfo(categoryName) {
    const found = STUDENT_CATEGORIES.find(
      (c) => c.name.toLowerCase() === (categoryName || '').toLowerCase()
    );
    if (found) return found;
    return { id: 'custom', name: categoryName || 'Other Expenses', icon: '🏷️', color: '#F43F5E' };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================

  function showToast(message, type = 'info', actionBtn = null) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let iconHtml = type === 'success' ? '✓' : (type === 'danger' ? '⚠️' : 'ℹ️');

    toast.innerHTML = `<span style="font-size:1rem;">${iconHtml}</span><span>${message}</span>`;

    if (actionBtn && actionBtn.text && actionBtn.callback) {
      const btn = document.createElement('button');
      btn.className = 'toast-action-btn';
      btn.textContent = actionBtn.text;
      btn.onclick = () => { actionBtn.callback(); toast.remove(); };
      toast.appendChild(btn);
    }

    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  }

  // =========================================================================
  // ADVANCE EXPENSES CHECKLIST ENGINE
  // =========================================================================

  function openAdvanceModal(editId = null) {
    const modal = document.getElementById('modal-advance');
    const form = document.getElementById('form-advance');
    const modalTitle = document.getElementById('modal-advance-title');
    const symbolSpan = document.getElementById('advance-modal-curr-symbol');
    if (!modal || !form) return;

    if (symbolSpan) symbolSpan.textContent = state.settings.currencySymbol;

    const select = document.getElementById('advance-category');
    if (select) {
      select.innerHTML = STUDENT_CATEGORIES.map(
        (c) => `<option value="${c.name}">${c.icon} ${c.name}</option>`
      ).join('');
    }

    if (editId) {
      const adv = state.advanceExpenses.find((a) => a.id === editId);
      if (!adv) return;
      modalTitle.textContent = 'Edit Advance Expense';
      document.getElementById('advance-id').value = adv.id;
      document.getElementById('advance-amount').value = adv.amount;
      document.getElementById('advance-title-input').value = adv.title;
      document.getElementById('advance-category').value = adv.category;
      document.getElementById('advance-date').value = adv.date;
      document.getElementById('advance-notes').value = adv.notes || '';
    } else {
      modalTitle.textContent = '⏱️ Add Advance / Planned Expense';
      form.reset();
      document.getElementById('advance-id').value = '';
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('advance-date').value = today;
    }

    modal.classList.add('active');
    setTimeout(() => { document.getElementById('advance-amount')?.focus(); }, 50);
  }

  function closeAdvanceModal() {
    document.getElementById('modal-advance')?.classList.remove('active');
  }

  function handleSaveAdvance(e) {
    e.preventDefault();
    const idInput = document.getElementById('advance-id').value;
    const amount = parseFloat(document.getElementById('advance-amount').value);
    const title = document.getElementById('advance-title-input').value.trim();
    const category = document.getElementById('advance-category').value;
    const date = document.getElementById('advance-date').value;
    const notes = document.getElementById('advance-notes').value.trim();

    if (!amount || isNaN(amount) || amount <= 0 || !title || !date) {
      alert('Please fill out amount, title, and expected date.');
      return;
    }

    if (idInput) {
      const idx = state.advanceExpenses.findIndex((a) => a.id === idInput);
      if (idx !== -1) {
        state.advanceExpenses[idx] = { ...state.advanceExpenses[idx], amount, title, category, date, notes };
        showToast(`Updated planned expense "${title}"`, 'success');
      }
    } else {
      const newAdv = {
        id: 'adv_' + Date.now(),
        amount,
        title,
        category,
        date,
        notes,
        createdAt: Date.now()
      };
      state.advanceExpenses.push(newAdv);
      showToast(`Planned expense added: "${title}" (${formatCurrency(amount)})`, 'info');
    }

    saveAdvanceToStorage();
    closeAdvanceModal();
    renderAdvanceList();
  }

  // TICK-BOX DEBIT CONVERSION
  function handleTickAdvanceExpense(advId) {
    const adv = state.advanceExpenses.find((a) => a.id === advId);
    if (!adv) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTx = {
      id: 'tx_' + Date.now(),
      type: 'debit',
      amount: adv.amount,
      title: adv.title,
      category: adv.category,
      paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
      date: todayStr,
      time: timeStr,
      notes: adv.notes ? `${adv.notes} (From Advance Checklist)` : 'From Advance Checklist',
      createdAt: Date.now()
    };

    state.transactions.unshift(newTx);
    state.advanceExpenses = state.advanceExpenses.filter((a) => a.id !== advId);

    saveTransactionsToStorage();
    saveAdvanceToStorage();
    populateMonthDropdown();
    updateAppView();

    showToast(`✓ Marked as Paid! Logged -${formatCurrency(adv.amount)} for "${adv.title}" to expenses.`, 'success');
  }

  function deleteAdvanceExpense(advId) {
    const adv = state.advanceExpenses.find((a) => a.id === advId);
    if (!adv) return;

    state.advanceExpenses = state.advanceExpenses.filter((a) => a.id !== advId);
    saveAdvanceToStorage();
    renderAdvanceList();
    showToast(`Removed planned item "${adv.title}"`, 'info');
  }

  function renderAdvanceList() {
    const container = document.getElementById('advance-list-container');
    const badgeCount = document.getElementById('badge-advance-count');
    if (!container) return;

    if (badgeCount) {
      badgeCount.textContent = `${state.advanceExpenses.length} Planned`;
    }

    if (state.advanceExpenses.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:1.25rem; color:var(--text-muted); font-size:0.86rem;">
          No advance expenses planned. Click <strong>+ New Advance Item</strong> to schedule upcoming dues (e.g. Exam fee, PG rent, Recharge)!
        </div>
      `;
      return;
    }

    container.innerHTML = state.advanceExpenses.map((adv) => {
      const cat = getCategoryInfo(adv.category);
      return `
        <div class="advance-item" data-adv-id="${adv.id}">
          <div class="advance-left">
            <div class="advance-checkbox-wrapper" title="Tick when this expense occurs to add to debits!">
              <input type="checkbox" class="advance-checkbox btn-tick-advance" data-adv-id="${adv.id}">
            </div>
            <div class="advance-details">
              <span class="advance-title">${cat.icon} ${escapeHtml(adv.title)}</span>
              <div class="advance-meta">
                <span>🗓️ Due: <strong>${formatDateHuman(adv.date)}</strong></span>
                <span>• ${escapeHtml(adv.category)}</span>
                ${adv.notes ? `<span>• 💬 ${escapeHtml(adv.notes)}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="advance-right">
            <span class="advance-amount">${formatCurrency(adv.amount)}</span>
            <button class="btn-icon-action btn-delete-advance" data-adv-id="${adv.id}" title="Remove planned item">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-tick-advance').forEach((chk) => {
      chk.onchange = () => {
        if (chk.checked) {
          handleTickAdvanceExpense(chk.dataset.advId);
        }
      };
    });

    container.querySelectorAll('.btn-delete-advance').forEach((btn) => {
      btn.onclick = () => deleteAdvanceExpense(btn.dataset.advId);
    });
  }

  // =========================================================================
  // FAST CALCULATIONS & DOM RENDERING
  // =========================================================================

  function getAvailableMonths() {
    const monthSet = new Set();
    monthSet.add(getCurrentYearMonth());
    for (let i = 0; i < state.transactions.length; i++) {
      const d = state.transactions[i].date;
      if (d) monthSet.add(d.substring(0, 7));
    }
    return Array.from(monthSet).sort().reverse();
  }

  function populateMonthDropdown() {
    const dropdown = document.getElementById('month-selector-dropdown');
    if (!dropdown) return;
    const months = getAvailableMonths();
    let optionsHtml = `<option value="all" ${state.selectedMonth === 'all' ? 'selected' : ''}>📊 All Months (Grouped View)</option>`;
    for (let i = 0; i < months.length; i++) {
      const ym = months[i];
      optionsHtml += `<option value="${ym}" ${state.selectedMonth === ym ? 'selected' : ''}>📅 ${getMonthYearLabel(ym)}</option>`;
    }
    dropdown.innerHTML = optionsHtml;
  }

  function changeMonth(delta) {
    const months = getAvailableMonths();
    if (state.selectedMonth === 'all') {
      state.selectedMonth = months[0] || getCurrentYearMonth();
    } else {
      const currentIndex = months.indexOf(state.selectedMonth);
      if (currentIndex === -1) {
        state.selectedMonth = months[0];
      } else {
        const targetIndex = currentIndex - delta;
        if (targetIndex >= 0 && targetIndex < months.length) {
          state.selectedMonth = months[targetIndex];
        } else {
          const [y, m] = state.selectedMonth.split('-').map(Number);
          const targetDate = new Date(y, m - 1 + delta, 1);
          state.selectedMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        }
      }
    }
    populateMonthDropdown();
    updateAppView();
  }

  function computeStudentMetrics() {
    const all = state.transactions;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const todayStr = now.toISOString().split('T')[0];

    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const remainingDays = Math.max(1, totalDaysInMonth - currentDay + 1);

    let totalExpense = 0;
    let thisMonthExpense = 0;
    let todayExpense = 0;
    const categoryTotals = {};

    for (let i = 0; i < all.length; i++) {
      const tx = all[i];
      const amt = Number(tx.amount) || 0;
      totalExpense += amt;

      if (tx.date) {
        if (tx.date.startsWith(getCurrentYearMonth())) {
          thisMonthExpense += amt;
        }
        if (tx.date === todayStr) {
          todayExpense += amt;
        }
      }
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
    }

    const monthlyAllowance = Number(state.settings.monthlyAllowance) || 0;
    const pocketRemaining = Math.max(0, monthlyAllowance - thisMonthExpense);
    const allowanceSpentPercent = monthlyAllowance > 0 ? (thisMonthExpense / monthlyAllowance) * 100 : 0;
    const dailySafeLimit = monthlyAllowance > 0 ? pocketRemaining / remainingDays : 0;
    const dailyAverage = thisMonthExpense / Math.max(1, currentDay);

    return {
      totalExpense,
      thisMonthExpense,
      todayExpense,
      monthlyAllowance,
      pocketRemaining,
      allowanceSpentPercent,
      remainingDays,
      dailySafeLimit,
      dailyAverage,
      categoryTotals,
      totalCount: all.length
    };
  }

  function computeActiveMonthMetrics() {
    const list = state.transactions;
    let expense = 0;
    let count = 0;

    for (let i = 0; i < list.length; i++) {
      const tx = list[i];
      if (state.selectedMonth === 'all' || (tx.date && tx.date.startsWith(state.selectedMonth))) {
        expense += Number(tx.amount) || 0;
        count++;
      }
    }

    const budget = Number(state.settings.monthlyAllowance) || 0;
    const remaining = Math.max(0, budget - expense);
    return { expense, budget, remaining, count };
  }

  function renderMetrics() {
    const m = computeStudentMetrics();

    // 1. Pocket Money
    const valPocket = document.getElementById('val-pocket-remaining');
    const allowanceBar = document.getElementById('allowance-progress-bar');
    const badgeAllowanceSpent = document.getElementById('badge-allowance-spent');
    const labelAllowanceTotal = document.getElementById('label-allowance-total');

    if (valPocket) {
      valPocket.textContent = formatCurrency(m.pocketRemaining);
      valPocket.style.color = m.pocketRemaining > 0 ? 'var(--success)' : (m.monthlyAllowance > 0 ? 'var(--danger)' : 'var(--text-secondary)');
    }

    if (allowanceBar) {
      if (m.monthlyAllowance > 0) {
        const displayWidth = Math.min(100, m.allowanceSpentPercent);
        allowanceBar.style.width = `${displayWidth}%`;
        allowanceBar.className = m.allowanceSpentPercent < 70 ? 'progress-bar success' : (m.allowanceSpentPercent <= 95 ? 'progress-bar warning' : 'progress-bar danger');
      } else {
        allowanceBar.style.width = '0%';
      }
    }

    if (badgeAllowanceSpent) {
      if (m.monthlyAllowance > 0) {
        badgeAllowanceSpent.textContent = `${Math.round(m.allowanceSpentPercent)}% Spent`;
        badgeAllowanceSpent.className = m.allowanceSpentPercent < 70 ? 'badge badge-success' : (m.allowanceSpentPercent <= 95 ? 'badge badge-warning' : 'badge badge-danger');
      } else {
        badgeAllowanceSpent.textContent = 'Set Allowance (✏️)';
        badgeAllowanceSpent.className = 'badge badge-neutral';
      }
    }

    if (labelAllowanceTotal) {
      labelAllowanceTotal.textContent = `Allowance: ${formatCurrency(m.monthlyAllowance)}`;
    }

    // 2. Total Expenses
    const valTotalExp = document.getElementById('val-total-expense');
    const badgeExpCount = document.getElementById('badge-expense-count');
    const labelThisMonthExp = document.getElementById('label-expense-this-month');

    if (valTotalExp) valTotalExp.textContent = formatCurrency(m.totalExpense);
    if (badgeExpCount) badgeExpCount.textContent = `${m.totalCount} Logged`;
    if (labelThisMonthExp) labelThisMonthExp.textContent = `This month: ${formatCurrency(m.thisMonthExpense)}`;

    // 3. Daily Safe Spend
    const valSafeLimit = document.getElementById('val-daily-safe-limit');
    const badgeDays = document.getElementById('badge-days-remaining');

    if (valSafeLimit) valSafeLimit.textContent = `${formatCurrency(m.dailySafeLimit)} / day`;
    if (badgeDays) badgeDays.textContent = `${m.remainingDays} Days Left in Month`;

    // 4. Daily Average
    const valDailyAvg = document.getElementById('val-daily-avg');
    const badgeBurn = document.getElementById('badge-burn-status');
    const labelTodaySpent = document.getElementById('label-today-spent');

    if (valDailyAvg) valDailyAvg.textContent = `${formatCurrency(m.dailyAverage)} / day`;
    if (labelTodaySpent) labelTodaySpent.textContent = `Today: ${formatCurrency(m.todayExpense)}`;

    if (badgeBurn) {
      if (m.totalExpense === 0) {
        badgeBurn.className = 'badge badge-neutral';
        badgeBurn.textContent = '● Fresh start (0 spend)';
      } else if (m.monthlyAllowance > 0 && m.dailyAverage > m.dailySafeLimit) {
        badgeBurn.className = 'badge badge-danger';
        badgeBurn.textContent = '● High Burn Rate';
      } else {
        badgeBurn.className = 'badge badge-success';
        badgeBurn.textContent = '● Safe Pace';
      }
    }

    // Active Month Summary
    const monthM = computeActiveMonthMetrics();
    const expenseEl = document.getElementById('month-summary-expense');
    const budgetEl = document.getElementById('month-summary-budget');
    const remainingEl = document.getElementById('month-summary-remaining');
    const countEl = document.getElementById('month-summary-count');

    if (expenseEl) expenseEl.textContent = formatCurrency(monthM.expense);
    if (budgetEl) budgetEl.textContent = formatCurrency(monthM.budget);
    if (remainingEl) {
      remainingEl.textContent = formatCurrency(monthM.remaining);
      remainingEl.style.color = monthM.remaining > 0 ? 'var(--success)' : 'var(--danger)';
    }
    if (countEl) {
      const label = state.selectedMonth === 'all' ? 'All Months' : getMonthYearLabel(state.selectedMonth);
      countEl.textContent = `${monthM.count} records (${label})`;
    }
  }

  // =========================================================================
  // TRANSACTIONS LIST RENDERING
  // =========================================================================

  function getFilteredTransactions() {
    let list = state.transactions;
    const { search, category, sortBy } = state.filters;

    if (state.selectedMonth !== 'all') {
      list = list.filter((tx) => tx.date && tx.date.startsWith(state.selectedMonth));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((tx) => (
        (tx.title && tx.title.toLowerCase().includes(q)) ||
        (tx.category && tx.category.toLowerCase().includes(q)) ||
        (tx.notes && tx.notes.toLowerCase().includes(q))
      ));
    }

    if (category !== 'all') {
      list = list.filter((tx) => tx.category === category);
    }

    list.sort((a, b) => {
      if (sortBy === 'date-desc') return (b.date + (b.time || '')).localeCompare(a.date + (a.time || ''));
      if (sortBy === 'date-asc') return (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''));
      if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
      if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
      return 0;
    });

    return list;
  }

  function renderTransactionCardHtml(tx) {
    const cat = getCategoryInfo(tx.category);
    return `
      <div class="transaction-card" data-id="${tx.id}">
        <div class="tx-icon-wrapper" style="border-color:${cat.color}40; background:${cat.color}15; color:${cat.color};">
          ${cat.icon}
        </div>
        <div class="tx-details">
          <div class="tx-title-row">
            <span class="tx-title">${escapeHtml(tx.title)}</span>
            <span class="tx-category-badge" style="border-color:${cat.color}40; background:${cat.color}15; color:${cat.color}">
              ${escapeHtml(tx.category)}
            </span>
          </div>
          <div class="tx-meta-row">
            <span>📅 ${formatDateHuman(tx.date)} ${tx.time ? '• ' + tx.time : ''}</span>
            ${tx.paymentMethod ? `<span class="tx-payment-method">💳 ${escapeHtml(tx.paymentMethod)}</span>` : ''}
            ${tx.notes ? `<span class="tx-note">💬 ${escapeHtml(tx.notes)}</span>` : ''}
          </div>
        </div>
        <div class="tx-amount-col">
          <span class="tx-amount">-${formatCurrency(tx.amount)}</span>
          <span class="tx-type-label">Expense</span>
        </div>
        <div class="tx-actions">
          <button class="btn-icon-action btn-edit-tx" data-id="${tx.id}" title="Edit Expense">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
          <button class="btn-icon-action delete btn-delete-tx" data-id="${tx.id}" title="Delete Expense">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
  }

  function renderTransactionsList() {
    const container = document.getElementById('transactions-list-container');
    const emptyState = document.getElementById('empty-state-container');
    const counterLabel = document.getElementById('transactions-counter-label');
    if (!container) return;

    const filtered = getFilteredTransactions();

    if (counterLabel) {
      const monthLabel = state.selectedMonth === 'all' ? 'All Months' : getMonthYearLabel(state.selectedMonth);
      counterLabel.textContent = `Showing ${filtered.length} expenses for ${monthLabel}`;
    }

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (state.selectedMonth === 'all') {
      const grouped = {};
      for (let i = 0; i < filtered.length; i++) {
        const tx = filtered[i];
        const ym = tx.date ? tx.date.substring(0, 7) : 'Unknown';
        if (!grouped[ym]) grouped[ym] = [];
        grouped[ym].push(tx);
      }

      let fullHtml = '';
      const sortedKeys = Object.keys(grouped).sort().reverse();
      for (let k = 0; k < sortedKeys.length; k++) {
        const ym = sortedKeys[k];
        const groupList = grouped[ym];
        let gExpense = 0;
        for (let j = 0; j < groupList.length; j++) gExpense += Number(groupList[j].amount);

        fullHtml += `
          <div class="month-group-container">
            <div class="month-group-header">
              <span>📅 ${getMonthYearLabel(ym)} (${groupList.length} expenses)</span>
              <span style="color:var(--danger); font-weight:800;">Total: -${formatCurrency(gExpense)}</span>
            </div>
            ${groupList.map(renderTransactionCardHtml).join('')}
          </div>
        `;
      }
      container.innerHTML = fullHtml;
    } else {
      container.innerHTML = filtered.map(renderTransactionCardHtml).join('');
    }

    container.querySelectorAll('.btn-edit-tx').forEach((b) => {
      b.onclick = () => openTransactionModal(b.dataset.id);
    });
    container.querySelectorAll('.btn-delete-tx').forEach((b) => {
      b.onclick = () => deleteTransaction(b.dataset.id);
    });
  }

  // =========================================================================
  // INSIGHTS & WISHLIST
  // =========================================================================

  function renderInsights() {
    const container = document.getElementById('insights-list-container');
    const badgeHealth = document.getElementById('badge-health-score');
    if (!container) return;

    const m = computeStudentMetrics();
    const insights = [];

    if (m.totalExpense === 0) {
      insights.push({ type: 'positive', icon: '🌱', text: `Fresh student tracker initialized! Set your pocket money with the ✏️ button and log your expenses.` });
    } else {
      if (m.monthlyAllowance > 0) {
        if (m.allowanceSpentPercent < 75) {
          insights.push({ type: 'positive', icon: '🎯', text: `Awesome discipline! You spent only ${Math.round(m.allowanceSpentPercent)}% of your pocket money. Safe limit: <strong>${formatCurrency(m.dailySafeLimit)}/day</strong>.` });
        } else if (m.allowanceSpentPercent <= 100) {
          insights.push({ type: 'warning', icon: '⚠️', text: `Pocket money running tight! ${formatCurrency(m.pocketRemaining)} remaining for the next ${m.remainingDays} days.` });
        } else {
          insights.push({ type: 'alert', icon: '🚨', text: `Allowance exceeded by ${formatCurrency(m.thisMonthExpense - m.monthlyAllowance)}! Cut back on non-essential hangouts.` });
        }
      }

      const entries = Object.entries(m.categoryTotals);
      if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        const [topCat, topAmt] = entries[0];
        const catPercent = Math.round((topAmt / (m.totalExpense || 1)) * 100);
        insights.push({ type: 'warning', icon: '🍔', text: `Top Hotspot: <strong>${escapeHtml(topCat)}</strong> took ${catPercent}% (${formatCurrency(topAmt)}) of your pocket money.` });
      }
    }

    if (badgeHealth) {
      if (m.totalExpense === 0) {
        badgeHealth.className = 'badge badge-neutral';
        badgeHealth.textContent = 'Budget: Clean Slate';
      } else if (m.monthlyAllowance > 0 && m.allowanceSpentPercent <= 75) {
        badgeHealth.className = 'badge badge-success';
        badgeHealth.textContent = 'Budget: On Track';
      } else if (m.monthlyAllowance > 0 && m.allowanceSpentPercent <= 100) {
        badgeHealth.className = 'badge badge-warning';
        badgeHealth.textContent = 'Budget: Caution';
      } else {
        badgeHealth.className = 'badge badge-danger';
        badgeHealth.textContent = 'Budget: Critical';
      }
    }

    container.innerHTML = insights.map((ins) => `
      <div class="insight-item ${ins.type}">
        <span class="insight-icon">${ins.icon}</span>
        <div>${ins.text}</div>
      </div>
    `).join('');
  }

  function renderGoals() {
    const container = document.getElementById('goals-list-container');
    if (!container) return;

    if (state.goals.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:1.25rem; color:var(--text-muted); font-size:0.86rem;">No items in your student wishlist yet. Click <strong>+ Add Item</strong> to plan a purchase!</div>`;
      return;
    }

    container.innerHTML = state.goals.map((g) => {
      const percent = Math.min(100, Math.round((g.current / (g.target || 1)) * 100));
      return `
        <div class="goal-item" data-goal-id="${g.id}">
          <div class="goal-header">
            <span class="goal-name">${escapeHtml(g.name)}</span>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="goal-amounts"><strong>${formatCurrency(g.current)}</strong> / ${formatCurrency(g.target)}</span>
              <button class="btn-icon-action btn-delete-goal" data-goal-id="${g.id}" title="Remove Item">✕</button>
            </div>
          </div>
          <div class="progress-container" style="height: 6px;">
            <div class="progress-bar ${percent >= 100 ? 'success' : 'primary'}" style="width: ${percent}%;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.76rem; color:var(--text-secondary);">
            <span>${percent}% saved towards item</span>
            <button class="chip-btn btn-add-funds" data-goal-id="${g.id}">+ Add Saved Money</button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-delete-goal').forEach((b) => {
      b.onclick = () => {
        state.goals = state.goals.filter((g) => g.id !== b.dataset.goalId);
        saveGoalsToStorage();
        renderGoals();
        showToast('Wishlist item removed', 'info');
      };
    });

    container.querySelectorAll('.btn-add-funds').forEach((b) => {
      b.onclick = () => {
        const goal = state.goals.find((g) => g.id === b.dataset.goalId);
        if (!goal) return;
        const addStr = prompt(`Enter money saved for "${goal.name}":`, '500');
        if (addStr && !isNaN(addStr) && Number(addStr) > 0) {
          goal.current += Number(addStr);
          saveGoalsToStorage();
          renderGoals();
          showToast(`Saved ${formatCurrency(addStr)} for ${goal.name}!`, 'success');
        }
      };
    });
  }

  // =========================================================================
  // LIGHTWEIGHT CANVAS CHARTS
  // =========================================================================

  function renderCashflowChart() {
    const canvas = document.getElementById('cashflow-canvas');
    const emptyMsg = document.getElementById('cashflow-empty-msg');
    if (!canvas) return;

    if (state.transactions.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'flex';
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const now = new Date();
    const buckets = [];

    if (state.trendView === 'daily') {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        buckets.push({ dateKey, label: `${d.getDate()}`, expense: 0 });
      }
      for (let i = 0; i < state.transactions.length; i++) {
        const tx = state.transactions[i];
        const b = buckets.find((bk) => bk.dateKey === tx.date);
        if (b) b.expense += Number(tx.amount);
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()].substring(0, 3), expense: 0 });
      }
      for (let i = 0; i < state.transactions.length; i++) {
        const tx = state.transactions[i];
        if (tx.date) {
          const [y, m] = tx.date.split('-').map(Number);
          const b = buckets.find((bk) => bk.year === y && bk.month === m - 1);
          if (b) b.expense += Number(tx.amount);
        }
      }
    }

    let maxVal = 100;
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].expense > maxVal) maxVal = buckets[i].expense;
    }

    const padding = { top: 20, right: 15, bottom: 25, left: 45 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    ctx.strokeStyle = state.settings.theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.fillStyle = state.settings.theme === 'dark' ? '#64748B' : '#94A3B8';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 3; i++) {
      const yVal = (maxVal / 3) * i;
      const yPos = padding.top + chartHeight - (chartHeight / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(rect.width - padding.right, yPos);
      ctx.stroke();
      ctx.fillText(`${state.settings.currencySymbol}${yVal >= 1000 ? (yVal/1000).toFixed(0)+'k' : Math.round(yVal)}`, padding.left - 6, yPos + 3);
    }

    const groupWidth = chartWidth / buckets.length;
    const barWidth = Math.min(22, groupWidth * 0.45);

    ctx.fillStyle = '#F43F5E';
    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i];
      const groupCenterX = padding.left + i * groupWidth + groupWidth / 2;
      const barX = groupCenterX - barWidth / 2;
      const barH = (b.expense / maxVal) * chartHeight;
      const barY = padding.top + chartHeight - barH;

      if (barH > 0) ctx.fillRect(barX, barY, barWidth, barH);

      ctx.fillStyle = state.settings.theme === 'dark' ? '#94A3B8' : '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, groupCenterX, rect.height - 8);
      ctx.fillStyle = '#F43F5E';
    }
  }

  function renderCategoryDonutChart() {
    const canvas = document.getElementById('category-donut-canvas');
    const emptyMsg = document.getElementById('category-empty-msg');
    const listContainer = document.getElementById('category-breakdown-list');
    if (!canvas) return;

    const m = computeStudentMetrics();
    const entries = Object.entries(m.categoryTotals);

    if (entries.length === 0 || m.totalExpense === 0) {
      if (emptyMsg) emptyMsg.style.display = 'flex';
      if (listContainer) listContainer.innerHTML = '';
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    entries.sort((a, b) => b[1] - a[1]);

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 8;
    const innerRadius = outerRadius * 0.65;

    let startAngle = -Math.PI / 2;

    for (let i = 0; i < entries.length; i++) {
      const [catName, amt] = entries[i];
      const sliceAngle = (amt / m.totalExpense) * (Math.PI * 2);
      const catInfo = getCategoryInfo(catName);

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = catInfo.color;
      ctx.fill();

      startAngle += sliceAngle;
    }

    ctx.fillStyle = state.settings.theme === 'dark' ? '#94A3B8' : '#64748B';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Total Expenses', centerX, centerY - 6);

    ctx.fillStyle = state.settings.theme === 'dark' ? '#F8FAFC' : '#0F172A';
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.fillText(formatCurrency(m.totalExpense), centerX, centerY + 12);

    if (listContainer) {
      listContainer.innerHTML = entries.map(([catName, amt]) => {
        const catInfo = getCategoryInfo(catName);
        const percent = Math.round((amt / m.totalExpense) * 100);
        return `
          <div class="category-item">
            <div class="category-info">
              <span class="category-color-dot" style="background:${catInfo.color}"></span>
              <span>${catInfo.icon} ${escapeHtml(catName)}</span>
            </div>
            <div class="category-amount-group">
              <span class="category-amount">-${formatCurrency(amt)}</span>
              <span class="category-percentage">${percent}%</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function renderAllCharts() {
    requestAnimationFrame(() => {
      renderCashflowChart();
      renderCategoryDonutChart();
    });
  }

  // =========================================================================
  // TRANSACTION CRUD
  // =========================================================================

  function openTransactionModal(editId = null) {
    const modal = document.getElementById('modal-transaction');
    const form = document.getElementById('form-transaction');
    const modalTitle = document.getElementById('modal-tx-title');
    const symbolSpan = document.getElementById('tx-modal-curr-symbol');
    if (!modal || !form) return;

    if (symbolSpan) symbolSpan.textContent = state.settings.currencySymbol;

    if (editId) {
      const tx = state.transactions.find((t) => t.id === editId);
      if (!tx) return;
      modalTitle.textContent = 'Edit Expense';
      document.getElementById('tx-id').value = tx.id;
      document.getElementById('tx-amount').value = tx.amount;
      document.getElementById('tx-title-input').value = tx.title;
      document.getElementById('tx-date').value = tx.date;
      document.getElementById('tx-time').value = tx.time || '';
      document.getElementById('tx-payment-method').value = tx.paymentMethod || 'UPI (GPay / PhonePe / Paytm)';
      document.getElementById('tx-notes').value = tx.notes || '';
      populateCategoryDropdown(tx.category);
    } else {
      modalTitle.textContent = 'Log Student Expense';
      form.reset();
      document.getElementById('tx-id').value = '';
      populateCategoryDropdown();

      const today = new Date().toISOString().split('T')[0];
      if (state.selectedMonth && state.selectedMonth !== 'all') {
        const [sy, sm] = state.selectedMonth.split('-');
        if (state.selectedMonth === getCurrentYearMonth()) document.getElementById('tx-date').value = today;
        else document.getElementById('tx-date').value = `${sy}-${sm}-01`;
      } else {
        document.getElementById('tx-date').value = today;
      }

      const now = new Date();
      document.getElementById('tx-time').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    modal.classList.add('active');
    setTimeout(() => { document.getElementById('tx-amount')?.focus(); }, 50);
  }

  function closeTransactionModal() {
    document.getElementById('modal-transaction')?.classList.remove('active');
  }

  function populateCategoryDropdown(selectedCategory = '') {
    const select = document.getElementById('tx-category');
    if (!select) return;
    select.innerHTML = STUDENT_CATEGORIES.map(
      (c) => `<option value="${c.name}" ${selectedCategory === c.name ? 'selected' : ''}>${c.icon} ${c.name}</option>`
    ).join('');
  }

  function handleSaveTransaction(e) {
    e.preventDefault();
    const idInput = document.getElementById('tx-id').value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const title = document.getElementById('tx-title-input').value.trim();
    const category = document.getElementById('tx-category').value;
    const paymentMethod = document.getElementById('tx-payment-method').value;
    const date = document.getElementById('tx-date').value;
    const time = document.getElementById('tx-time').value;
    const notes = document.getElementById('tx-notes').value.trim();

    if (!amount || isNaN(amount) || amount <= 0 || !title || !date) {
      alert('Please fill out amount, title, and date.');
      return;
    }

    if (idInput) {
      const idx = state.transactions.findIndex((t) => t.id === idInput);
      if (idx !== -1) {
        state.transactions[idx] = { ...state.transactions[idx], type: 'debit', amount, title, category, paymentMethod, date, time, notes };
        showToast(`Updated "${title}"`, 'success');
      }
    } else {
      const newTx = {
        id: 'tx_' + Date.now(),
        type: 'debit',
        amount,
        title,
        category,
        paymentMethod,
        date,
        time,
        notes,
        createdAt: Date.now()
      };
      state.transactions.unshift(newTx);
      showToast(`Logged: -${formatCurrency(amount)} for "${title}"`, 'danger');

      const txMonth = date.substring(0, 7);
      if (state.selectedMonth !== 'all' && state.selectedMonth !== txMonth) {
        state.selectedMonth = txMonth;
      }
    }

    saveTransactionsToStorage();
    closeTransactionModal();
    populateMonthDropdown();
    updateAppView();
  }

  function deleteTransaction(id) {
    const tx = state.transactions.find((t) => t.id === id);
    if (!tx) return;
    state.transactions = state.transactions.filter((t) => t.id !== id);
    saveTransactionsToStorage();
    populateMonthDropdown();
    updateAppView();

    showToast(`Deleted "${tx.title}"`, 'danger', {
      text: 'Undo',
      callback: () => {
        state.transactions.push(tx);
        saveTransactionsToStorage();
        populateMonthDropdown();
        updateAppView();
        showToast(`Restored "${tx.title}"`, 'success');
      }
    });
  }

  // =========================================================================
  // ALLOWANCE & WISHLIST MODALS
  // =========================================================================

  function openAllowanceModal() {
    const modal = document.getElementById('modal-budget');
    const input = document.getElementById('budget-limit-input');
    const sym = document.getElementById('budget-curr-symbol');
    if (!modal) return;
    if (sym) sym.textContent = state.settings.currencySymbol;
    if (input) input.value = state.settings.monthlyAllowance || '';
    modal.classList.add('active');
    setTimeout(() => input?.focus(), 50);
  }

  function closeAllowanceModal() {
    document.getElementById('modal-budget')?.classList.remove('active');
  }

  function handleSaveAllowance(e) {
    e.preventDefault();
    const val = parseFloat(document.getElementById('budget-limit-input').value);
    if (!isNaN(val) && val >= 0) {
      state.settings.monthlyAllowance = val;
      saveSettingsToStorage();
      closeAllowanceModal();
      updateAppView();
      showToast(`Monthly pocket money set to ${formatCurrency(val)}`, 'success');
    }
  }

  function openGoalModal() {
    const modal = document.getElementById('modal-goal');
    const form = document.getElementById('form-goal');
    const sym1 = document.getElementById('goal-curr-symbol');
    const sym2 = document.getElementById('goal-curr-symbol-2');
    if (!modal || !form) return;
    form.reset();
    if (sym1) sym1.textContent = state.settings.currencySymbol;
    if (sym2) sym2.textContent = state.settings.currencySymbol;
    modal.classList.add('active');
    setTimeout(() => document.getElementById('goal-name-input')?.focus(), 50);
  }

  function closeGoalModal() {
    document.getElementById('modal-goal')?.classList.remove('active');
  }

  function handleSaveGoal(e) {
    e.preventDefault();
    const name = document.getElementById('goal-name-input').value.trim();
    const target = parseFloat(document.getElementById('goal-target-input').value);
    const current = parseFloat(document.getElementById('goal-current-input').value) || 0;

    if (!name || !target || target <= 0) return;

    state.goals.push({ id: 'goal_' + Date.now(), name, target, current });
    saveGoalsToStorage();
    closeGoalModal();
    renderGoals();
    showToast(`Added to wishlist: "${name}"`, 'success');
  }

  // =========================================================================
  // DATA BACKUP, EXPORT & IMPORT
  // =========================================================================

  function exportCSV() {
    if (state.transactions.length === 0) {
      alert('No expenses to export.');
      return;
    }
    const headers = ['ID', 'Type', 'Amount', 'Description', 'Category', 'Payment Method', 'Date', 'Time', 'Notes'];
    const rows = state.transactions.map((tx) => [
      `"${tx.id}"`, `"Expense"`, tx.amount, `"${(tx.title || '').replace(/"/g, '""')}"`,
      `"${(tx.category || '').replace(/"/g, '""')}"`, `"${(tx.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${tx.date}"`, `"${tx.time || ''}"`, `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Neeraj_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('Exported CSV successfully!', 'success');
  }

  function exportJSON() {
    const backupData = {
      app: 'Neeraj Expense Tracker - Student Edition',
      exportedAt: new Date().toISOString(),
      transactions: state.transactions,
      advanceExpenses: state.advanceExpenses,
      settings: state.settings,
      goals: state.goals
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `Neeraj_Expenses_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Exported JSON backup!', 'success');
  }

  function importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed.transactions)) state.transactions = parsed.transactions;
        if (Array.isArray(parsed.advanceExpenses)) state.advanceExpenses = parsed.advanceExpenses;
        if (parsed.settings) state.settings = { ...state.settings, ...parsed.settings };
        if (Array.isArray(parsed.goals)) state.goals = parsed.goals;

        saveTransactionsToStorage();
        saveAdvanceToStorage();
        saveSettingsToStorage();
        saveGoalsToStorage();
        applySettings();
        populateMonthDropdown();
        updateAppView();
        showToast('Backup restored successfully!', 'success');
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  }

  // =========================================================================
  // THEME & SETTINGS
  // =========================================================================

  function toggleTheme() {
    const next = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  function setTheme(themeName) {
    state.settings.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    saveSettingsToStorage();

    const moonIcon = document.getElementById('theme-moon-icon');
    const sunIcon = document.getElementById('theme-sun-icon');
    const themeText = document.getElementById('theme-text');

    if (themeName === 'light') {
      if (moonIcon) moonIcon.style.display = 'none';
      if (sunIcon) sunIcon.style.display = 'block';
      if (themeText) themeText.textContent = 'Light';
    } else {
      if (moonIcon) moonIcon.style.display = 'block';
      if (sunIcon) sunIcon.style.display = 'none';
      if (themeText) themeText.textContent = 'Dark';
    }

    renderAllCharts();
  }

  function applySettings() {
    setTheme(state.settings.theme || 'dark');
    const currSelect = document.getElementById('currency-select');
    if (currSelect) currSelect.value = state.settings.currency || 'INR';
  }

  function handleCurrencyChange(e) {
    const sel = e.target;
    state.settings.currency = sel.value;
    state.settings.currencySymbol = sel.options[sel.selectedIndex].getAttribute('data-symbol') || '₹';
    saveSettingsToStorage();
    updateAppView();
    showToast(`Currency: ${sel.value}`, 'info');
  }

  // =========================================================================
  // VIEW REFRESH & INIT
  // =========================================================================

  function populateFilterCategoryOptions() {
    const select = document.getElementById('category-filter');
    if (!select) return;
    select.innerHTML = `<option value="all">All Student Categories</option>` +
      STUDENT_CATEGORIES.map((c) => `<option value="${c.name}">${c.icon} ${c.name}</option>`).join('');
  }

  function updateAppView() {
    renderMetrics();
    renderAdvanceList();
    renderTransactionsList();
    renderInsights();
    renderGoals();
    renderAllCharts();
  }

  // =========================================================================
  // FAST DEBOUNCED EVENT BINDINGS
  // =========================================================================

  let searchTimeout = null;
  let resizeTimeout = null;

  function attachEventHandlers() {
    document.getElementById('currency-select')?.addEventListener('change', handleCurrencyChange);
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('btn-open-add-modal')?.addEventListener('click', () => openTransactionModal());
    document.getElementById('btn-add-tx-secondary')?.addEventListener('click', () => openTransactionModal());
    document.getElementById('btn-empty-add')?.addEventListener('click', () => openTransactionModal());
    document.getElementById('btn-edit-allowance')?.addEventListener('click', openAllowanceModal);
    document.getElementById('btn-add-goal')?.addEventListener('click', openGoalModal);

    // Advance Modal Openers
    document.getElementById('btn-open-advance-modal')?.addEventListener('click', () => openAdvanceModal());
    document.getElementById('btn-add-advance-direct')?.addEventListener('click', () => openAdvanceModal());

    // Month navigation
    document.getElementById('btn-prev-month')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('btn-next-month')?.addEventListener('click', () => changeMonth(1));

    document.getElementById('month-selector-dropdown')?.addEventListener('change', (e) => {
      state.selectedMonth = e.target.value;
      updateAppView();
    });

    document.getElementById('btn-current-month')?.addEventListener('click', () => {
      state.selectedMonth = getCurrentYearMonth();
      populateMonthDropdown();
      updateAppView();
      showToast(`Jumped to ${getMonthYearLabel(state.selectedMonth)}`, 'success');
    });

    document.getElementById('btn-all-months')?.addEventListener('click', () => {
      state.selectedMonth = 'all';
      populateMonthDropdown();
      updateAppView();
      showToast('Viewing All Months', 'info');
    });

    // Data Modal
    const dataModal = document.getElementById('modal-data');
    document.getElementById('btn-open-data-modal')?.addEventListener('click', () => dataModal?.classList.add('active'));
    document.getElementById('btn-close-data-modal')?.addEventListener('click', () => dataModal?.classList.remove('active'));
    document.getElementById('btn-done-data-modal')?.addEventListener('click', () => dataModal?.classList.remove('active'));

    document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);
    document.getElementById('btn-export-json')?.addEventListener('click', exportJSON);
    document.getElementById('import-json-file')?.addEventListener('change', (e) => importJSON(e.target.files[0]));

    document.getElementById('btn-clear-all-data')?.addEventListener('click', () => {
      if (confirm('Reset everything to 0 for a clean fresh start?')) {
        state.transactions = [];
        state.advanceExpenses = [];
        state.goals = [];
        state.settings.monthlyAllowance = 0;
        saveTransactionsToStorage();
        saveAdvanceToStorage();
        saveGoalsToStorage();
        saveSettingsToStorage();
        populateMonthDropdown();
        updateAppView();
        showToast('All data reset to 0.', 'success');
      }
    });

    // Preset chips in Expense modal
    document.querySelectorAll('.chip-btn[data-preset]').forEach((btn) => {
      btn.onclick = () => {
        const val = parseFloat(btn.dataset.preset);
        const amountInput = document.getElementById('tx-amount');
        amountInput.value = (parseFloat(amountInput.value) || 0) + val;
      };
    });

    // Preset chips in Advance modal
    document.querySelectorAll('.chip-btn[data-preset-adv]').forEach((btn) => {
      btn.onclick = () => {
        const val = parseFloat(btn.dataset.presetAdv);
        const amountInput = document.getElementById('advance-amount');
        amountInput.value = (parseFloat(amountInput.value) || 0) + val;
      };
    });

    // Tag chips
    document.querySelectorAll('.tag-btn[data-tag]').forEach((btn) => {
      btn.onclick = () => {
        const tag = btn.dataset.tag;
        const notesInput = document.getElementById('tx-notes');
        if (notesInput.value) {
          if (!notesInput.value.includes(tag)) notesInput.value += ' ' + tag;
        } else {
          notesInput.value = tag;
        }
      };
    });

    // Modals Close & Form submits
    document.getElementById('btn-close-tx-modal')?.addEventListener('click', closeTransactionModal);
    document.getElementById('btn-cancel-tx-modal')?.addEventListener('click', closeTransactionModal);
    document.getElementById('form-transaction')?.addEventListener('submit', handleSaveTransaction);

    document.getElementById('btn-close-advance-modal')?.addEventListener('click', closeAdvanceModal);
    document.getElementById('btn-cancel-advance-modal')?.addEventListener('click', closeAdvanceModal);
    document.getElementById('form-advance')?.addEventListener('submit', handleSaveAdvance);

    document.getElementById('btn-close-budget-modal')?.addEventListener('click', closeAllowanceModal);
    document.getElementById('btn-cancel-budget-modal')?.addEventListener('click', closeAllowanceModal);
    document.getElementById('form-budget')?.addEventListener('submit', handleSaveAllowance);

    document.getElementById('btn-close-goal-modal')?.addEventListener('click', closeGoalModal);
    document.getElementById('btn-cancel-goal-modal')?.addEventListener('click', closeGoalModal);
    document.getElementById('form-goal')?.addEventListener('submit', handleSaveGoal);

    // Debounced Search Input (100ms)
    document.getElementById('search-input')?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.filters.search = e.target.value;
        renderTransactionsList();
      }, 100);
    });

    document.getElementById('category-filter')?.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      renderTransactionsList();
    });

    document.getElementById('sort-filter')?.addEventListener('change', (e) => {
      state.filters.sortBy = e.target.value;
      renderTransactionsList();
    });

    document.querySelectorAll('#chart-timeframe-selector .segment-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#chart-timeframe-selector .segment-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.trendView = btn.dataset.range;
        renderCashflowChart();
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) backdrop.classList.remove('active');
      };
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach((m) => m.classList.remove('active'));
      }
    });

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => { renderAllCharts(); }, 120);
    }, { passive: true });
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  function init() {
    loadStateFromStorage();
    applySettings();
    populateFilterCategoryOptions();
    populateMonthDropdown();
    attachEventHandlers();
    updateAppView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

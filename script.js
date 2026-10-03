/* =========================================================
   EXPENSEFLOW — TASK 41
   Interactive Expense Tracker
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "expenseflow_expenses";

let expenses = loadExpenses();

let editingId = null;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const expenseForm = document.getElementById("expenseForm");

const expenseIdInput = document.getElementById("expenseId");

const titleInput = document.getElementById("title");

const amountInput = document.getElementById("amount");

const categoryInput = document.getElementById("category");

const dateInput = document.getElementById("date");

const submitBtn = document.getElementById("submitBtn");

const submitBtnText =
    document.getElementById("submitBtnText");

const formTitle =
    document.getElementById("formTitle");

const resetFormBtn =
    document.getElementById("resetFormBtn");

const formMessage =
    document.getElementById("formMessage");

const searchInput =
    document.getElementById("searchInput");

const filterCategory =
    document.getElementById("filterCategory");

const filterDate =
    document.getElementById("filterDate");

const sortExpenses =
    document.getElementById("sortExpenses");

const expenseList =
    document.getElementById("expenseList");

const emptyState =
    document.getElementById("emptyState");

const totalAmount =
    document.getElementById("totalAmount");

const expenseCount =
    document.getElementById("expenseCount");

const visibleCount =
    document.getElementById("visibleCount");

const categoryCount =
    document.getElementById("categoryCount");

const categorySummary =
    document.getElementById("categorySummary");


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setTodayDate();

    renderApp();

});


/* =========================================================
   DATE
   ========================================================= */

function setTodayDate() {

    if (!dateInput.value) {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        dateInput.value = today;
    }
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadExpenses() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Unable to load expenses:",
            error
        );

        return [];
    }
}


function saveExpenses() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(expenses)
        );

        return true;

    } catch (error) {

        console.error(
            "Unable to save expenses:",
            error
        );

        showMessage(
            "Unable to save data in browser storage.",
            "error"
        );

        return false;
    }
}


/* =========================================================
   FORM SUBMISSION
   ========================================================= */

expenseForm.addEventListener(
    "submit",
    handleFormSubmit
);


function handleFormSubmit(event) {

    event.preventDefault();

    clearMessage();


    const title =
        titleInput.value.trim();

    const amount =
        Number(amountInput.value);

    const category =
        categoryInput.value;

    const date =
        dateInput.value;


    /* Validation */

    if (!title) {

        showMessage(
            "Please enter an expense title.",
            "error"
        );

        titleInput.focus();

        return;
    }


    if (!Number.isFinite(amount) || amount <= 0) {

        showMessage(
            "Please enter a valid amount.",
            "error"
        );

        amountInput.focus();

        return;
    }


    if (!category) {

        showMessage(
            "Please select a category.",
            "error"
        );

        categoryInput.focus();

        return;
    }


    if (!date) {

        showMessage(
            "Please select a date.",
            "error"
        );

        dateInput.focus();

        return;
    }


    /* Edit existing expense */

    if (editingId) {

        const index =
            expenses.findIndex(
                expense =>
                    expense.id === editingId
            );


        if (index !== -1) {

            expenses[index] = {

                ...expenses[index],

                title,

                amount,

                category,

                date,

                updatedAt:
                    new Date().toISOString()

            };

            saveExpenses();

            showMessage(
                "Expense updated successfully.",
                "success"
            );
        }


    } else {

        /* Add new expense */

        const newExpense = {

            id:
                generateId(),

            title,

            amount,

            category,

            date,

            createdAt:
                new Date().toISOString()

        };


        expenses.push(newExpense);

        saveExpenses();

        showMessage(
            "Expense added successfully.",
            "success"
        );
    }


    resetForm(false);

    renderApp();

}


/* =========================================================
   GENERATE UNIQUE ID
   ========================================================= */

function generateId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );
}


/* =========================================================
   RENDER APP
   ========================================================= */

function renderApp() {

    const filteredExpenses =
        getFilteredExpenses();


    renderExpenses(
        filteredExpenses
    );


    updateStatistics(
        filteredExpenses
    );


    renderCategorySummary(
        filteredExpenses
    );
}


/* =========================================================
   FILTER + SEARCH
   ========================================================= */

function getFilteredExpenses() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const category =
        filterCategory.value;

    const date =
        filterDate.value;

    let filtered =
        expenses.filter(expense => {

            const matchesSearch =
                !search ||
                expense.title
                    .toLowerCase()
                    .includes(search) ||
                expense.category
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === "All" ||
                expense.category === category;


            const matchesDate =
                !date ||
                expense.date === date;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesDate
            );
        });


    filtered =
        sortExpenseList(filtered);


    return filtered;
}


/* =========================================================
   SORTING
   ========================================================= */

function sortExpenseList(list) {

    const sorted =
        [...list];


    switch (sortExpenses.value) {

        case "oldest":

            sorted.sort(
                (a, b) =>
                    dateToNumber(a.date) -
                    dateToNumber(b.date)
            );

            break;


        case "high":

            sorted.sort(
                (a, b) =>
                    Number(b.amount) -
                    Number(a.amount)
            );

            break;


        case "low":

            sorted.sort(
                (a, b) =>
                    Number(a.amount) -
                    Number(b.amount)
            );

            break;


        case "az":

            sorted.sort(
                (a, b) =>
                    a.title
                        .localeCompare(
                            b.title
                        )
            );

            break;


        case "newest":

        default:

            sorted.sort(
                (a, b) =>
                    dateToNumber(b.date) -
                    dateToNumber(a.date)
            );

            break;
    }


    return sorted;
}


/* =========================================================
   DATE CONVERSION
   ========================================================= */

function dateToNumber(date) {

    if (!date) {
        return 0;
    }

    return Number(
        date.replaceAll("-", "")
    );
}


/* =========================================================
   RENDER EXPENSES
   ========================================================= */

function renderExpenses(list) {

    expenseList.innerHTML = "";


    if (list.length === 0) {

        emptyState.hidden = false;

        return;
    }


    emptyState.hidden = true;


    list.forEach(expense => {

        const item =
            document.createElement("div");

        item.className =
            "expense-item";


        /* Left content */

        const info =
            document.createElement("div");

        info.className =
            "expense-info";


        const title =
            document.createElement("div");

        title.className =
            "expense-title";

        title.textContent =
            expense.title;


        const meta =
            document.createElement("div");

        meta.className =
            "expense-meta";


        const categoryTag =
            document.createElement("span");

        categoryTag.className =
            "category-tag";

        categoryTag.textContent =
            expense.category;


        const dateText =
            document.createElement("span");

        dateText.textContent =
            formatDate(expense.date);


        meta.appendChild(
            categoryTag
        );

        meta.appendChild(
            dateText
        );


        info.appendChild(
            title
        );

        info.appendChild(
            meta
        );


        /* Right content */

        const right =
            document.createElement("div");

        right.className =
            "expense-right";


        const amount =
            document.createElement("span");

        amount.className =
            "expense-amount";

        amount.textContent =
            formatCurrency(
                expense.amount
            );


        /* Edit button */

        const editButton =
            document.createElement("button");

        editButton.type =
            "button";

        editButton.className =
            "action-btn edit-btn";

        editButton.textContent =
            "✎";

        editButton.title =
            "Edit expense";

        editButton.setAttribute(
            "aria-label",
            `Edit ${expense.title}`
        );


        editButton.addEventListener(
            "click",
            () => editExpense(expense.id)
        );


        /* Delete button */

        const deleteButton =
            document.createElement("button");

        deleteButton.type =
            "button";

        deleteButton.className =
            "action-btn delete-btn";

        deleteButton.textContent =
            "×";

        deleteButton.title =
            "Delete expense";

        deleteButton.setAttribute(
            "aria-label",
            `Delete ${expense.title}`
        );


        deleteButton.addEventListener(
            "click",
            () => deleteExpense(expense.id)
        );


        right.appendChild(
            amount
        );

        right.appendChild(
            editButton
        );

        right.appendChild(
            deleteButton
        );


        item.appendChild(
            info
        );

        item.appendChild(
            right
        );


        expenseList.appendChild(
            item
        );
    });
}


/* =========================================================
   EDIT EXPENSE
   ========================================================= */

function editExpense(id) {

    const expense =
        expenses.find(
            item => item.id === id
        );


    if (!expense) {
        return;
    }


    editingId =
        expense.id;


    expenseIdInput.value =
        expense.id;


    titleInput.value =
        expense.title;


    amountInput.value =
        expense.amount;


    categoryInput.value =
        expense.category;


    dateInput.value =
        expense.date;


    formTitle.textContent =
        "Edit Expense";


    submitBtnText.textContent =
        "Update Expense";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    titleInput.focus();


    showMessage(
        "Editing selected expense.",
        "success"
    );
}


/* =========================================================
   DELETE EXPENSE
   ========================================================= */

function deleteExpense(id) {

    const expense =
        expenses.find(
            item => item.id === id
        );


    if (!expense) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${expense.title}"?`
        );


    if (!confirmed) {
        return;
    }


    expenses =
        expenses.filter(
            item => item.id !== id
        );


    saveExpenses();


    if (editingId === id) {
        resetForm(false);
    }


    renderApp();


    showMessage(
        "Expense deleted successfully.",
        "success"
    );
}


/* =========================================================
   RESET FORM
   ========================================================= */

resetFormBtn.addEventListener(
    "click",
    () => resetForm(true)
);


function resetForm(showStatus = true) {

    expenseForm.reset();


    editingId = null;


    expenseIdInput.value = "";


    formTitle.textContent =
        "Add New Expense";


    submitBtnText.textContent =
        "Add Expense";


    setTodayDate();


    if (showStatus) {

        showMessage(
            "Form reset.",
            "success"
        );
    }
}


/* =========================================================
   SEARCH / FILTER EVENTS
   ========================================================= */

searchInput.addEventListener(
    "input",
    renderApp
);


filterCategory.addEventListener(
    "change",
    renderApp
);


filterDate.addEventListener(
    "change",
    renderApp
);


sortExpenses.addEventListener(
    "change",
    renderApp
);


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics(list) {

    const visibleTotal =
        list.reduce(
            (sum, expense) =>
                sum +
                Number(expense.amount),
            0
        );


    const allTotal =
        expenses.reduce(
            (sum, expense) =>
                sum +
                Number(expense.amount),
            0
        );


    totalAmount.textContent =
        formatCurrency(
            visibleTotal
        );


    expenseCount.textContent =
        `${expenses.length} ${
            expenses.length === 1
                ? "expense"
                : "expenses"
        }`;


    visibleCount.textContent =
        list.length;


    const categories =
        new Set(
            expenses.map(
                expense =>
                    expense.category
            )
        );


    categoryCount.textContent =
        categories.size;


    /* Keep calculation available for
       future dashboard enhancements */

    void allTotal;
}


/* =========================================================
   CATEGORY SUMMARY
   ========================================================= */

function renderCategorySummary(list) {

    categorySummary.innerHTML = "";


    if (list.length === 0) {

        categorySummary.innerHTML = `
            <div class="category-card">
                <div class="category-card-name">
                    No category data
                </div>

                <div class="category-card-amount">
                    ₹0.00
                </div>
            </div>
        `;

        return;
    }


    const totals = {};


    list.forEach(expense => {

        if (!totals[expense.category]) {

            totals[expense.category] =
                0;
        }


        totals[expense.category] +=
            Number(expense.amount);
    });


    const total =
        Object.values(totals)
            .reduce(
                (sum, amount) =>
                    sum + amount,
                0
            );


    Object.entries(totals)
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .forEach(
            ([category, amount]) => {

                const card =
                    document.createElement("div");

                card.className =
                    "category-card";


                const name =
                    document.createElement("div");

                name.className =
                    "category-card-name";

                name.textContent =
                    category;


                const value =
                    document.createElement("div");

                value.className =
                    "category-card-amount";

                value.textContent =
                    formatCurrency(
                        amount
                    );


                const bar =
                    document.createElement("div");

                bar.className =
                    "category-card-bar";


                const barFill =
                    document.createElement("span");


                const percentage =
                    total > 0
                        ? (amount / total) * 100
                        : 0;


                barFill.style.width =
                    `${percentage}%`;


                bar.appendChild(
                    barFill
                );


                card.appendChild(
                    name
                );

                card.appendChild(
                    value
                );

                card.appendChild(
                    bar
                );


                categorySummary.appendChild(
                    card
                );
            }
        );
}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    ).format(
        Number(amount) || 0
    );
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "No date";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (Number.isNaN(
        date.getTime()
    )) {

        return dateString;
    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);
}


/* =========================================================
   FORM MESSAGE
   ========================================================= */

function showMessage(
    message,
    type = ""
) {

    formMessage.textContent =
        message;


    formMessage.className =
        `form-message ${type}`;


    window.clearTimeout(
        showMessage.timeout
    );


    showMessage.timeout =
        window.setTimeout(
            clearMessage,
            3000
        );
}


function clearMessage() {

    formMessage.textContent =
        "";

    formMessage.className =
        "form-message";
}


/* =========================================================
   PREVENT NEGATIVE AMOUNT
   ========================================================= */

amountInput.addEventListener(
    "input",
    () => {

        if (
            Number(amountInput.value) < 0
        ) {

            amountInput.value = "";
        }
    }
);


/* =========================================================
   KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /* Escape closes edit mode */

        if (
            event.key === "Escape" &&
            editingId
        ) {

            resetForm(true);
        }
    }
);
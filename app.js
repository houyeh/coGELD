const people = ["You", "Maya", "Jon", "Priya", "Leo"];
const icons = ["◒", "⌂", "♧", "◍", "◆", "◌"];
const storageKey = "fairshare-expenses-v1";
const seedExpenses = [
  { description: "Airbnb deposit", amount: 160, paidBy: "You", participants: ["You", "Maya", "Jon", "Priya", "Leo"], icon: "⌂", date: "Today", note: "You paid" },
  { description: "Market groceries", amount: 48.4, paidBy: "Maya", participants: ["You", "Maya", "Jon", "Priya"], icon: "◒", date: "Yesterday", note: "Your share $12.10" },
  { description: "Train tickets", amount: 72, paidBy: "Jon", participants: ["You", "Maya", "Jon", "Leo"], icon: "↗", date: "Sep 06", note: "Your share $18.00" },
  { description: "Late-night tacos", amount: 36, paidBy: "You", participants: ["You", "Maya", "Jon"], icon: "♧", date: "Sep 04", note: "You paid" },
  { description: "Museum passes", amount: 70, paidBy: "Priya", participants: ["You", "Maya", "Priya", "Leo"], icon: "▣", date: "Sep 02", note: "Your share $17.50" }
];

let expenses = loadExpenses();
const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${Number(value).toFixed(2)}`;

function loadExpenses() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || seedExpenses; } catch { return seedExpenses; }
}

function saveExpenses() { localStorage.setItem(storageKey, JSON.stringify(expenses)); }

function renderPeople(containerId, inputName, checked = people) {
  const container = $(containerId);
  container.innerHTML = people.map((person) => `<label class="person-check"><input type="checkbox" name="${inputName}" value="${person}" ${checked.includes(person) ? "checked" : ""}><span>${person}</span></label>`).join("");
}

function calculateBalances() {
  const balances = Object.fromEntries(people.map((person) => [person, 0]));
  expenses.forEach((expense) => {
    const share = expense.amount / expense.participants.length;
    expense.participants.forEach((person) => { balances[person] -= share; });
    balances[expense.paidBy] += expense.amount;
  });
  return balances;
}

function renderExpenses() {
  const list = $("#expense-list");
  list.innerHTML = expenses.slice().reverse().map((expense) => {
    const share = expense.amount / expense.participants.length;
    const note = expense.paidBy === "You" ? "You paid" : `Your share ${money(share)}`;
    return `<article class="expense-row"><span class="expense-icon">${expense.icon || icons[expenses.indexOf(expense) % icons.length]}</span><div class="expense-info"><strong>${escapeHtml(expense.description)}</strong><small>${escapeHtml(expense.date || "Just now")} · ${expense.participants.length} people</small></div><div class="expense-amount"><strong>${money(expense.amount)}</strong><small class="${expense.paidBy === "You" ? "positive" : ""}">${note}</small></div></article>`;
  }).join("");
  $("#expense-count").textContent = expenses.length;
  $("#expense-summary-count").textContent = expenses.length;
  $("#group-total").textContent = money(expenses.reduce((sum, expense) => sum + expense.amount, 0));
}

function renderSummary() {
  const balances = calculateBalances();
  const yours = balances.You;
  const owed = Math.max(yours, 0);
  const owe = Math.max(-yours, 0);
  $("#your-balance").textContent = `${yours >= 0 ? "+" : "-"}${money(Math.abs(yours))}`;
  $("#your-balance").parentElement.querySelector("small").textContent = yours >= 0 ? "you are owed" : "you need to pay";
  $("#owed-total").textContent = money(owed);
  $("#owe-total").textContent = money(owe);
  renderTransfers(balances);
}

function renderTransfers(balances) {
  const debtors = Object.entries(balances).filter(([person, amount]) => person !== "You" && amount < -.005).sort((a, b) => a[1] - b[1]);
  const creditors = Object.entries(balances).filter(([person, amount]) => amount > .005).sort((a, b) => b[1] - a[1]);
  const transfers = [];
  let debtorIndex = 0; let creditorIndex = 0;
  const owed = debtors.map(([person, amount]) => [person, -amount]);
  const due = creditors.map(([person, amount]) => [person, amount]);
  while (debtorIndex < owed.length && creditorIndex < due.length) {
    const amount = Math.min(owed[debtorIndex][1], due[creditorIndex][1]);
    transfers.push({ from: owed[debtorIndex][0], to: due[creditorIndex][0], amount });
    owed[debtorIndex][1] -= amount; due[creditorIndex][1] -= amount;
    if (owed[debtorIndex][1] < .005) debtorIndex++;
    if (due[creditorIndex][1] < .005) creditorIndex++;
  }
  $("#transfer-list").innerHTML = transfers.length ? transfers.slice(0, 3).map((transfer) => `<div class="transfer"><span class="avatar avatar-coral">${initials(transfer.from)}</span><span>${transfer.from}</span><span class="arrow">→</span><span class="avatar avatar-navy">${initials(transfer.to)}</span><span>${transfer.to}</span><strong>${money(transfer.amount)}</strong></div>`).join("") : `<p class="settle-copy">Everyone is square. A rare and beautiful thing.</p>`;
  $(".settle-status").textContent = `${transfers.length} transfer${transfers.length === 1 ? "" : "s"}`;
}

function updateReplay() {
  const amount = Number($("#replay-amount").value);
  const selected = [...document.querySelectorAll("#replay-people input:checked")].map((input) => input.value);
  const share = selected.length ? amount / selected.length : 0;
  $("#range-value").textContent = money(amount);
  $("#replay-result").textContent = selected.length > 1 ? `${selected.filter((person) => person !== "You")[0] || "Your group"} would owe you ${money(share)}` : "Add at least two people to preview";
  $("#replay-detail").textContent = selected.length > 1 ? `Split between ${selected.length} people at ${money(share)} each. This draft will not change your balance.` : "Choose who joins this expense to see the cleanest split.";
}

function openModal(id) { $(id).hidden = false; document.body.style.overflow = "hidden"; }
function closeModals() { document.querySelectorAll(".modal-backdrop").forEach((modal) => { modal.hidden = true; }); document.body.style.overflow = ""; }
function initials(name) { return name === "You" ? "YO" : name.slice(0, 2).toUpperCase(); }
function escapeHtml(value) { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]); }
function toast(message) { const element = $("#toast"); element.textContent = message; element.classList.add("show"); setTimeout(() => element.classList.remove("show"), 2600); }

document.querySelectorAll("[data-open-expense]").forEach((button) => button.addEventListener("click", () => { renderPeople("#people-checks", "participants"); openModal("#expense-modal"); }));
document.querySelectorAll("[data-open-replay]").forEach((button) => button.addEventListener("click", () => { renderPeople("#replay-people", "replayParticipants", people); updateReplay(); openModal("#replay-modal"); }));
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModals));
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (event) => { if (event.target === backdrop) closeModals(); }));
$("#replay-amount").addEventListener("input", updateReplay);
$("#replay-people").addEventListener("change", updateReplay);
$("#expense-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const participants = form.getAll("participants");
  if (participants.length < 2) return toast("Choose at least two people to split this expense.");
  expenses.push({ description: form.get("description").trim(), amount: Number(form.get("amount")), paidBy: form.get("paidBy"), participants, icon: icons[expenses.length % icons.length], date: "Just now" });
  saveExpenses(); renderExpenses(); renderSummary(); event.currentTarget.reset(); closeModals(); toast("Expense added. The group math is updated.");
});
$("#replay-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget); const participants = form.getAll("replayParticipants");
  if (participants.length < 2) return toast("Choose at least two people for the replay.");
  expenses.push({ description: form.get("description") || "New shared expense", amount: Number(form.get("amount")), paidBy: "You", participants, icon: "◌", date: "Just now" });
  saveExpenses(); renderExpenses(); renderSummary(); closeModals(); toast("Replay saved as a real expense.");
});
$("#mark-settled").addEventListener("click", () => toast("Nice. Settlement marked for this demo.") );
$("#reset-data").addEventListener("click", () => { expenses = seedExpenses.map((expense) => ({ ...expense, participants: [...expense.participants] })); saveExpenses(); renderExpenses(); renderSummary(); toast("Demo data restored."); });
$("#view-all").addEventListener("click", () => toast(`${expenses.length} expenses in this workspace.`));
$("#filter-button").addEventListener("click", () => toast("Showing all activity."));

renderExpenses(); renderSummary();
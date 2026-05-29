const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");
const keysEl = document.getElementById("keys");

let current = "0";
let previous = null;
let operator = null;
let shouldResetDisplay = false;

const OP_SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function formatNumber(value) {
  const str = String(value);
  if (str.length <= 12) return str;
  const num = Number(str);
  if (!Number.isFinite(num)) return "Error";
  return num.toExponential(6).replace(/\+/, "");
}

function updateUI() {
  displayEl.textContent = formatNumber(current);
  if (previous !== null && operator) {
    expressionEl.textContent = `${formatNumber(previous)} ${OP_SYMBOLS[operator]}`;
  } else {
    expressionEl.textContent = "";
  }
}

function flashKey(selector) {
  const btn = keysEl.querySelector(selector);
  if (!btn) return;
  btn.classList.add("key-active");
  setTimeout(() => btn.classList.remove("key-active"), 120);
}

function inputDigit(digit) {
  if (shouldResetDisplay) {
    current = digit;
    shouldResetDisplay = false;
  } else if (current === "0" && digit !== ".") {
    current = digit;
  } else if (current.length < 15) {
    current += digit;
  }
  updateUI();
}

function inputDecimal() {
  if (shouldResetDisplay) {
    current = "0.";
    shouldResetDisplay = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  updateUI();
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  shouldResetDisplay = false;
  updateUI();
}

function backspace() {
  if (shouldResetDisplay) return;
  if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
    current = "0";
  } else {
    current = current.slice(0, -1);
  }
  updateUI();
}

function toggleSign() {
  if (current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : `-${current}`;
  updateUI();
}

function percent() {
  const n = parseFloat(current);
  if (!Number.isFinite(n)) return;
  current = String(n / 100);
  updateUI();
}

function compute(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return "Error";
  let result;
  switch (op) {
    case "+":
      result = x + y;
      break;
    case "-":
      result = x - y;
      break;
    case "*":
      result = x * y;
      break;
    case "/":
      result = y === 0 ? NaN : x / y;
      break;
    default:
      return b;
  }
  if (!Number.isFinite(result)) return "Error";
  const rounded = Math.round(result * 1e10) / 1e10;
  return String(rounded);
}

function setOperator(op) {
  if (operator && !shouldResetDisplay) {
    const result = compute(previous, current, operator);
    if (result === "Error") {
      current = "Error";
      previous = null;
      operator = null;
      shouldResetDisplay = true;
      updateUI();
      return;
    }
    current = result;
  }
  previous = current;
  operator = op;
  shouldResetDisplay = true;
  updateUI();
}

function equals() {
  if (operator === null || previous === null) return;
  const result = compute(previous, current, operator);
  expressionEl.textContent = `${formatNumber(previous)} ${OP_SYMBOLS[operator]} ${formatNumber(current)} =`;
  current = result;
  previous = null;
  operator = null;
  shouldResetDisplay = true;
  updateUI();
}

function handleAction(action, value) {
  switch (action) {
    case "digit":
      inputDigit(value);
      flashKey(`[data-value="${value}"][data-action="digit"]`);
      break;
    case "decimal":
      inputDecimal();
      flashKey('[data-action="decimal"]');
      break;
    case "operator":
      setOperator(value);
      flashKey(`[data-value="${value}"][data-action="operator"]`);
      break;
    case "equals":
      equals();
      flashKey('[data-action="equals"]');
      break;
    case "clear":
      clearAll();
      flashKey('[data-action="clear"]');
      break;
    case "toggle-sign":
      toggleSign();
      flashKey('[data-action="toggle-sign"]');
      break;
    case "percent":
      percent();
      flashKey('[data-action="percent"]');
      break;
    default:
      break;
  }
}

keysEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  handleAction(btn.dataset.action, btn.dataset.value);
});

const KEY_MAP = {
  "0": ["digit", "0"],
  "1": ["digit", "1"],
  "2": ["digit", "2"],
  "3": ["digit", "3"],
  "4": ["digit", "4"],
  "5": ["digit", "5"],
  "6": ["digit", "6"],
  "7": ["digit", "7"],
  "8": ["digit", "8"],
  "9": ["digit", "9"],
  ".": ["decimal"],
  ",": ["decimal"],
  "+": ["operator", "+"],
  "-": ["operator", "-"],
  "*": ["operator", "*"],
  "/": ["operator", "/"],
  Enter: ["equals"],
  "=": ["equals"],
  Escape: ["clear"],
  Delete: ["clear"],
  Backspace: ["backspace"],
  "%": ["percent"],
};

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const mapped = KEY_MAP[e.key];
  if (!mapped) return;

  e.preventDefault();

  const [action, value] = mapped;
  if (action === "backspace") {
    backspace();
    return;
  }
  handleAction(action, value);
});

updateUI();

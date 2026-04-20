const keybad = document.querySelector(".keypad");
const screen = document.querySelector(".display");

let firstValue = "";
let secondValue = "";
let operator = "";
let isResult = false;
const operators = new Set(["+", "-", "*", "/"]);

const handleFirstValue = (value) => {
  if (firstValue.length >= 11) return;
  if (value === "." && firstValue.includes(".")) return;

  if (firstValue === "-") {
    firstValue = value === "." ? "-0." : firstValue + value;
    updateScreen();
    return;
  }

  if (firstValue.startsWith("-0.")) {
    firstValue += value;
    updateScreen();
    return;
  }

  if (value === "." && !firstValue) {
    firstValue = "0.";
    updateScreen();
    return;
  }

  firstValue += value;
  updateScreen();
};

const handleSecondValue = (value) => {
  if (secondValue.length >= 11) return;
  if (value === "." && secondValue.includes(".")) return;
  if (value === "." && !secondValue) {
    secondValue = "0.";
    updateScreen();
    return;
  }

  secondValue += value;
  updateScreen();
};

const handleOperator = (value) => {
  if (!firstValue && value === "-") {
    firstValue = "-";
    updateScreen();
    return;
  }

  if (!firstValue) return;

  operator = value;
  updateScreen();
};

const formatResult = (result) => {
  const formattedResult =
    result % 1 === 0
      ? result.toString()
      : Number.parseFloat(result.toFixed(10)).toString();

  if (Math.abs(result) >= 1000000000) {
    return Number.parseFloat(formattedResult).toExponential(3).toString();
  }
  return formattedResult;
};

const handleReset = () => {
  firstValue = "";
  secondValue = "";
  operator = "";
  isResult = false;
  screen.textContent = "0";
};

const calculate = (num1, num2, op) => {
  const operations = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => (b === 0 ? "Error" : a / b),
  };

  const operation = operations[op];
  return operation ? operation(num1, num2) : "Error";
};

const handleEquals = () => {
  let result = null;
  if (!firstValue || !operator || !secondValue) return;

  const num1 = Number.parseFloat(firstValue);
  const num2 = Number.parseFloat(secondValue);

  result = calculate(num1, num2, operator);

  if (result === "Error") {
    errorHandler("Error");
  } else {
    isResult = true;
    const formattedResult = formatResult(result);
    screen.textContent = formattedResult.replaceAll(".", ",");
    firstValue = formattedResult;
    secondValue = "";
    operator = "";
  }
};

const errorHandler = (message) => {
  screen.textContent = message;
  firstValue = "";
  secondValue = "";
  operator = "";
  isResult = false;
};

const getFontSize = (length, width) => {
  if (width <= 450) {
    return length > 16 ? "17px" : "25px";
  } else {
    return length > 18 ? "30px" : "";
  }
};
const updateScreen = () => {
  const display = (firstValue + operator + secondValue || "0").replaceAll(
    ".",
    ",",
  );
  screen.textContent = display;

  screen.style.fontSize = getFontSize(display.length, screen.clientWidth);
};

window.addEventListener("resize", updateScreen);

const deleteLastEntry = (value) => {
  return value.slice(0, -1);
};

const handleDelete = () => {
  if (firstValue && !operator) {
    firstValue = deleteLastEntry(firstValue);
  } else if (secondValue) {
    secondValue = deleteLastEntry(secondValue);
  } else if (operator) {
    operator = "";
  }
  updateScreen();
};

const handleKeyboardInput = (e) => {
  const key = e.key;
  const button = document.querySelector(`button[data-value="${key}"]`);
  if (button) {
    button.click();
  } else if (key === "Enter") {
    e.preventDefault();
    const equalsButton = document.querySelector(`button[data-action="equals"]`);
    equalsButton.click();
  } else if (key === "Backspace") {
    const deleteButton = document.querySelector(`button[data-action="delete"]`);
    deleteButton.click();
  } else if (key === "Escape") {
    const resetButton = document.querySelector(`button[data-action="reset"]`);
    resetButton.click();
  }
};
globalThis.addEventListener("keydown", handleKeyboardInput);

const handleValue = (value) => {
  if (isResult) {
    if (operators.has(value)) {
      isResult = false;
    } else {
      handleReset();
    }
  }

  if (operators.has(value)) return handleOperator(value);
  if (operator && firstValue) return handleSecondValue(value);
  return handleFirstValue(value);
};

const handleAction = (action) => {
  const actions = {
    reset: handleReset,
    delete: handleDelete,
    equals: handleEquals,
  };

  const actionHandler = actions[action];
  if (actionHandler) actionHandler();
};

keybad.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const value = button.dataset.value;
  const action = button.dataset.action;

  if (value) handleValue(value);
  else if (action) handleAction(action);
});

const themeToggle = document.querySelector(".theme-toggle");

themeToggle.addEventListener("click", () => {
  const currentTheme = Number.parseInt(document.body.dataset.theme);
  document.body.dataset.theme = (currentTheme % 3) + 1;
  localStorage.setItem("theme", document.body.dataset.theme);
});

const handleDefaultTheme = (e) => {
  const savedTheme = localStorage.getItem("theme");
  document.body.dataset.theme = savedTheme || (e.matches ? "1" : "2");
};

const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
mediaQuery.addEventListener("change", handleDefaultTheme);
handleDefaultTheme(mediaQuery);

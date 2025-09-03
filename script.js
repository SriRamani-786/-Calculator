(function () {
  const display = document.getElementById('display');
  const keys = document.querySelectorAll('.key');

  let currentValue = '0';
  let previousValue = null;
  let pendingOperator = null; // 'add' | 'subtract' | 'multiply' | 'divide'
  let overwrite = true; // if true, next number press replaces display

  function updateDisplay() {
    display.value = currentValue;
  }

  function clearAll() {
    currentValue = '0';
    previousValue = null;
    pendingOperator = null;
    overwrite = true;
    updateDisplay();
  }

  function deleteLast() {
    if (overwrite) {
      currentValue = '0';
      updateDisplay();
      return;
    }
    if (currentValue.length > 1) {
      currentValue = currentValue.slice(0, -1);
    } else {
      currentValue = '0';
      overwrite = true;
    }
    updateDisplay();
  }

  function appendNumber(digit) {
    if (overwrite) {
      currentValue = String(digit);
      overwrite = false;
    } else {
      if (currentValue === '0') {
        currentValue = String(digit);
      } else {
        currentValue += String(digit);
      }
    }
    updateDisplay();
  }

  function appendDecimal() {
    if (overwrite) {
      currentValue = '0.';
      overwrite = false;
      updateDisplay();
      return;
    }
    if (!currentValue.includes('.')) {
      currentValue += '.';
      updateDisplay();
    }
  }

  function chooseOperator(op) {
    if (pendingOperator !== null && !overwrite) {
      // compute with existing operator first (immediate execution)
      compute();
    }
    previousValue = currentValue;
    pendingOperator = op;
    overwrite = true;
  }

  function performOperation(op, a, b) {
    if (op === 'add') return a + b;
    else if (op === 'subtract') return a - b;
    else if (op === 'multiply') return a * b;
    else if (op === 'divide') return a / b;
    return b;
  }

  function compute() {
    if (pendingOperator === null || previousValue === null) {
      return;
    }
    const a = parseFloat(previousValue);
    const b = parseFloat(currentValue);

    if (pendingOperator === 'divide' && b === 0) {
      currentValue = 'Error';
      previousValue = null;
      pendingOperator = null;
      overwrite = true;
      updateDisplay();
      return;
    }

    let result = performOperation(pendingOperator, a, b);

    // Normalize result to avoid long floating errors
    if (Number.isFinite(result)) {
      // Limit to 12 significant digits
      const str = Number(result.toPrecision(12)).toString();
      currentValue = str;
    } else {
      currentValue = 'Error';
    }

    previousValue = null;
    pendingOperator = null;
    overwrite = true;
    updateDisplay();
  }

  function handleButtonClick(e) {
    const btn = e.currentTarget;
    const action = btn.getAttribute('data-action');

    if (action === 'number') {
      appendNumber(btn.getAttribute('data-number'));
      return;
    }

    if (action === 'decimal') {
      appendDecimal();
      return;
    }

    if (action === 'operator') {
      const op = btn.getAttribute('data-operator');
      chooseOperator(op);
      return;
    }

    if (action === 'equals') {
      compute();
      return;
    }

    if (action === 'clear') {
      clearAll();
      return;
    }

    if (action === 'delete') {
      deleteLast();
      return;
    }
  }

  // Attach listeners with a loop
  keys.forEach(function (btn) {
    btn.addEventListener('click', handleButtonClick);
  });

  // Keyboard support
  document.addEventListener('keydown', function (e) {
    const key = e.key;

    if (key >= '0' && key <= '9') {
      appendNumber(key);
      return;
    }

    if (key === '.' || key === ',') {
      appendDecimal();
      return;
    }

    if (key === '+' || key === '-') {
      chooseOperator(key === '+' ? 'add' : 'subtract');
      return;
    }

    if (key === '*' || key.toLowerCase() === 'x') {
      chooseOperator('multiply');
      return;
    }

    if (key === '/' || key === '÷') {
      chooseOperator('divide');
      return;
    }

    if (key === '=' || key === 'Enter') {
      e.preventDefault();
      compute();
      return;
    }

    if (key === 'Backspace') {
      deleteLast();
      return;
    }

    if (key === 'Escape' || key.toLowerCase() === 'c') {
      clearAll();
      return;
    }
  });

  // Initialize display
  updateDisplay();
})(); 
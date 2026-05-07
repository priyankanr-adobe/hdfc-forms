function formatValue(input, value) {
  const name = input.name || '';

  /* ===== LOAN AMOUNT ===== */
  if (name.includes('loan_amount')) {

    const loanValues = [
      50000,
      200000,
      400000,
      600000,
      800000,
      1000000,
      1500000
    ];

    return `₹${loanValues[value].toLocaleString('en-IN')}`;
  }

  /* ===== TENURE ===== */
  return `${value} months`;
}

function updateBubble(input, wrapper) {

  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);

  const percent = ((value - min) / (max - min)) * 100;

  const bubble = wrapper.querySelector('.range-bubble');
  if (!bubble) return;

  bubble.textContent = formatValue(input, value);

  const bubbleWidth = bubble.offsetWidth || 80;
  const offset = (percent / 100) * bubbleWidth;

  bubble.style.left = `calc(${percent}% - ${offset}px + 12px)`;

  wrapper.style.setProperty('--range-progress', `${percent}%`);
}

export default async function decorate(fieldDiv, fieldJson) {

  const input = fieldDiv.querySelector('input');
  if (!input) return fieldDiv;

  input.type = 'range';

  const fieldName = input.name || '';
  const labelText =
    fieldDiv.querySelector('label')?.textContent?.toLowerCase() || '';

  /* ======================================================
     LOAN AMOUNT
  ====================================================== */

  if (
    fieldName.includes('loan_amount') ||
    labelText.includes('loan amount')
  ) {

    /*
      USE INDEXES INSTEAD OF REAL VALUES
      0 = 50K
      1 = 2L
      2 = 4L
      3 = 6L
      4 = 8L
      5 = 10L
      6 = 15L
    */

    input.min = 0;
    input.max = 6;
    input.step = 1;
    input.value = Math.round(input.value);

    input.value = input.value || 0;

  } else {

    /* ======================================================
       TENURE
    ====================================================== */

    input.min = 12;
    input.max = 84;
    input.step = 12;

    input.value = input.value || 84;
  }

  /* ======================================================
     WRAPPER
  ====================================================== */

  const wrapper = document.createElement('div');
  wrapper.className = 'range-widget-wrapper decorated';

  input.after(wrapper);

  const bubble = document.createElement('span');
  bubble.className = 'range-bubble';

  wrapper.appendChild(bubble);
  wrapper.appendChild(input);

  /* ======================================================
     LABELS
  ====================================================== */

  const labels = document.createElement('div');
  labels.className = 'custom-range-labels';

  if (
    fieldName.includes('loan_amount') ||
    labelText.includes('loan amount')
  ) {

    labels.innerHTML = `
      <span>50K</span>
      <span>2L</span>
      <span>4L</span>
      <span>6L</span>
      <span>8L</span>
      <span>10L</span>
      <span>15L</span>
    `;

  } else {

    labels.innerHTML = `
      <span>12m</span>
      <span>24m</span>
      <span>36m</span>
      <span>48m</span>
      <span>60m</span>
      <span>72m</span>
      <span>84m</span>
    `;
  }

  wrapper.appendChild(labels);

  /* ======================================================
     EVENTS
  ====================================================== */

  input.addEventListener('input', () => {
  input.value = Math.round(input.value);
  updateBubble(input, wrapper);

});

  input.addEventListener('change', () =>
    updateBubble(input, wrapper)
  );

  updateBubble(input, wrapper);

  return fieldDiv;
}
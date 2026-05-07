/* =========================
   RANGE.JS
========================= */

const LOAN_VALUES = [
  50000,
  200000,
  400000,
  600000,
  800000,
  1000000,
  1500000
];

/* =========================
   FORMAT INR
========================= */

function formatINR(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

/* =========================
   INTERPOLATE LOAN VALUE
========================= */

function interpolateLoanValue(percent) {

  const segments = LOAN_VALUES.length - 1;

  const exactIndex =
    (percent / 100) * segments;

  const lowerIndex =
    Math.floor(exactIndex);

  const upperIndex =
    Math.ceil(exactIndex);

  const lower =
    LOAN_VALUES[lowerIndex];

  const upper =
    LOAN_VALUES[upperIndex];

  if (lowerIndex === upperIndex) {
    return lower;
  }

  const ratio =
    exactIndex - lowerIndex;

  return Math.round(
    lower + (upper - lower) * ratio
  );
}

/* =========================
   UPDATE UI
========================= */

function updateBubble(input, wrapper) {

  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);

  const percent =
    ((value - min) / (max - min)) * 100;

  const bubble =
    wrapper.querySelector('.range-bubble');

  const thumb =
    wrapper.querySelector('.custom-thumb');

  if (!bubble || !thumb) return;

  const fieldName =
    input.name || '';

  /* =========================
     LOAN AMOUNT
  ========================= */

  if (fieldName.includes('loan_amount')) {

    const actualValue =
      interpolateLoanValue(percent);

    /*
      IMPORTANT
      Use this value for EMI calculations
    */

    input.dataset.actualValue =
      actualValue;

    /*
      ALSO update hidden form value
    */

    input.setAttribute(
      'data-actual-value',
      actualValue
    );

    /*
      UPDATE DISPLAY VALUE
    */

    bubble.textContent =
      formatINR(actualValue);

    /*
      FIX:
      Update display card live
    */

    const event =
      new CustomEvent(
        'loanAmountUpdated',
        {
          detail: {
            value: actualValue
          }
        }
      );

    window.dispatchEvent(event);

  } else {

    bubble.textContent =
      `${value} months`;
  }

  /* =========================
     BUBBLE POSITION
  ========================= */

  const bubbleWidth =
    bubble.offsetWidth || 80;

  const offset =
    (percent / 100) * bubbleWidth;

  bubble.style.left =
    `calc(${percent}% - ${offset}px + 12px)`;

  /* =========================
     THUMB POSITION
  ========================= */

  thumb.style.left =
    `calc(${percent}% - 7px)`;

  /* =========================
     TRACK PROGRESS
  ========================= */

  wrapper.style.setProperty(
    '--range-progress',
    `${percent}%`
  );
}

/* =========================
   DECORATE
========================= */

export default async function decorate(fieldDiv) {

  const input =
    fieldDiv.querySelector('input');

  if (!input) return fieldDiv;

  input.type = 'range';

  const fieldName =
    input.name || '';

  const labelText =
    fieldDiv
      .querySelector('label')
      ?.textContent
      ?.toLowerCase() || '';

  /* =========================
     LOAN AMOUNT
  ========================= */

  if (
    fieldName.includes('loan_amount') ||
    labelText.includes('loan amount')
  ) {

    /*
      Virtual slider
    */

    input.min = 0;
    input.max = 100;
    input.step = 1;

    input.value = 0;

  } else {

    /* =========================
       TENURE
    ========================= */

    input.min = 12;
    input.max = 84;
    input.step = 12;

    input.value = 48;
  }

  /* =========================
     WRAPPER
  ========================= */

  const wrapper =
    document.createElement('div');

  wrapper.className =
    'range-widget-wrapper decorated';

  input.after(wrapper);

  /* =========================
     BUBBLE
  ========================= */

  const bubble =
    document.createElement('span');

  bubble.className =
    'range-bubble';

  /* =========================
     CUSTOM THUMB
  ========================= */

  const thumb =
    document.createElement('span');

  thumb.className =
    'custom-thumb';

  wrapper.appendChild(bubble);
  wrapper.appendChild(thumb);
  wrapper.appendChild(input);

  /* =========================
     LABELS
  ========================= */

  const labels =
    document.createElement('div');

  labels.className =
    'custom-range-labels';

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

  /* =========================
     EVENTS
  ========================= */

  input.addEventListener('input', () => {

    updateBubble(input, wrapper);

  });

  updateBubble(input, wrapper);

  return fieldDiv;
}
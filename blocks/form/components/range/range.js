function updateBubble(input, element) {
  const step = Number(input.step || 1);
  const max = Number(input.max || 0);
  const min = Number(input.min || 1);
  const value = Number(input.value || 1);

  const current = Math.ceil((value - min) / step);
  const total = Math.ceil((max - min) / step);

  const bubble = element.querySelector('.range-bubble');

  if (!bubble) return;

  const bubbleWidth = bubble.getBoundingClientRect().width || 40;
  const percent = current / total;

  const left = `${percent * 100}% - ${percent * bubbleWidth}px`;

  // update bubble text
  bubble.innerText = `${value}`;

  // update position
  bubble.style.left = `calc(${left})`;

  // ✅ FIX: update CSS variables properly (no reset issue)
  element.style.setProperty('--total-steps', total);
  element.style.setProperty('--current-steps', current);
}

export default async function decorate(fieldDiv, fieldJson) {
  const input = fieldDiv.querySelector('input');

  if (!input) return fieldDiv;

  input.type = 'range';
  input.min = input.min || 1;
  input.max = input.max || 100;
  input.step = fieldJson?.properties?.stepValue || 1;

  const div = document.createElement('div');
  div.className = 'range-widget-wrapper decorated';

  input.after(div);

  const bubble = document.createElement('span');
  bubble.className = 'range-bubble';

  const rangeMinEl = document.createElement('span');
  rangeMinEl.className = 'range-min';

  const rangeMaxEl = document.createElement('span');
  rangeMaxEl.className = 'range-max';

  rangeMinEl.innerText = `${input.min}`;
  rangeMaxEl.innerText = `${input.max}`;

  div.appendChild(bubble);
  div.appendChild(input);
  div.appendChild(rangeMinEl);
  div.appendChild(rangeMaxEl);

  // ✅ CUSTOM LABELS
  const customLabels = document.createElement('div');
  customLabels.className = 'custom-range-labels';

  const fieldName = input.name || '';
  const labelText =
    fieldDiv.querySelector('label')?.textContent?.toLowerCase() || '';

  if (
    fieldName.includes('loan_amount') ||
    labelText.includes('loan amount')
  ) {
    customLabels.innerHTML = `
      <span>50K</span>
      <span>2L</span>
      <span>4L</span>
      <span>6L</span>
      <span>8L</span>
      <span>10L</span>
      <span>15L</span>
    `;
  } else {
    customLabels.innerHTML = `
      <span>12m</span>
      <span>24m</span>
      <span>36m</span>
      <span>48m</span>
      <span>60m</span>
      <span>72m</span>
      <span>84m</span>
    `;
  }

  div.appendChild(customLabels);

  // ✅ FIX: use both events
  input.addEventListener('input', (e) => {
    updateBubble(e.target, div);
  });

  input.addEventListener('change', (e) => {
    updateBubble(e.target, div);
  });

  // initial render
  setTimeout(() => {
    updateBubble(input, div);
  }, 0);

  return fieldDiv;
}
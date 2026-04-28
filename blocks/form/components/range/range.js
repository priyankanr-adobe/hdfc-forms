function updateBubble(input, element) {
  const step = input.step || 1;
  const max = input.max || 0;
  const min = input.min || 1;
  const value = input.value || 1;
  const current = Math.ceil((value - min) / step);
  const total = Math.ceil((max - min) / step);
  const bubble = element.querySelector('.range-bubble');

  const bubbleWidth = bubble.getBoundingClientRect().width || 31;
  const left = `${(current / total) * 100}% - ${(current / total) * bubbleWidth}px`;

  bubble.innerText = `${value}`;

  const steps = {
    '--total-steps': Math.ceil((max - min) / step),
    '--current-steps': Math.ceil((value - min) / step),
  };

  const style = Object.entries(steps)
    .map(([varName, varValue]) => `${varName}:${varValue}`)
    .join(';');

  bubble.style.left = `calc(${left})`;
  element.setAttribute('style', style);
}

export default async function decorate(fieldDiv, fieldJson) {
  const input = fieldDiv.querySelector('input');

  input.type = 'range';
  input.min = input.min || 1;
  input.max = input.max || 100;
  input.step = fieldJson?.properties?.stepValue || 1;

  const div = document.createElement('div');
  div.className = 'range-widget-wrapper decorated';
  input.after(div);

  const hover = document.createElement('span');
  hover.className = 'range-bubble';

  const rangeMinEl = document.createElement('span');
  rangeMinEl.className = 'range-min';

  const rangeMaxEl = document.createElement('span');
  rangeMaxEl.className = 'range-max';

  rangeMinEl.innerText = `${input.min || 1}`;
  rangeMaxEl.innerText = `${input.max}`;

  div.appendChild(hover);
  div.appendChild(input);
  div.appendChild(rangeMinEl);
  div.appendChild(rangeMaxEl);

  /* ADD CUSTOM RANGE LABELS */
  const customLabels = document.createElement('div');
  customLabels.className = 'custom-range-labels';

  const fieldName = input.name || '';
  const labelText = fieldDiv.querySelector('label')?.textContent?.toLowerCase() || '';

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

  input.addEventListener('input', (e) => {
    updateBubble(e.target, div);
  });

  updateBubble(input, div);

  return fieldDiv;
}
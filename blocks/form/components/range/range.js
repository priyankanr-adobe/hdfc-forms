function formatValue(input, value) {
  const name = input.name || '';
  if (name.includes('loan_amount')) {
    return `₹${Number(value).toLocaleString('en-IN')}`;
  }
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
  const labelText = fieldDiv.querySelector('label')?.textContent?.toLowerCase() || '';

  if (fieldName.includes('loan_amount') || labelText.includes('loan amount')) {
    input.min = 50000;
    input.max = 1500000;
    input.step = 50000;
    input.value = input.value || 1500000;
  } else {
    input.min = 12;
    input.max = 84;
    input.step = 12;
    input.value = input.value || 84;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'range-widget-wrapper decorated';

  input.after(wrapper);

  const bubble = document.createElement('span');
  bubble.className = 'range-bubble';

  wrapper.appendChild(bubble);
  wrapper.appendChild(input);

  const labels = document.createElement('div');
  labels.className = 'custom-range-labels';

  if (fieldName.includes('loan_amount') || labelText.includes('loan amount')) {
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

  input.addEventListener('input', () => updateBubble(input, wrapper));
  input.addEventListener('change', () => updateBubble(input, wrapper));

  updateBubble(input, wrapper);

  return fieldDiv;
}
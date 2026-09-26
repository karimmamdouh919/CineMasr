function getMockSnacks() {
  return [
    {
      id: 'popcorn',
      name: 'Popcorn',
      price: 45,
      image: '../assets/images/popcorn.jpg',
      options: { label: 'Size', choices: ['Small', 'Medium', 'Large'] }
    },
    {
      id: 'water',
      name: 'Water Bottle',
      price: 15,
      image: '../assets/images/water.jpg',
      options: null
    },
    {
      id: 'soda',
      name: 'Soft Drink',
      price: 25,
      image: '../assets/images/soda-can.jpg',
      options: { label: 'Flavor', choices: ['Cola', 'Orange', 'Apple'] }
    },
    {
      id: 'juice',
      name: 'Natural Juice',
      price: 35,
      image: '../assets/images/natural-juice.png',
      options: { label: 'Flavor', choices: ['Strawberry', 'Mango', 'Kiwi', 'Orange'] }
    },
    {
      id: 'candy',
      name: 'Candy Mix',
      price: 30,
      image: '../assets/images/candy-mix.jpg',
      options: null
    },
    {
      id: 'chips',
      name: 'Chips',
      price: 25,
      image: '../assets/images/chips.jpg',
      options: { label: 'Flavor', choices: ['Salt & Vinegar', 'Ketchup', 'Chili'] }
    },
    { id: 'hotdog', name: 'Hot Dog', price: 40, image: '', options: null },
    { id: 'sandwich', name: 'Sandwich', price: 40, image: '', options: null },
    { id: 'pizza', name: 'Pizza Slice', price: 40, image: '', options: null }
  ];
}

let snacks = [];
const quantities = {};
const selectedOptions = {};

const snacksGrid = document.getElementById('snacksGrid');
const snacksSubtotal = document.getElementById('snacksSubtotal');
const snacksError = document.getElementById('snacksError');
const continueBtn = document.getElementById('continueBtn');
const skipBtn = document.getElementById('skipBtn');

const MAX_QTY = 10;

async function loadSnacks() {
  try {
    const res = await api.get('/snacks');
    let list = res.data;
    if (list && list.data) list = list.data;
    if (list && list.snacks) list = list.snacks;

    if (Array.isArray(list) && list.length > 0) {
      snacks = list.map(item => ({
        id: String(item._id || item.id),
        name: item.name || 'Snack',
        price: Number(item.price) || 0,
        image: item.imageUrl || item.image || '',
        options: item.options || null
      }));
    } else {
      snacks = getMockSnacks();
    }
  } catch (err) {
    console.warn('API fetch failed, utilizing fallback snack list:', err.message);
    snacks = getMockSnacks();
  }

  renderSnacks();
}

function renderSnacks() {
  snacksGrid.innerHTML = '';

  snacks.forEach(snack => {
    quantities[snack.id] = quantities[snack.id] || 0;
    if (snack.options && !selectedOptions[snack.id]) {
      selectedOptions[snack.id] = snack.options.choices[0];
    }

    const optionsHtml = snack.options ? `
      <select class="snack-option-select" data-id="${snack.id}" aria-label="${snack.options.label}">
        ${snack.options.choices.map(choice =>
          `<option value="${choice}" ${choice === selectedOptions[snack.id] ? 'selected' : ''}>${choice}</option>`
        ).join('')}
      </select>
    ` : '';

    const imageHtml = snack.image
      ? `<img class="snack-image" src="${snack.image}" alt="${snack.name}" onerror="this.style.display='none'">`
      : `<div class="snack-image snack-image-placeholder">🍽️</div>`;

    const card = document.createElement('div');
    card.className = 'snack-card';
    card.innerHTML = `
      ${imageHtml}
      <p class="snack-name">${snack.name}</p>
      <p class="snack-price">EGP ${snack.price}</p>
      ${optionsHtml}
      <div class="snack-qty-control">
        <button type="button" class="qty-btn qty-minus" data-id="${snack.id}" aria-label="Decrease quantity">−</button>
        <span class="qty-value" id="qty-${snack.id}">${quantities[snack.id]}</span>
        <button type="button" class="qty-btn qty-plus" data-id="${snack.id}" aria-label="Increase quantity">+</button>
      </div>
    `;
    snacksGrid.appendChild(card);
  });

  snacksGrid.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, 1));
  });
  snacksGrid.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, -1));
  });
  snacksGrid.querySelectorAll('.snack-option-select').forEach(select => {
    select.addEventListener('change', () => {
      selectedOptions[select.dataset.id] = select.value;
    });
  });
}

function changeQty(snackId, delta) {
  const newQty = (quantities[snackId] || 0) + delta;
  if (newQty < 0 || newQty > MAX_QTY) return;

  quantities[snackId] = newQty;
  const qtyElem = document.getElementById(`qty-${snackId}`);
  if (qtyElem) qtyElem.textContent = newQty;
  updateSubtotal();
}

function updateSubtotal() {
  let total = 0;
  snacks.forEach(snack => {
    total += (quantities[snack.id] || 0) * snack.price;
  });
  snacksSubtotal.textContent = `EGP ${total}`;
  snacksError.textContent = '';
}

function goToCheckout(selectedSnacks) {
  const booking = JSON.parse(localStorage.getItem('cinemisr_booking') || '{}');
  booking.snacks = selectedSnacks;
  booking.snacksSubtotal = selectedSnacks.reduce((sum, s) => sum + s.qty * s.price, 0);
  localStorage.setItem('cinemisr_booking', JSON.stringify(booking));
  window.location.href = 'checkout.html';
}

continueBtn.addEventListener('click', () => {
  const selectedSnacks = snacks
    .filter(s => (quantities[s.id] || 0) > 0)
    .map(s => ({
      id: s.id,
      name: s.name,
      qty: quantities[s.id],
      price: s.price,
      option: s.options ? selectedOptions[s.id] : null
    }));

  goToCheckout(selectedSnacks);
});

skipBtn.addEventListener('click', () => {
  goToCheckout([]);
});

document.addEventListener('DOMContentLoaded', loadSnacks);
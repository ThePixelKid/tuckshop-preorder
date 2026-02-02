// Removed Supabase import - using hardcoded menu

export const cart = {};
export const MAX_TOTAL_ITEMS = 5;

// Load cart from localStorage
const savedCart = localStorage.getItem('tuckshopCart');
if (savedCart) {
  Object.assign(cart, JSON.parse(savedCart));
}

const menuDiv = document.getElementById("menu");
const cartDiv = document.getElementById("cart");

export async function loadMenu() {
  // Clear existing menu items to prevent duplicates
  menuDiv.innerHTML = "";
  
  // Temporarily hardcoded menu data for testing
  const data = [
    { id: 1, name: "Small Sosa Drink", price: 700, maxPerStudent: 5 },
    { id: 2, name: "Small Salive Pulpy", price: 800, maxPerStudent: 5 },
    { id: 3, name: "Yale Bread", price: 500, maxPerStudent: 5 },
    { id: 4, name: "Coaster", price: 100, maxPerStudent: 5 },
    { id: 5, name: "So Yummy", price: 200, maxPerStudent: 5 },
    { id: 6, name: "Ribena", price: 350, maxPerStudent: 5 },
    { id: 7, name: "Popster", price: 200, maxPerStudent: 5 },
    { id: 8, name: "Pringles x48", price: 300, maxPerStudent: 5 },
    { id: 9, name: "Merba Cookies", price: 3200, maxPerStudent: 5 },
    { id: 10, name: "Soda Crackers", price: 200, maxPerStudent: 5 },
    { id: 11, name: "Big Oreos", price: 2000, maxPerStudent: 5 },
    { id: 12, name: "Munch It", price: 200, maxPerStudent: 5 },
    { id: 13, name: "Brodys Cookies", price: 1200, maxPerStudent: 5 },
    { id: 14, name: "Digestive / Hobnob", price: 350, maxPerStudent: 5 },
    { id: 15, name: "Fox", price: 3000, maxPerStudent: 5 },
    { id: 16, name: "Plastic Plate", price: 300, maxPerStudent: 5 },
    { id: 17, name: "Pure Bliss", price: 0, maxPerStudent: 5 },
    { id: 18, name: "Maryland Cookies", price: 2000, maxPerStudent: 5 },
    { id: 19, name: "Top Cracker", price: 0, maxPerStudent: 5 },
    { id: 20, name: "Mentos", price: 500, maxPerStudent: 5 },
    { id: 21, name: "Small Oreos", price: 1000, maxPerStudent: 5 },
    { id: 22, name: "Short Bread Bite", price: 500, maxPerStudent: 5 },
    { id: 23, name: "Sharwama", price: 2500, maxPerStudent: 5 },
    { id: 24, name: "Meat Pie", price: 1500, maxPerStudent: 5 },
    { id: 25, name: "Chicken Pie", price: 1500, maxPerStudent: 5 },
    { id: 26, name: "Sausage Roll / Doughnut", price: 1000, maxPerStudent: 5 },
    { id: 27, name: "Zobo", price: 500, maxPerStudent: 5 },
    { id: 28, name: "Plantain Chips", price: 250, maxPerStudent: 5 },
    { id: 29, name: "Pencil", price: 200, maxPerStudent: 5 },
    { id: 30, name: "Pen", price: 200, maxPerStudent: 5 },
    { id: 31, name: "Disposable Cup", price: 200, maxPerStudent: 5 },
    { id: 32, name: "Extra Spoon", price: 100, maxPerStudent: 5 },
  ];

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";
    const currentQty = cart[item.id]?.qty || 0;
    div.innerHTML = `
      <div class="item-info">
        <strong>${item.name}</strong>
        <span>₦${item.price}</span>
      </div>
      <div class="quantity-controls">
        <button class="minus-btn">-</button>
        <span class="quantity">${currentQty}</span>
        <button class="plus-btn">+</button>
      </div>
    `;
    div.querySelector(".plus-btn").onclick = () => addItem(item.id, item);
    div.querySelector(".minus-btn").onclick = () => {
      if (cart[item.id]?.qty > 0) removeItem(item.id);
    };
    menuDiv.appendChild(div);
  });
}

function addItem(id, item) {
  const current = cart[id]?.qty || 0;
  if (current >= item.maxPerStudent) {
    alert(`Max ${item.maxPerStudent} per student`);
    return;
  }
  const total = Object.values(cart).reduce((a, b) => a + b.qty, 0);
  if (total >= MAX_TOTAL_ITEMS) {
    alert("Max total items reached");
    return;
  }
  cart[id] = { name: item.name, qty: current + 1 };
  localStorage.setItem('tuckshopCart', JSON.stringify(cart));
  renderCart();
  loadMenu(); // Update menu quantities
}

function removeItem(id) {
  if (cart[id].qty > 1) {
    cart[id].qty--;
  } else {
    delete cart[id];
  }
  localStorage.setItem('tuckshopCart', JSON.stringify(cart));
  renderCart();
  loadMenu(); // Update menu quantities
}

function renderCart() {
  cartDiv.innerHTML = "";
  if (Object.keys(cart).length === 0) {
    cartDiv.innerHTML = "<p>Your cart is empty</p>";
    return;
  }
  for (const [id, item] of Object.entries(cart)) {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name} ×${item.qty}</span>
      <button class="remove-btn">Remove</button>
    `;
    div.querySelector(".remove-btn").onclick = () => removeItem(id);
    cartDiv.appendChild(div);
  }
}

loadMenu();
renderCart();

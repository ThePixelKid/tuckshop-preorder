import { supabase } from "./firebase.js";

export const cart = {};
export const MAX_TOTAL_ITEMS = 5;

const menuDiv = document.getElementById("menu");
const cartDiv = document.getElementById("cart");

async function loadMenu() {
  const { data, error } = await supabase.from('menu').select('*');
  if (error) {
    console.error("Error loading menu:", error);
    menuDiv.innerHTML = "<p>Error loading menu. Check console.</p>";
    return;
  }
  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.innerHTML = `
      <div class="item-info">
        <strong>${item.name}</strong>
        <span>₦${item.price}</span>
      </div>
      <button class="add-btn">Add</button>
    `;
    div.querySelector(".add-btn").onclick = () => addItem(item.id, item);
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
  renderCart();
}

function removeItem(id) {
  if (cart[id].qty > 1) {
    cart[id].qty--;
  } else {
    delete cart[id];
  }
  renderCart();
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

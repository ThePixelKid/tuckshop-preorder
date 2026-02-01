import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const cart = {};
export const MAX_TOTAL_ITEMS = 5;

const menuDiv = document.getElementById("menu");

const snap = await getDocs(collection(db, "menu"));

snap.forEach(doc => {
  const item = doc.data();
  const div = document.createElement("div");

  div.innerHTML = `
    <strong>${item.name}</strong> – ₦${item.price}
    <button>Add</button>
  `;

  div.querySelector("button").onclick = () => addItem(doc.id, item);
  menuDiv.appendChild(div);
});

function addItem(id, item) {
  const current = cart[id]?.qty || 0;

  if (current >= item.maxPerStudent) {
    alert("Item limit reached");
    return;
  }

  const total = Object.values(cart).reduce((a,b)=>a+b.qty,0);
  if (total >= MAX_TOTAL_ITEMS) {
    alert("Max total items reached");
    return;
  }

  cart[id] = { name: item.name, qty: current + 1 };
}

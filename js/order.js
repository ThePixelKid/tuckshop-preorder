// Removed Supabase import - using Google Apps Script API
import { API_URL } from './config.js';
import { cart } from "./menu.js";

const ORDER_OPEN = 17; // 5 PM
const ORDER_CLOSE = 21; // 9 PM

function isOrderingOpen() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= ORDER_OPEN && hour < ORDER_CLOSE;
}

function updateUI() {
  const open = isOrderingOpen();
  const btn = document.getElementById("orderBtn");
  const msg = document.getElementById("statusMsg");

  if (open) {
    btn.disabled = false;
    msg.innerText = "Ordering is open (5-9 PM)";
    msg.style.color = "#f59e0b";
  } else {
    btn.disabled = true;
    msg.innerText = "Ordering is closed (available 5-9 PM daily)";
    msg.style.color = "#ff6b6b";
  }
}

updateUI();

document.getElementById("orderBtn").onclick = async (event) => {
  event.preventDefault(); // Prevent form submission
  console.log("Order button clicked");
  const name = document.getElementById("studentName").value.trim();
  if (!name || Object.keys(cart).length === 0) {
    alert("Please enter your name and add items to cart");
    return;
  }

  // Temporarily disabled for testing
  // if (!isOrderingOpen()) {
  //   alert("Ordering is closed (5–9 AM)");
  //   return;
  // }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check for existing order today (fetch from server)
  try {
    const response = await fetch(API_URL);
    const allOrders = await response.json();
    const todayOrders = allOrders.filter(order =>
      new Date(order.createdAt) >= today && order.studentName === name
    );
    if (todayOrders.length > 0) {
      alert("You already ordered today");
      return;
    }
  } catch (error) {
    console.error("Error checking existing orders:", error);
    alert("Error checking orders. Please try again.");
    return;
  }

  // Save order to server
  const itemsText = Object.values(cart).map(item => `${item.name} ×${item.qty}`).join('; ');
  const newOrder = {
    studentName: name,
    form: document.getElementById("studentForm").value,
    itemsText: itemsText,
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newOrder)
    });

    if (!response.ok) {
      throw new Error('Failed to save order');
    }

    console.log("Order saved successfully");
    // Clear cart after successful order
    Object.keys(cart).forEach(key => delete cart[key]);
    localStorage.removeItem('tuckshopCart');
    window.location.href = "confirm.html";
  } catch (error) {
    console.error("Error saving order:", error);
    alert("Error saving order. Please try again.");
  }
};

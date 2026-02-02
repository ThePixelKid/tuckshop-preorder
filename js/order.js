import { supabase } from "./firebase.js";
import { cart } from "./menu.js";

const ORDER_OPEN = 5;
const ORDER_CLOSE = 9;

function isOrderingOpen() {
  // Temporarily disabled for testing
  return true;
}

function updateUI() {
  // Temporarily always open for testing
  document.getElementById("orderBtn").disabled = false;
  document.getElementById("statusMsg").innerText = "";
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

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('studentName', name)
      .gt('createdAt', today.toISOString());
    if (error) {
      console.warn("Could not check existing orders:", error);
    } else if (data && data.length > 0) {
      alert("You already ordered today");
      return;
    }

    console.log("Adding order to Supabase");
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        studentName: name,
        form: document.getElementById("studentForm").value,
        pickupTime: document.getElementById("pickupTime").value,
        items: Object.values(cart),
        status: "Pending",
        createdAt: new Date().toISOString()
      });
    if (insertError) {
      console.error("Error adding order:", insertError);
      alert("Error placing order: " + insertError.message);
      return;
    }
    console.log("Order added successfully");
    window.location.href = "confirm.html";
  } catch (error) {
    console.error("Error placing order:", error);
    alert("Error placing order: " + error.message);
  }
};

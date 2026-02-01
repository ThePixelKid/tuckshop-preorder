import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp, query, where, getDocs } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { cart } from "./menu.js";

const ORDER_OPEN = 5;
const ORDER_CLOSE = 9;

function isOpen() {
  const h = new Date().getHours();
  return h >= ORDER_OPEN && h < ORDER_CLOSE;
}

if (!isOpen()) {
  document.getElementById("orderBtn").disabled = true;
  document.getElementById("statusMsg").innerText =
    "Orders open from 5–9";
}

document.getElementById("orderBtn").onclick = async () => {
  const name = studentName.value.trim();
  if (!name || Object.keys(cart).length === 0) {
    alert("Missing info");
    return;
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  const q = query(
    collection(db, "orders"),
    where("studentName", "==", name),
    where("createdAt", ">", today)
  );

  if (!(await getDocs(q)).empty) {
    alert("You already ordered today");
    return;
  }

  await addDoc(collection(db, "orders"), {
    studentName: name,
    form: studentForm.value,
    pickupTime: pickupTime.value,
    items: Object.values(cart),
    status: "Pending",
    createdAt: serverTimestamp()
  });

  location.href = "confirm.html";
};

import { db } from "./firebase.js";
import { collection, query, where, orderBy, onSnapshot }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const pass = prompt("Admin password");
if (pass !== "tuckshop123") location.href = "/";

const ordersDiv = document.getElementById("orders");
const totalsDiv = document.getElementById("totals");
const filter = document.getElementById("filter");

function load() {
  const q = query(
    collection(db, "orders"),
    where("pickupTime", "==", filter.value),
    orderBy("createdAt", "asc")
  );

  onSnapshot(q, snap => {
    ordersDiv.innerHTML = "";
    const totals = {};

    snap.forEach((doc, i) => {
      const o = doc.data();
      ordersDiv.innerHTML += `<p>#${i+1} ${o.studentName}</p>`;

      o.items.forEach(it => {
        totals[it.name] = (totals[it.name] || 0) + it.qty;
      });
    });

    totalsDiv.innerHTML = Object.entries(totals)
      .map(([k,v]) => `${k}: ${v}`)
      .join("<br>");
  });
}

filter.onchange = load;
load();

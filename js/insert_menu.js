import { supabase } from "./firebase.js";
import { loadMenu } from "./menu.js";

const menuItems = [
  { name: "Small Sosa Drink", price: 700, maxPerStudent: 5 },
  { name: "Small Salive Pulpy", price: 800, maxPerStudent: 5 },
  { name: "Yale Bread", price: 500, maxPerStudent: 5 },
  { name: "Coaster", price: 100, maxPerStudent: 5 },
  { name: "So Yummy", price: 200, maxPerStudent: 5 },
  { name: "Ribena", price: 350, maxPerStudent: 5 },
  { name: "Popster", price: 200, maxPerStudent: 5 },
  { name: "Pringles x48", price: 300, maxPerStudent: 5 },
  { name: "Merba Cookies", price: 3200, maxPerStudent: 5 },
  { name: "Soda Crackers", price: 200, maxPerStudent: 5 },
  { name: "Big Oreos", price: 2000, maxPerStudent: 5 },
  { name: "Munch It", price: 200, maxPerStudent: 5 },
  { name: "Brodys Cookies", price: 1200, maxPerStudent: 5 },
  { name: "Digestive / Hobnob", price: 350, maxPerStudent: 5 },
  { name: "Fox", price: 3000, maxPerStudent: 5 },
  { name: "Plastic Plate", price: 300, maxPerStudent: 5 },
  { name: "Pure Bliss", price: 0, maxPerStudent: 5 },
  { name: "Maryland Cookies", price: 2000, maxPerStudent: 5 },
  { name: "Top Cracker", price: 0, maxPerStudent: 5 },
  { name: "Mentos", price: 500, maxPerStudent: 5 },
  { name: "Small Oreos", price: 1000, maxPerStudent: 5 },
  { name: "Short Bread Bite", price: 500, maxPerStudent: 5 },
  { name: "Sharwama", price: 2500, maxPerStudent: 5 },
  { name: "Meat Pie", price: 1500, maxPerStudent: 5 },
  { name: "Chicken Pie", price: 1500, maxPerStudent: 5 },
  { name: "Sausage Roll / Doughnut", price: 1000, maxPerStudent: 5 },
  { name: "Zobo", price: 500, maxPerStudent: 5 },
  { name: "Plantain Chips", price: 250, maxPerStudent: 5 },
  { name: "Pencil", price: 200, maxPerStudent: 5 },
  { name: "Pen", price: 200, maxPerStudent: 5 },
  { name: "Disposable Cup", price: 200, maxPerStudent: 5 },
  { name: "Extra Spoon", price: 100, maxPerStudent: 5 },
];

async function insertMenu() {
  try {
    // Delete existing menu items
    const { error: deleteError } = await supabase.from('menu').delete().neq('id', -1);
    if (deleteError) {
      console.error("Error deleting existing menu:", deleteError);
    } else {
      console.log("Existing menu deleted");
    }

    const { data, error } = await supabase.from('menu').insert(menuItems);
    if (error) {
      console.error("Error inserting menu:", error);
    } else {
      console.log("Menu inserted successfully:", data);
      // Reload menu to display new items
      loadMenu();
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

insertMenu();
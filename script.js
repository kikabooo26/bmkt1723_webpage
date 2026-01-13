/* ------------------ Tips (Shared) ------------------ */
function showTip() {
  const tips = [
    "You can save up to RM50/month by tracking your groceries!",
    "Buying in bulk often saves more in the long run.",
    "Avoid shopping when you're hungry — you’ll buy more!",
    "Make a list before shopping to reduce overspending.",
    "Compare prices between brands — same quality, lower price!",
    "Look for store brands — they’re often cheaper and just as good.",
    "Use a calculator (like ours!) to stay within budget.",
    "Don’t forget to check expiry dates — waste is expensive!"
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  const tipBox = document.getElementById("groceryTip");

  if (tipBox) {
    tipBox.style.opacity = 0;
    setTimeout(() => {
      tipBox.innerText = randomTip;
      tipBox.style.opacity = 1;
    }, 300);
  }
}

/* ------------------ Calculator Page ------------------ */
if (document.querySelector(".product-input") || document.getElementById("cartList")) {
  const productPrices = {
    rice: 3.50, milk: 2.50, egg: 0.50, bread: 2.20,
    sugar: 2.00, oil: 5.50, chicken: 8.00, noodles: 3.00,
    fish: 10.00, butter: 4.00, juice: 3.20, coffee: 6.00
  };

  let cart = [];

  function addToCart(product) {
    const qtyInput = document.getElementById(`qty-${product}`);
    const quantity = parseInt(qtyInput.value);

    if (!quantity || quantity <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    const existingItem = cart.find(item => item.product === product);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product, quantity, price: productPrices[product] });
    }

    qtyInput.value = "";
    updateCartDisplay();
    showCartNotification(`${capitalize(product)} added to cart!`);
  }

  function removeFromCart(index) {
    const removedProduct = cart[index].product;
    cart.splice(index, 1);
    showCartNotification(`${capitalize(removedProduct)} removed from cart.`, "error");
    updateCartDisplay();
  }

  function clearCart() {
    cart = [];
    updateCartDisplay();
    document.getElementById("finalOutput").innerHTML = "";
  }

  function updateCartDisplay() {
    const cartList = document.getElementById("cartList");
    if (!cartList) return;
    cartList.innerHTML = "";

    if (cart.length === 0) {
      cartList.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    cart.forEach((item, index) => {
      const total = (item.quantity * item.price).toFixed(2);
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `${item.quantity} × ${capitalize(item.product)} = RM ${total}
        <button onclick="removeFromCart(${index})">Remove</button>`;
      cartList.appendChild(li);
    });
  }

  function calculateCartTotal() {
    if (cart.length === 0) {
      document.getElementById("finalOutput").innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    let subtotal = 0;
    cart.forEach(item => subtotal += item.quantity * item.price);

    const tax = subtotal * 0.06;
    const total = subtotal + tax;

    document.getElementById("finalOutput").innerHTML =
      `<p>Subtotal: RM ${subtotal.toFixed(2)}</p>
       <p>Tax (6%): RM ${tax.toFixed(2)}</p>
       <p><strong>Total: RM ${total.toFixed(2)}</strong></p>`;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function showCartNotification(message, type = "success") {
    const notif = document.getElementById("cartNotification");
    if (!notif) return;

    notif.textContent = (type === "success" ? "✅ " : "❌ ") + message;
    notif.classList.remove("success", "error");
    notif.classList.add(type, "show");

    setTimeout(() => notif.classList.remove("show"), 2000);
  }
}

function changeQty(productId, change) {
  const input = document.getElementById(`qty-${productId}`);
  if (!input) return; // Stop if element not found

  let value = parseInt(input.value) || 0;
  value += change;

  if (value < 1) value = 1;
  input.value = value;
}

/* ------------------ Budget Page ------------------ */
if (document.getElementById("budgetForm")) {
  let chart;
  const prices = {
    "Rice": 3.50, "Milk": 2.50, "Eggs": 0.50, "Bread": 2.20,
    "Cane Sugar": 2.00, "Cooking Oil": 5.50, "Whole Chicken": 8.00,
    "Instant Noodles": 3.00, "Salmon Fish": 10.00, "Butter": 4.00,
    "Orange Juice": 3.20, "Coffee Beans": 6.00
  };

  let entries = JSON.parse(localStorage.getItem('budgetEntries')) || [];

  function updateDisplay() {
    const table = document.getElementById("entryTable");
    const totalSpan = document.getElementById("totalSpent");
    const topItemSpan = document.getElementById("topItem");
    if (!table || !totalSpan || !topItemSpan) return;

    table.innerHTML = "";
    let total = 0;
    let spendingMap = {};

    entries.forEach((entry, index) => {
      const amount = prices[entry.item] * entry.quantity;
      total += amount;
      spendingMap[entry.item] = (spendingMap[entry.item] || 0) + amount;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.item}</td>
        <td>${entry.quantity}</td>
        <td>RM ${amount.toFixed(2)}</td>
        <td><button onclick="removeEntry(${index})">Remove</button></td>`;
      table.appendChild(row);
    });

    totalSpan.textContent = total.toFixed(2);

    let topItem = "-", maxSpent = 0;
    for (const item in spendingMap) {
      if (spendingMap[item] > maxSpent) {
        maxSpent = spendingMap[item];
        topItem = `${item} (RM ${maxSpent.toFixed(2)})`;
      }
    }
    topItemSpan.textContent = topItem;

    localStorage.setItem("budgetEntries", JSON.stringify(entries));
    updateChart(entries);
  }

  function removeEntry(index) {
    entries.splice(index, 1);
    updateDisplay();
    updateChart(entries);
  }

  document.getElementById("budgetForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const item = document.getElementById("itemName").value;
    const quantity = parseInt(document.getElementById("quantity").value);
    const date = document.getElementById("spendDate").value;

    entries.push({ item, quantity, date });
    updateDisplay();
    updateChart(entries);
    this.reset();
  });

  function updateChart(data) {
    const totalsByItem = {};
    data.forEach(entry => {
      if (!totalsByItem[entry.item]) totalsByItem[entry.item] = 0;
      totalsByItem[entry.item] += prices[entry.item] * entry.quantity;
    });

    const labels = Object.keys(totalsByItem);
    const amounts = Object.values(totalsByItem);
    const ctx = document.getElementById('spendingChart').getContext('2d');

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Spent (RM)',
          data: amounts,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }

  document.getElementById("clearAllBtn").addEventListener("click", function() {
    if (confirm("Are you sure you want to clear all items?")) {
      entries = [];
      updateDisplay();
    }
  });

  updateDisplay();
}

/* ------------------ Contact Page ------------------ */
if (document.getElementById("contactForm")) {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const thankYouMsg = document.getElementById("thankYouMsg");

    if (!form || !thankYouMsg) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!name || !email || !message) {
        alert("Please fill in all required fields.");
        return;
      }

      thankYouMsg.style.display = "block";

      setTimeout(() => {
        thankYouMsg.style.display = "none";
        form.reset();
      }, 2000);
    });
  });
}

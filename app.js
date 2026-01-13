// app.js
document.addEventListener("DOMContentLoaded", () => {
  const itemButtons = document.querySelectorAll(".item");
  const summaryEl = document.getElementById("summary");
  const totalEl = document.getElementById("total");
  const clearBtn = document.getElementById("clear");
  const copyBtn = document.getElementById("copy");
  const cartEl = document.getElementById("cart");


  // cart: { "Zaatar Baladeh": { price: 90000, qty: 2 } }
  const cart = {};

  const fmt = (n) => Number(n).toLocaleString("en-US"); // 90,000 style

  function totalAmount() {
    let sum = 0;
    for (const name in cart) {
      sum += cart[name].price * cart[name].qty;
    }
    return sum;
  }

  function cartIsEmpty() {
    return Object.keys(cart).length === 0;
  }

  function render() {
    if (cartIsEmpty()) {
      summaryEl.textContent = "No items selected";
      totalEl.textContent = "0";
      if (cartEl) cartEl.innerHTML = "";
      return;
    }

    // Keep summary text short in the bar
    const names = Object.keys(cart);
    const short = names.slice(0, 3).join(", ");
    summaryEl.textContent = names.length > 3 ? `${short}…` : short;

    // Build the list with - qty +
    const rows = Object.entries(cart)
      .map(([name, obj]) => {
        return `
          <div class="cart-row" data-name="${escapeHtml(name)}">
            <div class="cart-name">
              <div class="cart-title">${escapeHtml(name)}</div>
              <div class="cart-price muted small">${fmt(obj.price)} each</div>
            </div>

            <div class="cart-controls">
              <button class="qty-btn" type="button" data-action="minus" aria-label="Decrease">−</button>
              <span class="qty">${obj.qty}</span>
              <button class="qty-btn" type="button" data-action="plus" aria-label="Increase">+</button>
            </div>

            <div class="cart-line-total">${fmt(obj.price * obj.qty)}</div>
          </div>
        `;
      })
      .join("");

    if (cartEl) cartEl.innerHTML = rows;
    totalEl.textContent = fmt(totalAmount());
  }


  function addItem(name, price) {
    if (!cart[name]) cart[name] = { price, qty: 0 };
    cart[name].qty += 1;
    render();
  }

  function changeQty(name, delta) {
    if (!cart[name]) return;
    cart[name].qty += delta;
    if (cart[name].qty <= 0) delete cart[name];
    render();
  }

  // Click on menu items => always +1
  itemButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price);
      addItem(name, price);
    });
  });

  // Handle + / - clicks inside the summary area (event delegation)
  // Handle + / - clicks inside the cart list (event delegation)
     (cartEl || document).addEventListener("click", (e) => {
       const btn = e.target.closest("button[data-action]");
       if (!btn) return;

       const row = e.target.closest(".cart-row");
    if (!row) return;

        const name = unescapeHtml(row.getAttribute("data-name"));
        const action = btn.dataset.action;

        if (action === "plus") changeQty(name, +1);
        if (action === "minus") changeQty(name, -1);
     });


  // Clear
  clearBtn.addEventListener("click", () => {
    for (const k in cart) delete cart[k];
    render();
  });

  // Copy order text
  copyBtn.addEventListener("click", async () => {
    if (cartIsEmpty()) return;

    const lines = Object.entries(cart).map(([name, obj]) => {
      return `${obj.qty}x ${name} — ${fmt(obj.price * obj.qty)} LBP`;
    });

    const text = `Order:\n${lines.join("\n")}\n\nTotal: ${fmt(totalAmount())} LBP`;

    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 900);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  });

  // Helpers to safely store names in data attributes
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }
  function unescapeHtml(str) {
    return str.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  }

  render();
});


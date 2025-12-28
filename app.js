function formatLBP(n){
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const selected = new Map(); // name -> price

function updateTotal(){
  let total = 0;
  const names = [];

  for (const [name, price] of selected.entries()){
    total += price;
    names.push(name);
  }

  document.getElementById("total").textContent = formatLBP(total);

  const summaryEl = document.getElementById("summary");
  if (names.length === 0){
    summaryEl.textContent = "No items selected";
    return;
  }

  // Keep it short in the bar
  const summary = names.slice(0, 3).join(", ");
  summaryEl.textContent = names.length > 3 ? `${summary}…` : summary;
}

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".item");

  items.forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price, 10);

      const isSelected = btn.classList.toggle("selected");

      if (isSelected) selected.set(name, price);
      else selected.delete(name);

      updateTotal();
    });
  });

  document.getElementById("clear").addEventListener("click", () => {
    selected.clear();
    document.querySelectorAll(".item.selected").forEach(x => x.classList.remove("selected"));
    updateTotal();
  });

  document.getElementById("copy").addEventListener("click", async () => {
    if (selected.size === 0) return;

    const lines = [];
    let total = 0;
    for (const [name, price] of selected.entries()){
      total += price;
      lines.push(`${name} — ${formatLBP(price)} LBP`);
    }

    const text = `A LA SAJJ - Selection\n${lines.join("\n")}\nTotal: ${formatLBP(total)} LBP`;

    try{
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById("copy");
      const old = btn.textContent;
      btn.textContent = "Copied ✓";
      setTimeout(() => (btn.textContent = old), 1200);
    }catch{
      alert("Copy not supported on this browser.");
    }
  });

  updateTotal();
});

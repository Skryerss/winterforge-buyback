const COEFFICIENT = 0.90;

async function parseInventory() {
  const rawText = document.getElementById("inventoryInput").value.trim();
  const lines = rawText.split("\n");
  const parsed = [];
  const unknownItems = [];

  const typeIDMap = await fetch("typeIDs.json").then(res => res.json());
  const priceMap = await fetch("prices.json").then(res => res.json());

  for (const line of lines) {
    const match = line.match(/(\d+)\s+(.+)/);
    if (!match) continue;
    const quantity = parseInt(match[1]);
    const name = match[2].trim();
    const typeID = typeIDMap[name];
    if (typeID && priceMap[typeID]) {
      parsed.push({ name, quantity, typeID });
    } else {
      unknownItems.push(name);
    }
  }

  let html = '<table><tr><th>Item</th><th>Quantité</th><th>Prix Jita</th><th>Coef</th><th>Prix Final</th><th>Total</th></tr>';
  let total = 0;
  for (const item of parsed) {
    const jita = priceMap[item.typeID];
    const finalPrice = jita * COEFFICIENT;
    const subtotal = finalPrice * item.quantity;
    total += subtotal;
    html += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${jita.toFixed(2)}</td><td>${COEFFICIENT}</td><td>${finalPrice.toFixed(2)}</td><td>${subtotal.toLocaleString()}</td></tr>`;
  }
  html += `</table><p><strong>Total : ${total.toLocaleString()} ISK</strong></p>`;

  if (unknownItems.length) {
    html += `<p style="color:red;">Items inconnus : ${unknownItems.join(", ")}</p>`;
  }

  document.getElementById("results").innerHTML = html;
  if (parsed.length > 0) {
    document.getElementById("contractInfo").style.display = "block";
  }
}
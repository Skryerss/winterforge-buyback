const JITA_REGION_ID = 10000002;
const COEFFICIENT = 0.90;

async function fetchPrices(typeIDs) {
  const idsParam = typeIDs.join(",");
  const url = `https://api.evemarketer.com/ec/marketstat/json?typeid=${idsParam}&regionlimit=${JITA_REGION_ID}`;
  const res = await fetch(url);
  return await res.json();
}

async function parseInventory() {
  const rawText = document.getElementById("inventoryInput").value.trim();
  const lines = rawText.split("\n");
  const parsed = [];
  const unknownItems = [];

  const response = await fetch("typeIDs.json");
  const nameToID = await response.json();

  for (const line of lines) {
    const match = line.match(/(\d+)\s+(.+)/);
    if (!match) continue;
    const quantity = parseInt(match[1]);
    const name = match[2].trim();
    const typeID = nameToID[name];
    if (typeID) {
      parsed.push({ name, quantity, typeID });
    } else {
      unknownItems.push(name);
    }
  }

  const typeIDs = parsed.map(item => item.typeID);
  const priceData = await fetchPrices(typeIDs);
  const priceMap = {};
  priceData.forEach(d => priceMap[d.buy.forQuery.types[0]] = d.buy.max);

  let html = '<table><tr><th>Item</th><th>Quantité</th><th>Prix Jita</th><th>Coef</th><th>Prix Final</th><th>Total</th></tr>';
  let total = 0;
  for (const item of parsed) {
    const jita = priceMap[item.typeID] || 0;
    const finalPrice = jita * COEFFICIENT;
    const subtotal = finalPrice * item.quantity;
    total += subtotal;
    html += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${jita.toFixed(2)}</td><td>${COEFFICIENT}</td><td>${finalPrice.toFixed(2)}</td><td>${subtotal.toLocaleString()}</td></tr>`;
  }
  html += `</table><p><strong>Total : ${total.toLocaleString()} ISK</strong></p>`;

  if (unknownItems.length) {
    html += `<p class="warning">Items inconnus : ${unknownItems.join(", ")}</p>`;
  }

  document.getElementById("results").innerHTML = html;
  if (parsed.length > 0) {
    document.getElementById("contractInfo").style.display = "block";
  }
}
const EXCHANGES_URL = "https://api.coinlore.net/api/exchanges/";
const MARKETS_URL = `https://api.coinlore.net/api/coin/markets/?id=90`;
const URL_COINS = `https://api.coinlore.net/api/tickers/`;

let exchangesData = [], coinsData = [], chartExchanges, chartMarkets;

const el = (id) => document.getElementById(id);

// Formatear a USD
const fmtUSD = (n) => {
  if (!n) return "—";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";
  return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Paleta de colores
const getColorPalette = (count) => {
  const base = [
    "#06d6a0", "#4cc9f0", "#f72585", "#ffd166", "#48bfe3",
    "#8338ec", "#ff7b00", "#80ed99", "#00f5d4", "#a2d2ff",
    "#ef476f", "#06b6d4", "#22c55e", "#f59e0b", "#38bdf8",
  ];
  return Array.from({ length: count }, (_, i) => base[i % base.length]);
};

// Cargar datos y renderizar todo
const refresh = async () => {
  try {
    // === Coins ===
    const resCoins = await axios.get(URL_COINS);
    coinsData = resCoins.data.data;
    console.log("Data API COINS:", coinsData);

    // Promedio de precios
    const precios = coinsData.map(c => parseFloat(c.price_usd));
    const promedio = precios.reduce((a, b) => a + b, 0) / precios.length;
    el('promCoins').textContent = fmtUSD(promedio);

    // Coin más cara
    const masCostosa = coinsData.reduce((max, coin) =>
      parseFloat(coin.price_usd) > parseFloat(max.price_usd) ? coin : max
    );
    el('topCoin').textContent = `${masCostosa.name} - ${fmtUSD(masCostosa.price_usd)}`;

    // === Exchanges ===
    const resEx = await axios.get(MARKETS_URL);
    exchangesData = resEx.data;
    console.log("Data API EXCHANGES:", exchangesData);

    el('totalEx').textContent = coinsData.length;

    // === Top 10 Coins para gráfico ===
    const topCoins = coinsData
      .map(c => ({ name: c.name, price_usd: parseFloat(c.price_usd) }))
      .filter(c => !isNaN(c.price_usd))
      .sort((a, b) => b.price_usd - a.price_usd)
      .slice(0, 10);

    renderCoinChart(topCoins);

    // === Top 10 Exchanges para gráfico ===
    const topExchanges = exchangesData
      .map(e => ({ name: e.name, volume: parseFloat(e.volume) }))
      .filter(e => !isNaN(e.volume))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    renderVolumeChart(topExchanges);

    // === Renderizar tablas ===
    renderCoinsTable(coinsData);
    renderExchangesTable(exchangesData);

  } catch (error) {
    console.error("Error cargando datos:", error);
  }
};

// === GRAFICOS ===
function renderCoinChart(dataTop) {
  const labels = dataTop.map(x => x.name);
  const volumes = dataTop.map(x => x.price_usd);
  const colors = getColorPalette(labels.length);
  const ctx = el("chartCoin").getContext("2d");
  if (chartExchanges) chartExchanges.destroy();

  chartExchanges = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Precio (USD)",
        data: volumes,
        backgroundColor: colors.map(c => c + "cc"),
        borderColor: colors,
        borderWidth: 1.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#c2c8d6" }, grid: { color: "rgba(255,255,255,0.06)" } },
        y: { ticks: { color: "#c2c8d6", callback: v => fmtUSD(v) }, grid: { color: "rgba(255,255,255,0.06)" } }
      },
      plugins: { legend: { labels: { color: "#d6dbea" } } }
    }
  });
}

function renderVolumeChart(dataTop) {
  const labels = dataTop.map(x => x.name).reverse();
  const volumes = dataTop.map(x => x.volume).reverse();
  const colors = getColorPalette(labels.length);
  const ctx = el("chartExchanges").getContext("2d");
  if (chartMarkets) chartMarkets.destroy();

  chartMarkets = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Volumen (USD)",
        data: volumes,
        backgroundColor: colors.map(c => c + "cc"),
        borderColor: colors,
        borderWidth: 1.5,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#c2c8d6", callback: v => fmtUSD(v) }, grid: { color: "rgba(255,255,255,0.06)" } },
        y: { ticks: { color: "#c2c8d6" }, grid: { color: "rgba(255,255,255,0.06)" } }
      },
      plugins: { legend: { labels: { color: "#d6dbea" } } }
    }
  });
}

// === TABLAS ===
function renderCoinsTable(data) {
  const tbody = el("coinsTableBody");
  tbody.innerHTML = "";
  data.forEach(coin => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${coin.rank}</td>
      <td>${coin.name}</td>
      <td>${coin.symbol}</td>
      <td>${parseFloat(coin.price_btc).toFixed(8)}</td>
      <td>${fmtUSD(parseFloat(coin.price_usd))}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderExchangesTable(data) {
  const tbody = el("exchangesTableBody");
  tbody.innerHTML = "";
  data.forEach((ex, i) => {
    const priceUsd = ex.price_usd ? fmtUSD(parseFloat(ex.price_usd)) : "-";
    const volumeUsd = ex.volume ? fmtUSD(parseFloat(ex.volume)) : "-";
    const base = ex.base || "-";
    const quote = ex.quote || "-";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${ex.name}</td>
      <td>${base}/${quote}</td>
      <td>${priceUsd}</td>
      <td>${volumeUsd}</td>
    `;
    tbody.appendChild(tr);
  });
}

// === BUSCADORES ===
el("sbCoins").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderCoinsTable(coinsData.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)));
});

el("sbExchanges").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderExchangesTable(exchangesData.filter(ex =>
    ex.name.toLowerCase().includes(q) ||
    (ex.base && ex.base.toLowerCase().includes(q)) ||
    (ex.quote && ex.quote.toLowerCase().includes(q))
  ));
});


document.addEventListener("DOMContentLoaded", () => {
  refresh();
  el("btnReload").addEventListener("click", refresh);
});

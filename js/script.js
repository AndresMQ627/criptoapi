const EXCHANGES_URL = "https://api.coinlore.net/api/exchanges/";
const MARKETS_URL = `https://api.coinlore.net/api/coin/markets/?id=90`;
const URL_COINS =`https://api.coinlore.net/api/tickers/`
let exchangesData = [],coinsData = [], chartExchanges,chartMarkets;


//https://www.coinlore.com/es/cryptocurrency-data-api

const el = (id) => document.getElementById(id);

//En vez de usar Fetch utilicé axios
let refresh = async ()=>{
    //Carga de datos de criptomonedas
    const res =response = await axios.get(URL_COINS); 
    let data= res.data.data
    coinsData = data
    console.log("Data API COINS:", coinsData);

     const precios = coinsData.map(coin => parseFloat(coin.price_usd));

      
        const suma = precios.reduce((acumulador, valorActual) => acumulador + valorActual, 0);

      
        const promedio = suma / precios.length;

    
        const h2Promedio = document.getElementById('promCoins');
        h2Promedio.textContent = fmtUSD(promedio);

    //carga de datos de casas de cambios
    
    const res2 =response = await axios.get(MARKETS_URL); 
    let data2= res.data
    exchangesData=data2
    console.log("Data API EXCHANGES:", exchangesData);

    const h2Exchanges = document.getElementById('totalEx');
    h2Exchanges.textContent = ` ${exchangesData.data.length}`;
    
    let arr_1=[
        {name:"Bitcoin",price_usd:100},
        {name:"Etherium",price_usd:200},
        {name:"A",price_usd:300},
        {name:"B",price_usd:500},
    ]
    renderCoinChart(arr_1);

}
//función solo para devolver los colores
const getColorPalette = (count) => {
  const base = [
    "#06d6a0",
    "#4cc9f0",
    "#f72585",
    "#ffd166",
    "#48bfe3",
    "#8338ec",
    "#ff7b00",
    "#80ed99",
    "#00f5d4",
    "#a2d2ff",
    "#ef476f",
    "#06b6d4",
    "#22c55e",
    "#f59e0b",
    "#38bdf8",
  ];
  return Array.from({ length: count }, (_, i) => base[i % base.length]);
};
//Función para formatear a USD
const fmtUSD = (n) => {
  if (!n) return "—";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";
  return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
};
//CARGAR GRAFICO 
function renderCoinChart(dataTop) {
  const labels = dataTop.map((x) => x.name);
  const volumes = dataTop.map((x) => x.price_usd);
  const colors = getColorPalette(labels.length);
  const ctx = el("chartCoin").getContext("2d");
  if (chartExchanges) chartExchanges.destroy();
  chartExchanges = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "COINS",
          data: volumes,
          backgroundColor: colors.map((c) => c + "cc"),
          borderColor: colors,
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: "#c2c8d6" },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
        y: {
          ticks: { color: "#c2c8d6", callback: (v) => fmtUSD(v) },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
      },
      plugins: { legend: { labels: { color: "#d6dbea" } } },
    },
  });
}

document.addEventListener("DOMContentLoaded", () => {
    refresh();
    //EVENTOS
    el("btnReload").addEventListener("click", () => refresh());
});

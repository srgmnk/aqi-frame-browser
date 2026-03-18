const OWNER = "srgmnk";
const REPO = "AQI-Frame";
const BRANCH = "main";
const IMAGES_DIR = "images";
const REGISTRY_FILE = "real_images.json";
const START = 0;
const END = 301;

const rawBase = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${IMAGES_DIR}`;
const registryUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${REGISTRY_FILE}`;

async function fetchRegistry() {
  const response = await fetch(registryUrl);
  if (!response.ok) {
    throw new Error(`Registry fetch error: ${response.status}`);
  }
  return response.json();
}

function buildItemsForAqi(aqi) {
  const items = [];

  // базовая картинка
  items.push({
    fileName: `${aqi}.png`,
    variant: 0,
  });

  // пробуем варианты -1, -2, -3... (до разумного лимита)
  for (let i = 1; i <= 6; i++) {
    items.push({
      fileName: `${aqi}-${i}.png`,
      variant: i,
    });
  }

  return items;
}

function createEmptyCard(aqi) {
  const card = document.createElement("div");
  card.className = "card empty single";

  const number = document.createElement("div");
  number.className = "number";
  number.textContent = aqi;

  const placeholder = document.createElement("div");
  placeholder.className = "placeholder-box";

  card.appendChild(number);
  card.appendChild(placeholder);

  return card;
}

function createFilledCard(aqi, items) {
  const card = document.createElement("div");
  card.className = `card ${items.length === 1 ? "single" : "multi"}`;

  const number = document.createElement("div");
  number.className = "number";
  number.textContent = aqi;

  const thumbs = document.createElement("div");
  thumbs.className = "thumbs";

  items.forEach(item => {
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = `${rawBase}/${item.fileName}`;
    img.loading = "lazy";

    // если картинка не существует — просто скрываем
    img.onerror = () => {
      img.remove();
    };

    thumbs.appendChild(img);
  });

  card.appendChild(number);
  card.appendChild(thumbs);

  return card;
}

function render(registry) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  for (let aqi = START; aqi <= END; aqi++) {
    const isReal = Boolean(registry[String(aqi)]);

    let card;

    if (!isReal) {
      card = createEmptyCard(aqi);
    } else {
      const items = buildItemsForAqi(aqi);
      card = createFilledCard(aqi, items);
    }

    grid.appendChild(card);
  }
}

async function main() {
  try {
    const registry = await fetchRegistry();
    render(registry);
  } catch (error) {
    console.error(error);
    document.getElementById("grid").innerHTML =
      `<div style="color:#999;">Failed to load data.</div>`;
  }
}

main();

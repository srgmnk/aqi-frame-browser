const OWNER = "srgmnk";
const REPO = "AQI-Frame";
const BRANCH = "main";
const IMAGES_DIR = "images";
const START = 0;
const END = 301;

const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${IMAGES_DIR}?ref=${BRANCH}`;
const rawBase = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${IMAGES_DIR}`;

async function fetchImages() {
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  return response.json();
}

function parseAqiFileName(name) {
  const match = name.match(/^(\d+)(?:-(\d+))?\.png$/i);
  if (!match) return null;

  return {
    aqi: Number(match[1]),
    variant: match[2] ? Number(match[2]) : 0,
    fileName: name,
  };
}

function buildMap(files) {
  const map = new Map();

  for (let i = START; i <= END; i += 1) {
    map.set(i, []);
  }

  for (const file of files) {
    if (file.type !== "file") continue;

    const parsed = parseAqiFileName(file.name);
    if (!parsed) continue;
    if (parsed.aqi < START || parsed.aqi > END) continue;

    map.get(parsed.aqi).push(parsed);
  }

  for (const [aqi, items] of map.entries()) {
    items.sort((a, b) => a.variant - b.variant);
    map.set(aqi, items);
  }

  return map;
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

  for (const item of items) {
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = `${rawBase}/${item.fileName}`;
    img.alt = item.fileName;
    img.loading = "lazy";
    thumbs.appendChild(img);
  }

  card.appendChild(number);
  card.appendChild(thumbs);

  return card;
}

function render(map) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  for (let aqi = START; aqi <= END; aqi += 1) {
    const items = map.get(aqi) || [];
    const card = items.length === 0
      ? createEmptyCard(aqi)
      : createFilledCard(aqi, items);

    grid.appendChild(card);
  }
}

async function main() {
  try {
    const files = await fetchImages();
    const map = buildMap(files);
    render(map);
  } catch (error) {
    console.error(error);
    const grid = document.getElementById("grid");
    grid.innerHTML = `<div style="color:#999;">Failed to load images.</div>`;
  }
}

main();

/* TaskFlow kawaii sticker library + helpers (pure SVG, no external images) */
const OUT = "#b07a92", INK = "#6b4a5c";
const ST = `stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const P = (d, f) => `<path d="${d}" fill="${f}" ${ST}/>`;
const C = (cx, cy, r, f) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" ${ST}/>`;
const Cf = (cx, cy, r, f) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`;
const E = (cx, cy, rx, ry, f, rot = 0) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${ST}${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ""}/>`;
const Ef = (cx, cy, rx, ry, f, rot = 0) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ""}/>`;
const line = d => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
const eyes = (cx, cy, g = 10, r = 3.2) => `<circle cx="${cx - g}" cy="${cy}" r="${r}" fill="${INK}"/><circle cx="${cx + g}" cy="${cy}" r="${r}" fill="${INK}"/><circle cx="${cx - g + r * .35}" cy="${cy - r * .35}" r="${r * .32}" fill="#fff"/><circle cx="${cx + g + r * .35}" cy="${cy - r * .35}" r="${r * .32}" fill="#fff"/>`;
const blush = (cx, cy, g = 16) => `<ellipse cx="${cx - g}" cy="${cy}" rx="4.6" ry="3" fill="#ff8fb0" opacity=".55"/><ellipse cx="${cx + g}" cy="${cy}" rx="4.6" ry="3" fill="#ff8fb0" opacity=".55"/>`;
const mouth = (cx, cy, w = 3.5) => `<path d="M${cx - w} ${cy}q${w / 2} ${w * .9} ${w} 0q${w / 2} ${w * .9} ${w} 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
const face = (cx, cy, g = 10, r = 3.2) => eyes(cx, cy, g, r) + blush(cx, cy + 7, g + 7) + mouth(cx, cy + 6);
const spark = (x, y, s = 5, f = "#ffe08a") => `<path d="M${x} ${y - s}Q${x + s * .18} ${y - s * .18} ${x + s} ${y}Q${x + s * .18} ${y + s * .18} ${x} ${y + s}Q${x - s * .18} ${y + s * .18} ${x - s} ${y}Q${x - s * .18} ${y - s * .18} ${x} ${y - s}Z" fill="${f}" stroke="${OUT}" stroke-width="1.5" stroke-linejoin="round"/>`;
const rot = (n, fn) => Array.from({ length: n }, (_, i) => fn(i * 360 / n)).join("");

const xmlEsc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const TEXT_COLORS = ["#ffd6e4", "#fff0b8", "#d5f2df", "#d8ebff", "#e6dcff", "#ffe1cc"];
function wrapWords(text, max = 10) {
  const lines = []; let cur = "";
  String(text).split(/\s+/).filter(Boolean).forEach(w => { if (cur && (cur + " " + w).length > max) { lines.push(cur); cur = w; } else cur = (cur ? cur + " " : "") + w; });
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}
function textStickerSVG(text, color = "#ffd6e4") {
  const lines = wrapWords(text), n = lines.length || 1, maxLen = Math.max(...lines.map(l => l.length), 4);
  const fs = Math.max(9, Math.min(17, 70 / (maxLen * .58))), lh = fs * 1.2, h = Math.min(86, n * lh + 26), y0 = 50 - h / 2;
  const body = lines.map((l, i) => `<text x="50" y="${(50 - (n - 1) * lh / 2 + i * lh + fs * .34).toFixed(1)}" text-anchor="middle" font-size="${fs.toFixed(1)}" font-weight="700" fill="#7a4d63" font-family="Caveat, 'Segoe Script', 'Comic Sans MS', cursive">${xmlEsc(l)}</text>`).join("");
  return `<rect x="6" y="${y0}" width="88" height="${h}" rx="20" fill="${color}" ${ST}/><rect x="11" y="${y0 + 5}" width="78" height="${h - 10}" rx="15" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 4" opacity=".9"/>${body}<path d="M14 ${y0 + 1}c-4-4-9 1-4 5 4 3 4 3 4 3s0 0 4-3c5-4 0-9-4-5z" fill="#ff8fb0" stroke="${OUT}" stroke-width="1.6"/>${spark(88, y0 + h - 2, 6)}`;
}

const STICKER_LIBRARY = [
  /* ---------- Animals ---------- */
  { id: "cat", name: "Mochi kitty", tags: ["Animals", "Popular"], svg: P("M23 38 L17 11 L41 25Q50 21 59 25L83 11 L77 38Q86 64 50 72Q14 64 23 38Z", "#fff0f4") + `<path d="M25 25 L24 17 L33 22Z M75 25 L76 17 L67 22Z" fill="#ffc4d6"/>` + face(50, 46) + line("M17 50 L7 48 M17 56 L7 58 M83 50 L93 48 M83 56 L93 58") },
  { id: "bunny", name: "Peach bunny", tags: ["Animals", "Popular"], svg: E(36, 25, 9, 22, "#fff4f7", -6) + Ef(36, 27, 4.3, 14, "#ffc4d6", -6) + E(64, 25, 9, 22, "#fff4f7", 6) + Ef(64, 27, 4.3, 14, "#ffc4d6", 6) + C(50, 58, 28, "#fff4f7") + face(50, 56) },
  { id: "bear", name: "Honey bear", tags: ["Animals"], svg: C(28, 28, 13, "#d9a98a") + Cf(28, 28, 6, "#f3cdb6") + C(72, 28, 13, "#d9a98a") + Cf(72, 28, 6, "#f3cdb6") + C(50, 54, 31, "#e9c4a6") + E(50, 63, 12, 9, "#fbe8d8") + eyes(50, 47, 13) + blush(50, 58, 22) + Ef(50, 58, 4.5, 3.2, INK) + mouth(50, 65, 3) },
  { id: "panda", name: "Bamboo panda", tags: ["Animals", "Popular"], svg: C(27, 27, 12, "#4d4352") + C(73, 27, 12, "#4d4352") + C(50, 55, 31, "#ffffff") + E(37, 50, 7.5, 10, "#4d4352", 20) + E(63, 50, 7.5, 10, "#4d4352", -20) + Cf(37, 49, 2.8, "#fff") + Cf(63, 49, 2.8, "#fff") + Cf(38, 48, 1, INK) + Cf(64, 48, 1, INK) + Ef(50, 61, 4.5, 3, "#4d4352") + mouth(50, 66, 3) + blush(50, 62, 25) },
  { id: "puppy", name: "Biscuit puppy", tags: ["Animals"], svg: E(22, 44, 10, 20, "#c99b72", 12) + E(78, 44, 10, 20, "#c99b72", -12) + E(50, 54, 29, 27, "#f8e3c8") + E(50, 64, 14, 10, "#fff8ee") + eyes(50, 48, 13) + blush(50, 58, 24) + Ef(50, 59, 5, 3.5, INK) + mouth(50, 66, 3.5) + E(50, 74, 4, 5, "#ff9fb8") },
  { id: "duck", name: "Ducky", tags: ["Animals"], svg: E(20, 58, 6, 10, "#ffd24f", 18) + E(80, 58, 6, 10, "#ffd24f", -18) + C(50, 54, 31, "#ffe27a") + line("M44 24Q46 13 52 19M53 22Q58 12 63 20") + eyes(50, 48, 13) + blush(50, 58, 23) + E(50, 61, 11, 6.5, "#ffb25e") },
  { id: "frog", name: "Froggy", tags: ["Animals"], svg: C(31, 31, 13, "#c6ecb0") + C(69, 31, 13, "#c6ecb0") + E(50, 60, 36, 25, "#c6ecb0") + Cf(31, 31, 7, "#fff") + Cf(69, 31, 7, "#fff") + Cf(32, 32, 3.8, INK) + Cf(68, 32, 3.8, INK) + `<path d="M34 64Q50 78 66 64" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>` + blush(50, 63, 27) + Cf(46, 52, 1.4, OUT) + Cf(54, 52, 1.4, OUT) },
  { id: "penguin", name: "Pebble penguin", tags: ["Animals"], svg: E(21, 60, 6, 15, "#6b789c", 18) + E(79, 60, 6, 15, "#6b789c", -18) + E(38, 92, 8, 3.5, "#ffb25e") + E(62, 92, 8, 3.5, "#ffb25e") + E(50, 57, 28, 34, "#7d8bb0") + E(50, 65, 19, 24, "#ffffff") + E(50, 47, 17, 11, "#ffffff") + eyes(50, 46, 9) + blush(50, 53, 15) + P("M44 51 L56 51 L50 58Z", "#ffb25e") },
  { id: "chick", name: "Chickie", tags: ["Animals"], svg: E(21, 60, 6, 11, "#ffd24f", 16) + E(79, 60, 6, 11, "#ffd24f", -16) + C(50, 56, 30, "#ffe784") + line("M50 26Q44 14 40 18M50 26Q52 11 58 14M50 26Q58 16 64 22") + eyes(50, 49, 13) + blush(50, 58, 22) + P("M44 56 L56 56 L50 64Z", "#ffa84f") },
  { id: "fox", name: "Foxy", tags: ["Animals"], svg: P("M13 22 L38 34 Q50 30 62 34 L87 22 L83 58 Q78 78 50 82 Q22 78 17 58Z", "#f6a96b") + `<path d="M17 58 Q30 62 50 74 Q70 62 83 58 Q78 78 50 82 Q22 78 17 58Z" fill="#fff"/><path d="M19 29 L31 35 L21 46Z M81 29 L69 35 L79 46Z" fill="#fff3e6"/>` + eyes(50, 52, 13) + blush(50, 62, 23) + Ef(50, 66, 4.5, 3.2, INK) + mouth(50, 72, 3) },
  /* ---------- Fruits ---------- */
  { id: "strawberry", name: "Berry baby", tags: ["Fruits", "Popular"], svg: P("M50 84 C20 68 12 42 22 33 C33 24 43 31 50 29 C57 31 67 24 78 33 C88 42 80 68 50 84Z", "#ff8ea1") + P("M50 31 L38 18 L46 25 L50 13 L54 25 L62 18Z", "#8fd0a0") + [[34, 44], [66, 44], [28, 58], [72, 58], [50, 70], [42, 66], [58, 66]].map(([x, y]) => Ef(x, y, 1.8, 2.6, "#fff3b8")).join("") + face(50, 54) },
  { id: "cherries", name: "Cherry pair", tags: ["Fruits"], svg: `<path d="M34 58 Q40 32 58 16 M68 58 Q62 34 58 16" fill="none" stroke="#6f9f78" stroke-width="3.5" stroke-linecap="round"/>` + E(68, 18, 11, 5.5, "#a6dcb1", -20) + C(33, 72, 16, "#f0607a") + C(68, 72, 16, "#f0607a") + face(33, 70, 6, 2.5) + face(68, 70, 6, 2.5) },
  { id: "peach", name: "Peachy", tags: ["Fruits"], svg: P("M50 30 C14 14 16 66 50 82 C84 66 86 14 50 30Z", "#ffb3a7") + `<path d="M50 30 Q52 52 50 80" fill="none" stroke="#ff9d90" stroke-width="2" opacity=".6"/>` + P("M50 30 Q48 14 64 10 Q64 26 50 30Z", "#9fd9a8") + face(50, 52) },
  { id: "watermelon", name: "Melon slice", tags: ["Fruits", "Popular"], svg: P("M8 36 A42 42 0 0 0 92 36 Z", "#8fd9a0") + `<path d="M15 36 A35 35 0 0 0 85 36 Z" fill="#ff7f93"/>` + Ef(32, 50, 2, 3.2, INK, -20) + Ef(68, 50, 2, 3.2, INK, 20) + Ef(50, 66, 2, 3.2, INK) + face(50, 47, 11, 3) },
  { id: "lemon", name: "Lemon drop", tags: ["Fruits"], svg: P("M12 54 Q10 44 18 42 Q40 22 78 40 Q90 46 88 56 Q86 66 76 66 Q50 80 24 64 Q12 62 12 54Z", "#ffe86a") + P("M70 38 Q80 22 92 26 Q88 40 70 38Z", "#9fd9a8") + face(50, 52) },
  { id: "avocado", name: "Avo-cutie", tags: ["Fruits"], svg: P("M50 10 C66 10 79 40 79 62 C79 80 66 91 50 91 C34 91 21 80 21 62 C21 40 34 10 50 10Z", "#b8dc8a") + `<path d="M50 26 C60 26 68 46 68 62 C68 74 60 83 50 83 C40 83 32 74 32 62 C32 46 40 26 50 26Z" fill="#f1f3b0"/>` + C(50, 66, 12, "#c99a73") + face(50, 64, 6, 2.6) },
  /* ---------- Flowers ---------- */
  { id: "daisy", name: "Daisy", tags: ["Flowers"], svg: rot(10, a => `<ellipse cx="50" cy="22" rx="8.5" ry="16" fill="#fff" ${ST} transform="rotate(${a} 50 50)"/>`) + C(50, 50, 15, "#ffd966") + face(50, 48, 6, 2.4) },
  { id: "tulip", name: "Tulip", tags: ["Flowers", "Popular"], svg: line("M50 92 L50 58") + P("M50 82 Q28 80 24 62 Q42 64 50 80Z", "#9fd9a8") + P("M50 84 Q72 82 76 64 Q58 66 50 82Z", "#9fd9a8") + P("M28 20 L40 32 L50 18 L60 32 L72 20 Q78 56 50 64 Q22 56 28 20Z", "#ff9fb8") + face(50, 46, 8, 2.6) },
  { id: "sunflower", name: "Sunny flower", tags: ["Flowers"], svg: rot(12, a => `<ellipse cx="50" cy="20" rx="7.5" ry="16" fill="#ffd45a" ${ST} transform="rotate(${a} 50 50)"/>`) + C(50, 50, 18, "#c98f5b") + face(50, 48, 7, 2.6) },
  { id: "sakura", name: "Sakura", tags: ["Flowers", "Popular"], svg: rot(5, a => `<ellipse cx="50" cy="24" rx="14" ry="20" fill="#ffd0e2" ${ST} transform="rotate(${a} 50 50)"/>`) + C(50, 50, 11, "#fff3f8") + face(50, 49, 5, 2) },
  { id: "clover", name: "Lucky clover", tags: ["Flowers"], svg: line("M50 56 Q54 78 62 92") + C(36, 36, 16, "#9edaa8") + C(64, 36, 16, "#9edaa8") + C(36, 62, 16, "#9edaa8") + C(64, 62, 16, "#9edaa8") + Cf(50, 49, 9, "#9edaa8") + face(50, 47, 6, 2.4) },
  { id: "blossom", name: "Petal friend", tags: ["Flowers"], svg: rot(6, a => `<ellipse cx="50" cy="24" rx="11" ry="20" fill="#f7c5d8" ${ST} transform="rotate(${a} 50 50)"/>`) + C(50, 50, 14, "#ffe39a") + face(50, 49, 5, 2.2) },
  /* ---------- Decor ---------- */
  { id: "heart", name: "Love note", tags: ["Decor", "Popular"], svg: P("M50 84 C32 68 8 52 17 30 C26 12 46 19 50 34 C58 17 80 14 86 33 C94 54 68 70 50 84Z", "#f5a9c1") + Ef(28, 30, 5, 3, "#fff", -35) + face(50, 50, 10) },
  { id: "bow", name: "Ribbon bow", tags: ["Decor"], svg: P("M48 50 C20 12 4 26 16 54 C25 72 40 62 48 54Z", "#f4b5cb") + P("M52 50 C80 12 96 26 84 54 C75 72 60 62 52 54Z", "#f4b5cb") + P("M44 56 L36 84 L48 76 L50 60Z", "#f4b5cb") + P("M56 56 L64 84 L52 76 L50 60Z", "#f4b5cb") + C(50, 51, 10, "#ffd3e2") + eyes(50, 50, 4, 1.8) },
  { id: "cloud", name: "Cloud cutie", tags: ["Decor", "Popular"], svg: P("M26 74 Q8 74 11 56 Q14 42 30 44 Q34 24 54 27 Q72 28 74 45 Q92 44 91 60 Q90 74 74 74Z", "#eaf4ff") + face(50, 55, 11) },
  { id: "rainbow", name: "Mini rainbow", tags: ["Decor"], svg: [["#ff9fb8", 40], ["#ffe08a", 31], ["#a8e6bd", 22], ["#a9d4ff", 13]].map(([c, r]) => `<path d="M${50 - r} 72 A${r} ${r} 0 0 1 ${50 + r} 72" fill="none" stroke="${c}" stroke-width="9"/>`).join("") + C(13, 74, 10, "#fff") + C(87, 74, 10, "#fff") + `<path d="M8 72 Q13 66 18 72 M82 72 Q87 66 92 72" fill="none" stroke="${OUT}" stroke-width="0"/>` + eyes(13, 74, 0, 2) + eyes(87, 74, 0, 2) },
  { id: "cupcake", name: "Cupcake", tags: ["Decor"], svg: P("M26 54 L74 54 L68 90 L32 90Z", "#ffd6a5") + line("M38 58 L40 88 M50 58 L50 88 M62 58 L60 88") + P("M21 56 Q16 38 34 38 Q36 20 50 20 Q64 20 66 38 Q84 38 79 56Z", "#ffc2d6") + C(50, 16, 6, "#f0607a") + face(50, 46, 9, 3) },
  { id: "balloon", name: "Party balloon", tags: ["Decor"], svg: `<path d="M50 74 Q40 84 52 90 Q60 94 50 99" fill="none" stroke="${OUT}" stroke-width="2.4" stroke-linecap="round"/>` + E(50, 40, 27, 32, "#ff9fb8") + P("M46 72 L54 72 L50 66Z", "#ff9fb8") + Ef(38, 24, 4, 7, "#fff", 30) + face(50, 42, 10) },
  { id: "gift", name: "Gift box", tags: ["Decor"], svg: P("M20 44 H80 V88 H20Z", "#c7b5f0") + P("M16 32 H84 V46 H16Z", "#dccffa") + `<rect x="45" y="32" width="10" height="56" fill="#ffd966" ${ST}/>` + P("M50 32 C34 14 22 26 38 32Z", "#ffd966") + P("M50 32 C66 14 78 26 62 32Z", "#ffd966") + face(50, 66, 14, 3) },
  /* ---------- Symbols ---------- */
  { id: "star", name: "Twinkle star", tags: ["Symbols", "Popular"], svg: P("M50 8 L62 36 L92 39 L69 58 L76 88 L50 72 L24 88 L31 58 L8 39 L38 36Z", "#ffe29b") + face(50, 50, 9, 3) },
  { id: "sparkle", name: "Sparkles", tags: ["Symbols"], svg: spark(46, 52, 38, "#ffe08a") + spark(80, 20, 13, "#ffc4d6") + spark(80, 82, 9, "#cfe3ff") },
  { id: "moon", name: "Sleepy moon", tags: ["Symbols"], svg: P("M64 12 A38 38 0 1 0 88 62 A30 30 0 1 1 64 12Z", "#ffe69a") + `<path d="M34 54q4 4 8 0M34 66q4 3 8 0" fill="none" stroke="${INK}" stroke-width="0"/>` + `<path d="M30 52 q4 4 8 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>` + blush(36, 62, 0) + mouth(40, 66, 3) + spark(82, 22, 7, "#fff3b8") },
  { id: "sun", name: "Sunny", tags: ["Symbols"], svg: rot(8, a => `<path d="M50 8 V20" stroke="#f3b84a" stroke-width="6" stroke-linecap="round" transform="rotate(${a} 50 50)"/>`) + C(50, 50, 25, "#ffd966") + face(50, 49, 9, 3) },
  { id: "check", name: "Done badge", tags: ["Symbols", "Popular"], svg: C(50, 50, 38, "#b8e6c6") + `<path d="M30 52 L45 67 L72 35" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` + spark(82, 16, 7, "#ffe08a") },
  { id: "bolt", name: "Power bolt", tags: ["Symbols"], svg: P("M58 8 L24 54 L46 54 L40 92 L76 42 L54 42Z", "#ffe27a") + eyes(50, 52, 6, 2.4) + mouth(50, 62, 3) },
  /* ---------- Popular phrases ---------- */
  ...["you got this!", "so proud of you", "tiny wins!", "good vibes only", "stay cute", "one step at a time", "believe in you"].map((t, i) => ({ id: "txt" + i, name: t, tags: ["Popular"], svg: textStickerSVG(t, TEXT_COLORS[i % TEXT_COLORS.length]) }))
];

/* ---------- helpers ---------- */
const stickerSVG = (inner, size = 512) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${inner}</svg>`;
function loadImage(src) { return new Promise((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src; }); }
async function stickerPngBlob(item, size = 512) {
  let src, revoke = null;
  if (item.image) src = item.image;
  else { revoke = URL.createObjectURL(new Blob([stickerSVG(item.svg, size)], { type: "image/svg+xml;charset=utf-8" })); src = revoke; }
  const img = await loadImage(src);
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const ctx = cv.getContext("2d"), s = Math.min(size / img.width, size / img.height) * (item.image ? .92 : 1);
  ctx.drawImage(img, (size - img.width * s) / 2, (size - img.height * s) / 2, img.width * s, img.height * s);
  if (revoke) URL.revokeObjectURL(revoke);
  return new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error("png")), "image/png"));
}

/* ---------- rotating cute messages for the extra pages ---------- */
const MOTTOS = {
  diary: [
    "Write it down, let it float away.", "Today's page is yours — be honest and gentle.", "Small moments make the sweetest stories.",
    "What made you smile today?", "Your feelings are welcome here.", "Even messy thoughts deserve a cozy page.",
    "Tiny notes now, big memories later.", "Be kind to the person writing this page.", "One honest sentence is enough for today.",
    "Your story matters — keep writing it.", "Let your thoughts bloom on the page.", "Dear diary, today I'm proud of…",
    "Breathe in, write out, feel lighter.", "Every page is a fresh little start."
  ],
  stickers: [
    "A tiny illustrated world of friends, fruits and pretty little details.", "Pick a friend, press copy, paste it anywhere!",
    "Sprinkle a little cute on everything.", "Every sticker is a tiny hug for your day.", "Mix, match and make it yours!",
    "Fruits, flowers and fluffy friends, all in one place.", "Cuteness level: maximum.", "Decorate your day, one sticker at a time.",
    "Make a sticker of your own — the shelf has room.", "Little doodles make big smiles.", "Collect them all, share them everywhere.",
    "A sticker a day keeps the grumpies away."
  ],
  memories: [
    "A little garden for the moments you want to keep close.", "Plant a memory today and watch it bloom later.",
    "Happy moments grow when you save them.", "Every picture is a tiny flower of your story.", "Collect the sunny days you'll want to revisit.",
    "Water your good memories with a caption.", "Today's smile could be tomorrow's favorite memory.", "Photos fade, little gardens keep them bright.",
    "Keep the little things — they turn out to be the big things.", "Your best days deserve a place to grow."
  ]
};
function startMotto(el, key, glyph = "♡") {
  if (!el) return;
  const bank = MOTTOS[key], visitKey = "taskflow-motto-" + key;
  const day = Math.floor(Date.now() / 86400000), visit = Number(sessionStorage.getItem(visitKey) || 0) + 1;
  sessionStorage.setItem(visitKey, String(visit));
  let i = (day * 3 + visit * 5) % bank.length;
  const show = () => { el.textContent = `${glyph} ${bank[i % bank.length]} ${glyph}`; };
  show();
  const timer = setInterval(() => {
    if (!document.body.contains(el)) return clearInterval(timer);
    if (el.closest("[hidden]")) return;
    el.classList.add("swap");
    setTimeout(() => { i++; show(); el.classList.remove("swap"); }, 350);
  }, 8000);
}

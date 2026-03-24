const fs = require('fs');
const path = require('path');
const { createCanvas, registerFont } = require('canvas');

// --- Config ---
const WIDTH = 1080;
const HEIGHT = 1920;
const PADDING = 60;
const BG_COLOR = '#0d1117';
const TEXT_COLOR = '#e6edf3';
const ACCENT_COLOR = '#b8e600';
const MUTED_COLOR = '#8b949e';
const BORDER_COLOR = '#30363d';

// --- Helper: wrap text ---
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// --- Main ---
function generateReel(fact, category, outputPath) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle gradient overlay (green glow top-right)
  const grad = ctx.createRadialGradient(WIDTH, 0, 0, WIDTH, 0, 600);
  grad.addColorStop(0, 'rgba(100, 160, 0, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  let y = PADDING + 40;

  // --- Header ---
  // Logo text
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = TEXT_COLOR;
  ctx.fillText('Useless', PADDING, y);
  const uW = ctx.measureText('Useless').width;
  ctx.fillStyle = ACCENT_COLOR;
  ctx.font = 'bold 32px Arial';
  ctx.fillText('Interesting', PADDING + uW, y);
  y += 30;

  // Subtitle
  ctx.font = '16px Arial';
  ctx.fillStyle = MUTED_COLOR;
  ctx.letterSpacing = '3px';
  ctx.fillText('FACTS NOBODY ASKED FOR', PADDING, y);
  y += 40;

  // Divider
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, y);
  ctx.lineTo(WIDTH - PADDING, y);
  ctx.stroke();
  y += 30;

  // Tag + Category row
  // "+ NEW FACTS EVERY DAY" tag
  ctx.font = '14px Arial';
  ctx.fillStyle = ACCENT_COLOR;
  const tagText = '+ NEW FACTS EVERY DAY';
  const tagW = ctx.measureText(tagText).width + 20;
  ctx.strokeStyle = ACCENT_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(PADDING, y - 14, tagW, 24);
  ctx.fillText(tagText, PADDING + 10, y + 3);

  // Category on the right
  if (category) {
    ctx.font = '14px Arial';
    ctx.fillStyle = MUTED_COLOR;
    const catText = category.toUpperCase();
    const catW = ctx.measureText(catText).width;
    ctx.fillText(catText, WIDTH - PADDING - catW, y + 3);
  }
  y += 50;

  // --- Title (big, bold) ---
  ctx.font = 'bold 72px Arial';
  const titleWords = fact.title.split(' ');
  const titleMaxW = WIDTH - PADDING * 2;

  // Split title into lines
  const titleLines = wrapText(ctx, fact.title, titleMaxW);

  // Determine which words to highlight (middle portion in accent color)
  const totalWords = titleWords.length;
  const highlightStart = Math.floor(totalWords * 0.3);
  const highlightEnd = Math.floor(totalWords * 0.6);

  // Render title with mixed colors
  let wordIndex = 0;
  for (const line of titleLines) {
    const lineWords = line.split(' ');
    let x = PADDING;
    for (const word of lineWords) {
      if (wordIndex >= highlightStart && wordIndex <= highlightEnd) {
        ctx.fillStyle = ACCENT_COLOR;
      } else {
        ctx.fillStyle = TEXT_COLOR;
      }
      ctx.fillText(word, x, y);
      x += ctx.measureText(word + ' ').width;
      wordIndex++;
    }
    y += 82;
  }
  y += 10;

  // --- Short description (with left border) ---
  ctx.font = '26px Arial';
  ctx.fillStyle = MUTED_COLOR;
  const shortLines = wrapText(ctx, fact.short, titleMaxW - 30);

  // Left accent border
  const shortBlockH = shortLines.length * 36;
  ctx.fillStyle = ACCENT_COLOR;
  ctx.fillRect(PADDING, y - 20, 3, shortBlockH);

  ctx.fillStyle = MUTED_COLOR;
  for (const line of shortLines) {
    ctx.fillText(line, PADDING + 20, y);
    y += 36;
  }
  y += 30;

  // --- Twist (green highlight box) ---
  ctx.font = 'bold 32px Arial';
  const twistLines = wrapText(ctx, fact.twist, titleMaxW - 50);
  const twistBlockH = twistLines.length * 44 + 30;

  // Green box background
  ctx.fillStyle = 'rgba(184, 230, 0, 0.12)';
  ctx.fillRect(PADDING, y, WIDTH - PADDING * 2, twistBlockH);

  // Left accent border
  ctx.fillStyle = ACCENT_COLOR;
  ctx.fillRect(PADDING, y, 4, twistBlockH);

  ctx.fillStyle = ACCENT_COLOR;
  let twistY = y + 30;
  for (const line of twistLines) {
    ctx.fillText(line, PADDING + 25, twistY);
    twistY += 44;
  }
  y += twistBlockH;

  // --- Footer ---
  const footerY = HEIGHT - 160;

  // Divider
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, footerY);
  ctx.lineTo(WIDTH - PADDING, footerY);
  ctx.stroke();

  // "Read the full story at"
  ctx.font = '20px Arial';
  ctx.fillStyle = MUTED_COLOR;
  ctx.fillText('Read the full story at', PADDING, footerY + 40);

  // URL
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = TEXT_COLOR;
  ctx.fillText('uselesslyinteresting.com', PADDING, footerY + 78);

  // Underline
  const urlW = ctx.measureText('uselesslyinteresting.com').width;
  ctx.strokeStyle = TEXT_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PADDING, footerY + 82);
  ctx.lineTo(PADDING + urlW, footerY + 82);
  ctx.stroke();

  // Instagram handle
  ctx.font = '18px Arial';
  ctx.fillStyle = MUTED_COLOR;
  ctx.fillText('📷 @uselesslyinteresting  ·  link in bio', PADDING, footerY + 115);

  // --- Save ---
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log('Generated:', outputPath);
}

// --- Run ---
const today = process.argv[2] || new Date().toISOString().split('T')[0];
const factFile = path.join(__dirname, 'facts', today + '.json');

if (!fs.existsSync(factFile)) {
  console.error('No fact file for', today);
  process.exit(1);
}

const facts = JSON.parse(fs.readFileSync(factFile, 'utf8'));

// Create output dir
const outDir = path.join(__dirname, 'reels');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Generate one reel per fact (usually just one per day)
facts.forEach((fact, i) => {
  const outFile = path.join(outDir, today + (facts.length > 1 ? '-' + (i + 1) : '') + '.png');
  generateReel(fact, fact.category || '', outFile);
});

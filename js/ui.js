(() => {
const { ITEMS, LOCATIONS, PLANTS, PLAYSTYLES, START_TYPES, getLocation, getPlant, getPlaystyle } = window.DeskConfig;
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const percent = n => `${Math.round(n)}%`;

let animationTick = 0;
setInterval(() => { animationTick = (animationTick + 1) % 3600; }, 100);

let wizardState = {
  step: 1,
  startType: 'seed',
  plantIndex: 0, // Lucky Bamboo is default (index 0)
  vase: false,
  playstyle: 'fast',
  locationId: 'computer'
};

function px(ctx, x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function rect(ctx, x, y, w, h, c) {
  px(ctx, x, y, w, h, c);
}

function pixelDisk(ctx, cx, cy, r, c) {
  ctx.fillStyle = c;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= r * r) {
        ctx.fillRect(Math.round(cx + dx), Math.round(cy + dy), 1, 1);
      }
    }
  }
}

/* ==========================================================================
   HD ROOM BACKGROUNDS (Static, Atmospheric, Detailed)
   ========================================================================== */

function drawEnvironment(ctx, state, location) {
  const t = animationTick;
  const locId = location.id;

  ctx.clearRect(0, 0, 320, 320);

  if (locId === 'computer') {
    // Wall
    rect(ctx, 0, 0, 320, 222, '#182018');
    for (let x = 12; x < 320; x += 16) {
      for (let y = 12; y < 210; y += 16) {
        rect(ctx, x, y, 2, 2, '#0f140f');
      }
    }

    // Botanical Wall Poster
    rect(ctx, 230, 22, 68, 86, '#243424');
    rect(ctx, 233, 25, 62, 80, '#d8e89a');
    rect(ctx, 240, 32, 48, 12, '#0f380f');
    rect(ctx, 246, 52, 36, 42, '#4c8a2b');
    rect(ctx, 256, 64, 16, 16, '#8bac0f');

    // Rich Wooden Desk
    rect(ctx, 0, 222, 320, 98, '#3a2417');
    rect(ctx, 0, 222, 320, 6, '#563622');
    rect(ctx, 0, 228, 320, 2, '#27170e');
    for (let y = 236; y < 320; y += 20) {
      rect(ctx, 0, y, 320, 2, '#2b1a10');
    }

    // Desk Mat
    rect(ctx, 16, 232, 288, 82, '#1a221a');
    rect(ctx, 18, 234, 284, 78, '#131813');

    // Retro CRT Monitor (Left)
    rect(ctx, 18, 114, 86, 110, '#888478');
    rect(ctx, 22, 118, 78, 84, '#282723');
    rect(ctx, 26, 122, 70, 76, '#061306');
    for (let row = 0; row < 6; row++) {
      const codeY = 128 + row * 11;
      const shift = ((t + row * 8) % 40);
      rect(ctx, 30 + (shift % 8), codeY, 22 + (row * 6) % 32, 3, '#8bac0f');
      rect(ctx, 56 + (shift % 12), codeY + 4, 14, 2, '#4c8a2b');
    }
    rect(ctx, 88, 208, 4, 4, '#55ff55'); // Power LED
    rect(ctx, 44, 224, 34, 10, '#58554d'); // Stand

    // Mechanical Keyboard
    rect(ctx, 20, 244, 82, 26, '#383733');
    rect(ctx, 22, 246, 78, 22, '#484640');
    for (let kx = 26; kx < 96; kx += 7) {
      for (let ky = 249; ky < 265; ky += 6) {
        rect(ctx, kx, ky, 5, 4, '#d8e89a');
      }
    }

    // Steaming Ceramic Mug
    rect(ctx, 112, 238, 18, 22, '#d0d8be');
    rect(ctx, 130, 242, 5, 12, '#a8b096');
    rect(ctx, 114, 240, 14, 4, '#482a16');
    const steamY1 = 228 - (t % 14);
    const steamY2 = 232 - ((t + 7) % 14);
    rect(ctx, 118 + Math.sin(t * 0.2) * 2, steamY1, 2, 4, 'rgba(216,232,154,0.4)');
    rect(ctx, 124 - Math.sin(t * 0.2) * 2, steamY2, 2, 4, 'rgba(216,232,154,0.3)');

    // Desk Lamp (Right)
    rect(ctx, 262, 224, 32, 10, '#384238');
    rect(ctx, 276, 128, 6, 96, '#4e5c4e');
    rect(ctx, 232, 122, 48, 6, '#4e5c4e');
    rect(ctx, 218, 116, 24, 20, '#627662');
    rect(ctx, 212, 136, 36, 8, '#768e76');

  } else if (locId === 'window') {
    // Wall
    rect(ctx, 0, 0, 320, 320, '#364636');
    // Window Frame
    rect(ctx, 26, 16, 268, 206, '#202a20');
    rect(ctx, 34, 24, 252, 190, '#141a14');

    // Outdoor View
    rect(ctx, 38, 28, 244, 182, '#6aa3b5');
    rect(ctx, 38, 28, 244, 75, '#528ba0');
    // Hills
    rect(ctx, 38, 128, 244, 82, '#366038');
    rect(ctx, 38, 148, 244, 62, '#284a2a');
    // Drifting clouds
    const cloudX = (40 + (t * 0.35)) % 220;
    rect(ctx, 45 + cloudX, 48, 54, 18, '#d2ecf2');
    rect(ctx, 55 + cloudX, 42, 34, 12, '#ffffff');
    rect(ctx, 160 - (cloudX * 0.5), 72, 44, 14, '#b4dde8');

    // Cross Dividers
    rect(ctx, 157, 24, 6, 190, '#202a20');
    rect(ctx, 34, 116, 252, 6, '#202a20');

    // Wooden Sill & Desk
    rect(ctx, 18, 216, 284, 16, '#546a54');
    rect(ctx, 20, 218, 280, 5, '#769276');
    rect(ctx, 0, 232, 320, 88, '#462e1e');
    rect(ctx, 0, 232, 320, 5, '#66442e');

  } else if (locId === 'garden') {
    // Outdoor Sky
    rect(ctx, 0, 0, 320, 180, '#75b2c6');
    rect(ctx, 0, 0, 320, 85, '#5898ae');

    // Sunbeams
    ctx.fillStyle = 'rgba(255, 255, 210, 0.12)';
    ctx.beginPath();
    ctx.moveTo(250, 0);
    ctx.lineTo(80, 320);
    ctx.lineTo(160, 320);
    ctx.lineTo(290, 0);
    ctx.closePath();
    ctx.fill();

    // Trees
    for (let tx = 0; tx < 320; tx += 48) {
      pixelDisk(ctx, tx + 24, 98, 38, '#234a26');
      pixelDisk(ctx, tx + 18, 90, 28, '#306436');
    }

    // Fence
    for (let fx = 8; fx < 320; fx += 24) {
      rect(ctx, fx, 130, 12, 60, '#8a6a48');
      rect(ctx, fx + 1, 126, 10, 5, '#a6845c');
      rect(ctx, fx + 4, 122, 4, 4, '#a6845c');
    }
    rect(ctx, 0, 150, 320, 6, '#684e32');
    rect(ctx, 0, 172, 320, 6, '#684e32');

    // Ground & Table
    rect(ctx, 0, 188, 320, 132, '#2c4826');
    rect(ctx, 0, 230, 320, 90, '#1a2c16');

    // Stone Pedestal
    rect(ctx, 80, 215, 160, 20, '#565e52');
    rect(ctx, 84, 217, 152, 6, '#707a6a');
    rect(ctx, 105, 235, 110, 85, '#3e443b');

    // Insects
    const b1x = 65 + Math.cos(t * 0.08) * 45;
    const b1y = 85 + Math.sin(t * 0.14) * 25;
    const wingFlap = Math.sin(t * 0.6) > 0;
    rect(ctx, b1x, b1y, 2, 4, '#221100');
    if (wingFlap) {
      rect(ctx, b1x - 4, b1y - 3, 4, 6, '#f6e47a');
      rect(ctx, b1x + 2, b1y - 3, 4, 6, '#f6e47a');
    } else {
      rect(ctx, b1x - 2, b1y - 1, 2, 4, '#e5d050');
      rect(ctx, b1x + 2, b1y - 1, 2, 4, '#e5d050');
    }

  } else if (locId === 'greenhouse') {
    // Steamy Greenhouse
    rect(ctx, 0, 0, 320, 222, '#324e40');
    rect(ctx, 20, 10, 280, 212, '#1e3228');
    pixelDisk(ctx, 60, 90, 50, '#2a4838');
    pixelDisk(ctx, 260, 110, 60, '#244032');
    rect(ctx, 95, 10, 6, 212, '#14221a');
    rect(ctx, 220, 10, 6, 212, '#14221a');
    rect(ctx, 20, 100, 280, 6, '#14221a');

    // Slate Workbench
    rect(ctx, 0, 222, 320, 98, '#2c3830');
    rect(ctx, 0, 222, 320, 8, '#44544a');

  } else if (locId === 'bathroom') {
    // Subway Tiles
    rect(ctx, 0, 0, 320, 218, '#3d5a4e');
    for (let tx = 0; tx < 320; tx += 32) {
      for (let ty = 0; ty < 218; ty += 20) {
        rect(ctx, tx, ty, 31, 19, '#46685a');
        rect(ctx, tx + 1, ty + 1, 29, 2, '#587e6e');
      }
    }
    // Mirror
    rect(ctx, 80, 28, 160, 126, '#829a90');
    rect(ctx, 86, 34, 148, 114, '#2a4238');
    rect(ctx, 90, 38, 140, 106, '#345044');
    // Counter
    rect(ctx, 0, 218, 320, 102, '#24322c');
    rect(ctx, 0, 218, 320, 8, '#6c847a');

  } else {
    // A/C Room
    rect(ctx, 0, 0, 320, 222, '#2a3a30');
    rect(ctx, 0, 160, 320, 4, '#3e5244');
    // A/C Unit
    rect(ctx, 172, 26, 122, 50, '#d2dad4');
    rect(ctx, 174, 28, 118, 46, '#e2e8e3');
    rect(ctx, 178, 58, 110, 10, '#94a298');
    rect(ctx, 280, 36, 6, 6, '#8bac0f');
    // Desk
    rect(ctx, 0, 222, 320, 98, '#3c342a');
    rect(ctx, 0, 222, 320, 7, '#5a4d3e');
  }
}

/* ==========================================================================
   HD REFINED POT & GLASS WATER VASE
   ========================================================================== */

function drawContainer(ctx, plantInVase, state) {
  const cx = 160;
  const topY = 220;

  if (plantInVase) {
    // === GLASS WATER VASE ===
    const vaseW = 86;
    const vaseH = 78;
    const left = cx - vaseW / 2;

    // Contact shadow
    pixelDisk(ctx, cx, topY + vaseH + 2, 45, 'rgba(10, 20, 10, 0.45)');

    // River Pebbles inside bottom
    const pebbles = [
      [cx - 30, topY + 60, 16, 11, '#5a5e56'],
      [cx - 12, topY + 62, 18, 12, '#74786e'],
      [cx + 10, topY + 58, 16, 13, '#4a4e46'],
      [cx - 22, topY + 66, 15, 9, '#868a80'],
      [cx + 3, topY + 65, 17, 10, '#545850'],
      [cx + 22, topY + 63, 13, 10, '#6e7268']
    ];
    pebbles.forEach(([pxPos, pyPos, pw, ph, col]) => {
      pixelDisk(ctx, pxPos + pw / 2, pyPos + ph / 2, pw / 2, col);
    });

    // Submerged Root Tendrils
    ctx.fillStyle = '#e8dec3';
    rect(ctx, cx - 6, topY + 18, 4, 38, '#e8dec3');
    rect(ctx, cx + 3, topY + 22, 3, 34, '#d6cba8');
    rect(ctx, cx - 18, topY + 38, 14, 2, '#d6cba8');
    rect(ctx, cx - 22, topY + 40, 5, 14, '#c4b892');
    rect(ctx, cx + 5, topY + 34, 18, 2, '#e8dec3');
    rect(ctx, cx + 22, topY + 36, 4, 16, '#c4b892');
    rect(ctx, cx - 10, topY + 50, 22, 2, '#d6cba8');

    // Water Tint (Translucent blue)
    ctx.fillStyle = 'rgba(100, 195, 225, 0.45)';
    ctx.fillRect(left + 5, topY + 16, vaseW - 10, vaseH - 22);

    // Water Surface Meniscus
    rect(ctx, left + 4, topY + 15, vaseW - 8, 3, '#9ee5f8');

    // Glass Walls & Rim
    rect(ctx, left - 4, topY + 4, vaseW + 8, 8, '#7baab8');
    rect(ctx, left - 2, topY + 6, vaseW + 4, 4, '#cceef8');
    rect(ctx, left, topY + 12, 5, vaseH - 12, '#7baab8');
    rect(ctx, left + vaseW - 5, topY + 12, 5, vaseH - 12, '#7baab8');
    rect(ctx, left + 4, topY + vaseH - 3, vaseW - 8, 5, '#5b8592');

    // Specular Reflection Streaks
    rect(ctx, left + 8, topY + 18, 4, vaseH - 28, 'rgba(255,255,255,0.7)');
    rect(ctx, left + 14, topY + 24, 2, vaseH - 42, 'rgba(255,255,255,0.4)');
    rect(ctx, left + vaseW - 12, topY + 20, 3, vaseH - 35, 'rgba(255,255,255,0.4)');

  } else {
    // === REFINED TERRACOTTA SOIL POT ===
    const rimW = 104;
    const rimH = 14;
    const potTopW = 96;
    const potBotW = 70;
    const potH = 64;

    // Soft Contact Shadow
    pixelDisk(ctx, cx, topY + potH + 8, 52, 'rgba(12, 18, 12, 0.45)');

    // Drainage Saucer Tray
    rect(ctx, cx - 46, topY + potH + 2, 92, 8, '#582b18');
    rect(ctx, cx - 44, topY + potH + 4, 88, 4, '#7c3f24');

    // Pot Body
    ctx.fillStyle = '#9e4e2a';
    ctx.beginPath();
    ctx.moveTo(cx - potTopW / 2 + 2, topY + rimH);
    ctx.lineTo(cx + potTopW / 2 - 2, topY + rimH);
    ctx.lineTo(cx + potBotW / 2, topY + potH);
    ctx.lineTo(cx - potBotW / 2, topY + potH);
    ctx.closePath();
    ctx.fill();

    // Body Shading (Left highlight, right shadow)
    rect(ctx, cx - potTopW / 2 + 6, topY + rimH + 2, 14, potH - rimH - 4, '#be643a');
    rect(ctx, cx + potTopW / 2 - 24, topY + rimH + 2, 20, potH - rimH - 4, '#6c3218');

    // Subtle decorative horizontal groove
    rect(ctx, cx - potTopW / 2 + 8, topY + 36, potTopW - 20, 2, '#703318');
    rect(ctx, cx - potTopW / 2 + 8, topY + 38, potTopW - 20, 1, '#be643a');

    // Pot Rim
    rect(ctx, cx - rimW / 2, topY, rimW, rimH, '#8e4222');
    rect(ctx, cx - rimW / 2 + 2, topY + 2, rimW - 4, 4, '#cb6f44'); // Top highlight
    rect(ctx, cx - rimW / 2 + 2, topY + rimH - 2, rimW - 4, 3, '#522613'); // Rim drop shadow

    // Inner Rim Opening Depth
    rect(ctx, cx - 42, topY + 2, 84, 8, '#3d1c0e');

    // Potting Soil Bed (Neatly contained INSIDE the rim opening!)
    const soilCol = state.moisture > 45 ? '#1e140d' : '#322316';
    rect(ctx, cx - 40, topY + 3, 80, 6, soilCol);
    rect(ctx, cx - 36, topY + 2, 72, 7, soilCol);
    // Soil organic crumbs & perlite specks
    rect(ctx, cx - 22, topY + 4, 2, 2, '#483526');
    rect(ctx, cx + 18, topY + 5, 2, 2, '#483526');
    rect(ctx, cx - 6, topY + 3, 2, 2, '#d8e89a');
    rect(ctx, cx + 28, topY + 4, 2, 2, '#d8e89a');
    rect(ctx, cx - 14, topY + 6, 2, 2, '#d8e89a');
  }
}

/* ==========================================================================
   BOTANICALLY DETAILED PLANT SPRITES WITH SUNBURN / STARVE SHADERS
   ========================================================================== */

function drawPlantSprite(ctx, plant, stage, state) {
  const p = plant.palette;
  const isSunburned = Boolean(state.sunburned);
  const isLightStarved = Boolean(state.lightStarved);
  const isRotting = Boolean(state.rotting);
  const isSick = state.health < 35;

  // Adaptive palette based on health, sunburn, or yellowing
  let mainCol = p[2];
  let darkCol = p[1];
  let brightCol = p[3];
  const scorchCol = '#6b3c1e'; // Crispy burned brown
  const rotCol = '#20140c';    // Soggy black-brown rot

  if (isLightStarved) {
    // Pale chlorotic yellowing
    mainCol = '#c2bd59';
    darkCol = '#8c8734';
    brightCol = '#ded97c';
  } else if (isSick) {
    mainCol = '#7a5a32';
    darkCol = '#4d381e';
    brightCol = '#a37e4c';
  }

  const cx = 160;
  const baseY = 222;
  const h = 42 + stage * 28;

  if (plant.id === 'dracaena') {
    // === LUCKY BAMBOO ===
    const canes = [-16, 0, 16];
    canes.forEach((cxOff, idx) => {
      const top = baseY - h + (idx === 1 ? -14 : 8);
      const caneW = 8;
      // Stalk
      rect(ctx, cx + cxOff - caneW / 2, top, caneW, baseY - top, darkCol);
      rect(ctx, cx + cxOff - caneW / 2 + 2, top, caneW - 4, baseY - top, mainCol);
      // Segment rings with dither highlights
      for (let y = top + 16; y < baseY - 8; y += 22) {
        rect(ctx, cx + cxOff - caneW / 2 - 1, y, caneW + 2, 3, '#142c1c');
        rect(ctx, cx + cxOff - caneW / 2 - 1, y + 1, caneW + 2, 1, brightCol);
        // Hand-crafted pixel notch
        rect(ctx, cx + cxOff - caneW / 2 + 1, y + 3, 2, 1, '#1b3824');
      }
      rect(ctx, cx + cxOff - caneW / 2, top, caneW, 3, '#c2d88c');

      // Leaves
      if (stage >= 1) {
        // Left arching leaf
        ctx.fillStyle = mainCol;
        ctx.beginPath();
        ctx.moveTo(cx + cxOff, top + 18);
        ctx.quadraticCurveTo(cx + cxOff - 35, top - 8, cx + cxOff - 46, top + 6);
        ctx.quadraticCurveTo(cx + cxOff - 25, top + 16, cx + cxOff, top + 22);
        ctx.closePath();
        ctx.fill();

        // Leaf spine vein
        rect(ctx, cx + cxOff - 28, top + 10, 18, 1, brightCol);

        // Right arching leaf
        ctx.fillStyle = brightCol;
        ctx.beginPath();
        ctx.moveTo(cx + cxOff, top + 34);
        ctx.quadraticCurveTo(cx + cxOff + 35, top + 8, cx + cxOff + 48, top + 24);
        ctx.quadraticCurveTo(cx + cxOff + 25, top + 32, cx + cxOff, top + 38);
        ctx.closePath();
        ctx.fill();

        rect(ctx, cx + cxOff + 10, top + 24, 20, 1, mainCol);

        // Sunburn scorch marks on leaf tips
        if (isSunburned) {
          rect(ctx, cx + cxOff - 48, top + 4, 8, 5, scorchCol);
          rect(ctx, cx + cxOff + 44, top + 22, 7, 5, scorchCol);
          rect(ctx, cx + cxOff - 46, top + 6, 2, 2, '#421a08');
        }

        // Rotting wilt lesions on lower foliage
        if (isRotting && idx === 0) {
          rect(ctx, cx + cxOff - 24, top + 18, 12, 6, rotCol);
          rect(ctx, cx + cxOff - 20, top + 22, 6, 4, '#120a05');
        }
      }
    });

  } else if (plant.id === 'cactus') {
    // === DESERT CACTUS ===
    const cw = 34 + stage * 10;
    const top = baseY - h;
    // Main ribbed body
    pixelDisk(ctx, cx, top + cw / 2, cw / 2, darkCol);
    rect(ctx, cx - cw / 2, top + cw / 2, cw, baseY - top - cw / 2, darkCol);
    for (let rx = -cw / 2 + 4; rx < cw / 2; rx += 8) {
      rect(ctx, cx + rx, top + 8, 3, baseY - top - 8, mainCol);
      rect(ctx, cx + rx + 1, top + 10, 1, baseY - top - 10, brightCol);
      // Star Areoles with sharp spines
      for (let ny = top + 16; ny < baseY - 12; ny += 18) {
        rect(ctx, cx + rx - 2, ny, 5, 2, '#fcf6b8');
        rect(ctx, cx + rx, ny - 2, 2, 5, '#fcf6b8');
      }
    }
    // Cactus Arms in stage >= 2
    if (stage >= 2) {
      rect(ctx, cx - cw / 2 - 20, top + 35, 22, 10, darkCol);
      rect(ctx, cx - cw / 2 - 20, top + 12, 10, 32, mainCol);
      pixelDisk(ctx, cx - cw / 2 - 15, top + 12, 5, brightCol);

      rect(ctx, cx + cw / 2 - 2, top + 48, 22, 10, darkCol);
      rect(ctx, cx + cw / 2 + 12, top + 24, 10, 32, mainCol);
      pixelDisk(ctx, cx + cw / 2 + 17, top + 24, 5, brightCol);
    }
    // Crown bloom in stage 3
    if (stage === 3) {
      pixelDisk(ctx, cx, top - 6, 13, '#e63956');
      pixelDisk(ctx, cx, top - 8, 8, '#ffde59');
      rect(ctx, cx - 3, top - 10, 6, 6, '#ffffff');
    }
    // Sunburn marks on cactus crown
    if (isSunburned) {
      rect(ctx, cx - 10, top + 4, 20, 8, scorchCol);
      rect(ctx, cx - 6, top + 8, 12, 4, '#421a08');
    }

  } else if (plant.id === 'pothos') {
    // === GOLDEN POTHOS ===
    rect(ctx, cx - 3, baseY - h, 6, h, darkCol);
    const leaves = [
      [cx - 28, baseY - 35, -0.4, 30, 22],
      [cx + 26, baseY - 45, 0.4, 32, 24],
      [cx - 38, baseY - 70, -0.5, 36, 26],
      [cx + 34, baseY - 85, 0.5, 34, 24],
      [cx - 18, baseY - h + 15, -0.2, 38, 28],
      [cx + 20, baseY - h + 5, 0.3, 36, 26]
    ];
    leaves.slice(0, 2 + stage * 2).forEach(([lx, ly, rot, lw, lh], idx) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);
      pixelDisk(ctx, -lw / 4, 0, lw / 3, darkCol);
      pixelDisk(ctx, lw / 4, 0, lw / 3, mainCol);
      ctx.fillStyle = brightCol;
      ctx.beginPath();
      ctx.moveTo(-lw / 2, 0);
      ctx.lineTo(0, lh);
      ctx.lineTo(lw / 2, 0);
      ctx.closePath();
      ctx.fill();

      // Variegated golden marbling
      if (!isLightStarved) {
        rect(ctx, -2, 2, 4, lh - 6, '#faecd0');
        rect(ctx, -6, 6, 4, 5, '#faecd0');
        rect(ctx, 4, 10, 3, 5, '#faecd0');
      }

      // Sunburn scorch spots
      if (isSunburned && idx >= 2) {
        rect(ctx, -4, lh - 8, 8, 6, scorchCol);
      }

      // Rotting decay on lowest foliage
      if (isRotting && idx <= 1) {
        rect(ctx, -6, 4, 12, 8, rotCol);
        rect(ctx, -3, 6, 6, 4, '#140c06');
      }
      ctx.restore();
    });

    if (stage >= 2) {
      rect(ctx, cx + 40, baseY + 8, 4, 48, darkCol);
      pixelDisk(ctx, cx + 48, baseY + 30, 11, brightCol);
      pixelDisk(ctx, cx + 44, baseY + 52, 10, mainCol);
    }

  } else if (plant.id === 'fern') {
    // === MIST FERN ===
    const fronds = stage + 3;
    for (let f = 0; f < fronds; f++) {
      const angle = -1.2 + (f / (fronds - 1)) * 2.4;
      ctx.save();
      ctx.translate(cx, baseY - 8);
      ctx.rotate(angle);
      const flen = h + 18;
      rect(ctx, -2, -flen, 4, flen, darkCol);
      for (let ly = 16; ly < flen; ly += 9) {
        const leafW = Math.sin((ly / flen) * Math.PI) * 28;
        let col = isSunburned ? scorchCol : mainCol;
        if (isRotting && ly < 30) col = rotCol;
        rect(ctx, -leafW, -ly, leafW * 2, 3, col);
        rect(ctx, -leafW + 2, -ly - 1, (leafW - 2) * 2, 2, isSunburned ? '#94582e' : brightCol);
      }
      ctx.restore();
    }

  } else if (plant.id === 'snake') {
    // === SNAKE PLANT ===
    const blades = [-24, -12, 0, 12, 24];
    blades.slice(0, 1 + stage).forEach((bxOff) => {
      const bh = h + 22 - Math.abs(bxOff) * 0.5;
      const bw = 20;
      const top = baseY - bh;
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.moveTo(cx + bxOff - bw / 2, baseY);
      ctx.lineTo(cx + bxOff - bw / 2, top + 16);
      ctx.lineTo(cx + bxOff, top);
      ctx.lineTo(cx + bxOff + bw / 2, top + 16);
      ctx.lineTo(cx + bxOff + bw / 2, baseY);
      ctx.closePath();
      ctx.fill();

      // Yellow margin borders
      rect(ctx, cx + bxOff - bw / 2, top + 16, 2, bh - 16, '#eae6a6');
      rect(ctx, cx + bxOff + bw / 2 - 2, top + 16, 2, bh - 16, '#eae6a6');

      // Chevron tiger stripes
      for (let zy = top + 22; zy < baseY - 10; zy += 16) {
        rect(ctx, cx + bxOff - bw / 2 + 4, zy, bw - 8, 3, brightCol);
      }

      if (isSunburned) {
        rect(ctx, cx + bxOff - 4, top + 2, 8, 12, scorchCol);
      }

      if (isRotting) {
        rect(ctx, cx + bxOff - 6, baseY - 16, 12, 16, rotCol);
        rect(ctx, cx + bxOff - 4, baseY - 12, 8, 10, '#100a04');
      }
    });

  } else {
    // === PEACE LILY ===
    for (let li = 0; li < 3 + stage * 2; li++) {
      const offX = (li % 2 === 0 ? -1 : 1) * (18 + li * 8);
      const offY = baseY - 20 - (li * 16);
      pixelDisk(ctx, cx + offX, offY, 20, darkCol);
      pixelDisk(ctx, cx + offX + 2, offY + 2, 17, mainCol);
      rect(ctx, cx + offX - 1, offY - 14, 2, 30, brightCol);

      if (isSunburned) {
        rect(ctx, cx + offX + 6, offY - 10, 8, 8, scorchCol);
      }

      if (isRotting && li === 0) {
        rect(ctx, cx + offX - 6, offY - 6, 14, 12, rotCol);
      }
    }

    if (stage === 3) {
      const flX = cx + 2;
      const flY = baseY - h - 16;
      rect(ctx, flX - 2, flY + 12, 4, h + 10, darkCol);
      // Pure White Spathe
      pixelDisk(ctx, flX, flY, 17, '#ffffff');
      pixelDisk(ctx, flX + 2, flY + 2, 14, '#fff9de');
      // Golden Spadix
      rect(ctx, flX - 2, flY - 2, 5, 20, '#ffd447');
      rect(ctx, flX - 1, flY - 1, 3, 18, '#fff0a0');

      if (isSunburned) {
        rect(ctx, flX + 4, flY - 6, 8, 8, scorchCol);
      }
    }
  }

  // === ROTTING SLIME & BASE DECAY OVERLAY ===
  if (isRotting) {
    const rotBaseY = baseY - 6;
    rect(ctx, cx - 32, rotBaseY, 64, 12, '#180e08');
    rect(ctx, cx - 26, rotBaseY - 5, 52, 6, '#26160d');
    for (let rx = cx - 24; rx < cx + 24; rx += 4) {
      const dropH = 4 + (Math.abs(Math.sin(rx + animationTick * 0.15)) * 5);
      rect(ctx, rx, rotBaseY + 2, 2, dropH, '#382214');
    }
  }

  // Animated Pests
  if (state.pests) {
    const pestTick = Math.floor(animationTick / 2);
    const pestLocs = [
      [cx - 14 + (pestTick % 6), baseY - h + 24],
      [cx + 22 - (pestTick % 8), baseY - 48],
      [cx - 4, baseY - h / 2]
    ];
    pestLocs.forEach(([pxPos, pyPos]) => {
      rect(ctx, pxPos, pyPos, 6, 5, '#1e0c0c');
      rect(ctx, pxPos + 1, pyPos + 1, 4, 3, '#d63428');
      rect(ctx, pxPos - 1, pyPos, 1, 2, '#000');
      rect(ctx, pxPos + 6, pyPos, 1, 2, '#000');
    });
  }
}

/* ==========================================================================
   MAIN RENDER DISPATCHER & INFORMATIVE ENVIRONMENT STATS
   ========================================================================== */

function render(state) {
  const plant = getPlant(state.plantId);
  const location = getLocation(state.locationId);
  const stage = window.DeskEngine.getStage(state);

  // Apply Theme
  document.documentElement.setAttribute('data-theme', state.theme || 'dark');
  const themeBtn = $('#theme-toggle-btn');
  if (themeBtn) {
    themeBtn.textContent = state.theme === 'light' ? '☾ DARK [T]' : '☀ LIGHT [T]';
  }

  // Titles
  $('#plant-title').textContent = plant.name.toUpperCase();
  $('#stage-label').textContent = `${plant.growthStages[stage].toUpperCase()} · STAGE ${stage + 1}/${plant.growthStages.length}`;
  const descEl = $('#plant-description');
  if (descEl) descEl.textContent = plant.description;

  // === ROOM ENVIRONMENT ANALYSIS & STATS ===
  const sun = location.sunlight;
  const [minSun, maxSun] = plant.sunlightRange;
  let sunStatus = '<span style="color:var(--leaf);">OPTIMAL ★</span>';
  if (sun > maxSun) {
    sunStatus = '<span style="color:var(--alert); font-weight:bold;">TOO HIGH - SCORCH RISK ⚠️</span>';
  } else if (sun < minSun) {
    sunStatus = '<span style="color:var(--alert); font-weight:bold;">TOO LOW - YELLOWING ⚠️</span>';
  } else if (Math.abs(sun - plant.optimalSunlight) > 15) {
    sunStatus = '<span style="color:var(--text-dim);">TOLERABLE</span>';
  }

  const hum = location.humidity;
  const [minHum, maxHum] = plant.humidityRange;
  let humStatus = '<span style="color:var(--leaf);">OPTIMAL ★</span>';
  if (hum > maxHum) {
    humStatus = '<span style="color:var(--alert);">TOO DAMP ⚠️</span>';
  } else if (hum < minHum) {
    humStatus = '<span style="color:var(--alert);">TOO DRY ⚠️</span>';
  }

  // Fertilizer Boost Status
  const now = Math.floor(Date.now() / 1000);
  const fertActive = state.fertilizerUntil > now;
  const fertHours = fertActive ? Math.ceil((state.fertilizerUntil - now) / 3600) : 0;
  const fertStatus = fertActive
    ? `<span style="color:#f5d061; font-weight:bold;">GROWTH BOOST: +60% (${fertHours}h left ★)</span>`
    : `<span style="color:var(--text-dim);">FERTILIZER: INACTIVE</span>`;

  // Habitat Match
  const vaseTag = state.plantInVase ? ' · [GLASS VASE]' : ' · [SOIL POT]';
  $('#environment-readout').innerHTML = `
    <div><strong>${location.name.toUpperCase()}</strong> (${location.tempLabel})${vaseTag}</div>
    <div style="margin-top:4px;">SUN: <b>${sun}%</b> (${sunStatus}) · HUMIDITY: <b>${hum}%</b> (${humStatus})</div>
    <div style="margin-top:3px;">${fertStatus}</div>
  `;

  // Vitals stats meters
  function meter(label, value, kind = '') {
    return `<div class="stat-line"><span>${label}</span><span class="meter ${kind}"><i style="width:${Math.max(0, Math.min(100, value))}%"></i></span><b>${percent(value)}</b></div>`;
  }

  $('#stats').innerHTML =
    meter('HEALTH', state.health, state.health < 35 ? 'danger' : '') +
    meter('MOISTURE', state.moisture, (state.moisture < 15 || state.moisture > 95) ? 'danger' : '') +
    meter('GROWTH', state.growth) +
    `<div class="stat-line"><span>PESTS</span><b>${state.pests ? 'ALERT!' : 'CLEAR'}</b></div>`;

  // Condition Alert Messages (Real Botanical Hazards)
  let conditionText = '';
  if (state.health <= 0) {
    conditionText = 'WITHERED: START A NEW SPROUT';
  } else if (state.sunburned) {
    conditionText = 'CRITICAL: LEAF SCORCH! PRUNE BURNED LEAVES';
  } else if (state.rotting) {
    conditionText = 'CRITICAL: ROOT & STEM ROT! PRUNE ROTTED FOLIAGE';
  } else if (state.lightStarved) {
    conditionText = 'WARNING: LIGHT STARVATION! LEAVES YELLOWING';
  } else if (state.pests) {
    conditionText = 'DANGER: PESTS ATTACKING LEAVES!';
  } else if (state.overwaterSeconds > 300) {
    conditionText = 'DANGER: ROOT ROT DETECTED';
  } else if (state.moisture < 15) {
    conditionText = 'DANGER: CRITICAL DRYNESS';
  } else if (state.chemicalStress > 1) {
    conditionText = 'DANGER: CHEMICAL RESIDUE STRESS';
  } else if (state.health < 35) {
    conditionText = 'DANGER: CRITICAL HEALTH';
  }
  $('#condition-message').textContent = conditionText;

  // Care Console
  renderMergedCareConsole(state, plant, stage);

  // Relocate dropdown
  const locSelect = $('#location-select');
  if (locSelect) locSelect.value = state.locationId;

  // Garden Log
  $('#log-list').innerHTML = state.log.map(e =>
    `<li><time>${new Date(e.at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time> ${e.text}</li>`
  ).join('');

  // Canvas
  const canvas = $('#plant-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawEnvironment(ctx, state, location);
    drawContainer(ctx, state.plantInVase, state);
    drawPlantSprite(ctx, plant, stage, state);
  }
}

function renderMergedCareConsole(state, plant, stage) {
  const container = $('#care-actions-grid');
  if (!container) return;

  const isFertilizerUsed = state.milestonesFertilized?.includes(stage);
  const weeklyRemaining = window.DeskEngine.getTimeUntilWeeklySupply(state);
  const wd = Math.floor(weeklyRemaining / 86400);
  const wh = Math.floor((weeklyRemaining % 86400) / 3600);
  const sprayRefillLabel = wd > 0 ? `${wd}d ${wh}h` : `${wh}h`;
  const canPrune = window.DeskEngine.canPrune ? window.DeskEngine.canPrune(state) : Boolean(state.sunburned || state.rotting || state.health < 65);

  const actions = [
    {
      action: 'water',
      label: 'WATER',
      key: 'W',
      supply: '',
      disabled: false,
      alert: false
    },
    {
      action: 'fertilize',
      label: 'FERTILIZE',
      key: 'F',
      supply: isFertilizerUsed ? 'Used this stage' : `${state.inventory.fertilizer} left`,
      disabled: isFertilizerUsed || state.inventory.fertilizer <= 0,
      alert: false
    },
    {
      action: 'spray',
      label: 'BUG SPRAY',
      key: 'B',
      supply: state.inventory.spray > 0 ? `${state.inventory.spray}/5 left` : `Refill in ${sprayRefillLabel}`,
      disabled: state.inventory.spray <= 0,
      alert: Boolean(state.pests)
    },
    {
      action: 'prune',
      label: canPrune ? '✂ CUT LEAF' : 'PRUNE',
      key: 'P',
      supply: canPrune ? 'Damaged leaves ready' : 'No damage',
      disabled: !canPrune,
      alert: canPrune
    }
  ];

  container.innerHTML = actions.map(a => `
    <button class="care-btn ${a.alert ? 'prune-alert' : ''}" data-action="${a.action}" ${a.disabled ? 'disabled' : ''}>
      <div class="btn-header">
        <span>${a.label}</span>
        <span class="key-badge">[${a.key}]</span>
      </div>
      ${a.supply ? `<div class="btn-supply">${a.supply}</div>` : ''}
    </button>
  `).join('');

  // Vessel Switcher
  const vesselBox = $('#vessel-control-box');
  if (vesselBox) {
    if (plant.supportsVase) {
      vesselBox.style.display = 'block';
      vesselBox.innerHTML = `
        <button id="toggle-vessel-btn" class="vessel-btn">
          CURRENT VESSEL: <strong>${state.plantInVase ? 'GLASS WATER VASE [V]' : 'TERRACOTTA SOIL POT [V]'}</strong> (CLICK TO SWITCH)
        </button>
      `;
    } else {
      vesselBox.style.display = 'none';
    }
  }
}

/* ==========================================================================
   MULTI-STEP NEW PLANT WIZARD
   ========================================================================== */

function openPlantModal() {
  wizardState.step = 1;
  renderWizard();
  $('#plant-modal').showModal();
}

function renderWizard() {
  for (let s = 1; s <= 4; s++) {
    const dot = $(`#step-dot-${s}`);
    if (dot) {
      dot.className = `wizard-step-dot ${s === wizardState.step ? 'active' : (s < wizardState.step ? 'done' : '')}`;
    }
  }

  $$('.wizard-page').forEach(page => page.classList.remove('active'));
  $(`#wizard-page-${wizardState.step}`)?.classList.add('active');

  if (wizardState.step === 1) {
    drawMiniPreview($('#seed-canvas'), 'seed');
    drawMiniPreview($('#bud-canvas'), 'bud');
  }

  if (wizardState.step === 2) {
    const p = PLANTS[wizardState.plantIndex];
    $('#plant-carousel-name').textContent = p.name.toUpperCase();
    $('#plant-carousel-needs').textContent = `Needs: ${p.optimalSunlight}% Sun (Tol: ${p.sunlightRange[0]}-${p.sunlightRange[1]}%) · ${p.optimalHumidity}% Humidity`;
    $('#plant-carousel-desc').textContent = p.description;
    $('#plant-carousel-count').textContent = `Species ${wizardState.plantIndex + 1} of ${PLANTS.length}`;

    const vaseTag = $('#plant-carousel-vase-tag');
    if (vaseTag) {
      vaseTag.textContent = p.supportsVase ? '✓ Supports Glass Water Vase' : '✕ Requires Soil Pot';
      vaseTag.style.background = p.supportsVase ? 'var(--leaf)' : 'var(--bg-panel-inset)';
    }

    drawPlantShowcase($('#plant-carousel-canvas'), p);
  }

  if (wizardState.step === 3) {
    PLAYSTYLES.forEach(ps => {
      const c = $(`#playstyle-canvas-${ps.id}`);
      if (c) drawPlaystyleIcon(c, ps.id);
    });
  }

  if (wizardState.step === 4) {
    const locSelect = $('#start-location');
    if (locSelect) {
      locSelect.innerHTML = LOCATIONS.map(l =>
        `<option value="${l.id}">${l.name} — ${l.tempLabel}</option>`
      ).join('');
      locSelect.value = wizardState.locationId;
    }
  }

  const backBtn = $('#wizard-back-btn');
  if (backBtn) backBtn.style.visibility = wizardState.step === 1 ? 'hidden' : 'visible';

  const nextBtn = $('#wizard-next-btn');
  if (nextBtn) nextBtn.textContent = wizardState.step === 4 ? 'START GROWING' : 'NEXT →';
}

function drawMiniPreview(canvas, type) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 80, 80);
  if (type === 'seed') {
    rect(ctx, 10, 52, 60, 18, '#322316');
    pixelDisk(ctx, 40, 50, 7, '#b8860b');
    pixelDisk(ctx, 42, 48, 4, '#f5d061');
    rect(ctx, 38, 44, 2, 4, '#8bac0f');
  } else {
    rect(ctx, 10, 52, 60, 18, '#322316');
    rect(ctx, 39, 34, 4, 18, '#4c8a2b');
    pixelDisk(ctx, 34, 32, 6, '#8bac0f');
    pixelDisk(ctx, 46, 30, 6, '#9bbc0f');
  }
}

function drawPlantShowcase(canvas, plant) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 120, 120);
  ctx.save();
  ctx.scale(0.375, 0.375);
  ctx.translate(0, -20);
  drawContainer(ctx, plant.supportsVase && wizardState.vase, { moisture: 80 });
  drawPlantSprite(ctx, plant, 2, { health: 100, pests: false, sunburned: false, lightStarved: false });
  ctx.restore();
}

function drawPlaystyleIcon(canvas, id) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 80, 80);
  if (id === 'fast') {
    ctx.fillStyle = '#f5d061';
    ctx.beginPath();
    ctx.moveTo(45, 10);
    ctx.lineTo(25, 42);
    ctx.lineTo(40, 42);
    ctx.lineTo(35, 70);
    ctx.lineTo(60, 34);
    ctx.lineTo(45, 34);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'arcade') {
    rect(ctx, 22, 16, 36, 48, '#2a3d2a');
    rect(ctx, 26, 22, 28, 20, '#8bac0f');
    rect(ctx, 30, 48, 8, 8, '#d8e89a');
    pixelDisk(ctx, 48, 52, 4, '#e64c58');
  } else {
    rect(ctx, 20, 20, 40, 44, '#d8e89a');
    rect(ctx, 20, 16, 40, 8, '#b84a39');
    pixelDisk(ctx, 40, 42, 10, '#4c8a2b');
    rect(ctx, 38, 38, 4, 18, '#8bac0f');
  }
}

function populateSelectors() {
  const locOptions = LOCATIONS.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
  const locSelect = $('#location-select');
  if (locSelect) locSelect.innerHTML = locOptions;
}

function openNotice(title, message) {
  $('#notice-title').textContent = title;
  $('#notice-message').textContent = message;
  $('#notice-modal').showModal();
}

window.DeskUI = {
  populateSelectors, render, openNotice, openPlantModal,
  renderWizard, wizardState, drawPlantSprite
};
})();

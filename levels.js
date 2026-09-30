/* levels data */
function makeLevel(idx) {
  const levels = [
    {
      name: 'La Grotte oubliee',
      width: 2800,
      groundY: 500,
      theme: 'cave',
      platforms: [
        { x: 140, y: 420, w: 100, h: 16 },
        { x: 280, y: 360, w: 90, h: 16 },
        { x: 420, y: 300, w: 110, h: 16 },
        { x: 580, y: 380, w: 80, h: 16 },
        { x: 720, y: 320, w: 100, h: 16 },
        { x: 880, y: 260, w: 90, h: 16 },
        { x: 1020, y: 340, w: 120, h: 16 },
        { x: 1200, y: 300, w: 100, h: 16, moveX: 120, speed: 50, baseX: 1200 },
        { x: 1450, y: 250, w: 90, h: 16 },
        { x: 1600, y: 340, w: 110, h: 16 },
        { x: 1780, y: 280, w: 80, h: 16 },
        { x: 1920, y: 360, w: 130, h: 16 },
        { x: 2120, y: 300, w: 100, h: 16, moveX: 100, speed: 40, baseX: 2120 },
        { x: 2350, y: 250, w: 120, h: 16 },
        { x: 2550, y: 380, w: 140, h: 16 }
      ],
      spikes: [
        { x: 250, y: 484, w: 50 },
        { x: 500, y: 484, w: 40 },
        { x: 750, y: 484, w: 55 },
        { x: 1100, y: 484, w: 60 },
        { x: 1380, y: 484, w: 45 },
        { x: 1700, y: 484, w: 50 },
        { x: 2050, y: 484, w: 70 },
        { x: 2450, y: 484, w: 50 }
      ],
      fragments: [
        { x: 450, y: 260, collected: false },
        { x: 910, y: 220, collected: false },
        { x: 1480, y: 210, collected: false },
        { x: 2380, y: 210, collected: false }
      ],
      exitX: 2680
    },
    {
      name: 'La Foret des murmures',
      width: 3000,
      groundY: 500,
      theme: 'forest',
      platforms: [
        { x: 120, y: 430, w: 90, h: 14 },
        { x: 250, y: 370, w: 100, h: 14 },
        { x: 400, y: 310, w: 80, h: 14 },
        { x: 520, y: 250, w: 90, h: 14 },
        { x: 680, y: 340, w: 110, h: 14 },
        { x: 850, y: 280, w: 80, h: 14 },
        { x: 1000, y: 220, w: 100, h: 14 },
        { x: 1180, y: 300, w: 120, h: 14, moveX: 90, speed: 45, baseX: 1180 },
        { x: 1400, y: 360, w: 90, h: 14 },
        { x: 1550, y: 280, w: 100, h: 14 },
        { x: 1720, y: 200, w: 80, h: 14 },
        { x: 1880, y: 320, w: 130, h: 14 },
        { x: 2080, y: 260, w: 90, h: 14 },
        { x: 2240, y: 340, w: 100, h: 14, moveX: 110, speed: 55, baseX: 2240 },
        { x: 2480, y: 280, w: 110, h: 14 },
        { x: 2680, y: 380, w: 140, h: 14 },
        { x: 900, y: 160, w: 70, h: 12 },
        { x: 1600, y: 150, w: 80, h: 12 },
        { x: 2400, y: 180, w: 90, h: 12 }
      ],
      spikes: [
        { x: 200, y: 484, w: 40 },
        { x: 450, y: 484, w: 50 },
        { x: 780, y: 484, w: 45 },
        { x: 1100, y: 484, w: 55 },
        { x: 1500, y: 484, w: 60 },
        { x: 1850, y: 484, w: 40 },
        { x: 2150, y: 484, w: 50 },
        { x: 2550, y: 484, w: 65 },
        { x: 2800, y: 484, w: 40 }
      ],
      fragments: [
        { x: 540, y: 210, collected: false },
        { x: 1030, y: 180, collected: false },
        { x: 1750, y: 160, collected: false },
        { x: 2510, y: 240, collected: false }
      ],
      exitX: 2880
    },
    {
      name: 'Le Temple enseveli',
      width: 3200,
      groundY: 500,
      theme: 'temple',
      platforms: [
        { x: 100, y: 430, w: 100, h: 18 },
        { x: 240, y: 380, w: 80, h: 18 },
        { x: 360, y: 330, w: 100, h: 18 },
        { x: 500, y: 280, w: 90, h: 18 },
        { x: 640, y: 360, w: 110, h: 18 },
        { x: 800, y: 300, w: 80, h: 18 },
        { x: 940, y: 240, w: 100, h: 18 },
        { x: 1100, y: 320, w: 120, h: 18, moveX: 100, speed: 48, baseX: 1100 },
        { x: 1320, y: 260, w: 90, h: 18 },
        { x: 1480, y: 340, w: 100, h: 18 },
        { x: 1640, y: 220, w: 110, h: 18 },
        { x: 1820, y: 300, w: 90, h: 18 },
        { x: 1980, y: 380, w: 130, h: 18 },
        { x: 2180, y: 280, w: 100, h: 18, moveX: 120, speed: 42, baseX: 2180 },
        { x: 2420, y: 220, w: 90, h: 18 },
        { x: 2580, y: 320, w: 110, h: 18 },
        { x: 2760, y: 260, w: 100, h: 18 },
        { x: 2940, y: 370, w: 150, h: 18 },
        { x: 700, y: 180, w: 70, h: 14 },
        { x: 1550, y: 160, w: 80, h: 14 },
        { x: 2500, y: 150, w: 90, h: 14 }
      ],
      spikes: [
        { x: 180, y: 484, w: 45 },
        { x: 420, y: 484, w: 50 },
        { x: 700, y: 484, w: 40 },
        { x: 1000, y: 484, w: 55 },
        { x: 1400, y: 484, w: 60 },
        { x: 1750, y: 484, w: 45 },
        { x: 2100, y: 484, w: 50 },
        { x: 2450, y: 484, w: 55 },
        { x: 2700, y: 484, w: 40 },
        { x: 3000, y: 484, w: 50 }
      ],
      fragments: [
        { x: 520, y: 240, collected: false },
        { x: 970, y: 200, collected: false },
        { x: 1670, y: 180, collected: false },
        { x: 2450, y: 180, collected: false }
      ],
      exitX: 3100
    }
  ];
  return levels[idx];
}

let level = null;

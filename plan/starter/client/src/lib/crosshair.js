// Crosshair generator logic. All sizes are pixels on a 1080p screen.

export const DEFAULT_CROSSHAIR = { color: '#00ff00', length: 6, thickness: 2, gap: 3, dot: false, outline: true };

// [min, max] for the sliders
export const CROSSHAIR_LIMITS = { length: [0, 20], thickness: [1, 6], gap: [0, 10] };

export function hexToRgb(hex) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 0, g: 255, b: 0 };
}

// Rectangles { x, y, w, h } to fill, relative to the centre of the screen: right, left, top, bottom arm, then the dot.
export function crosshairRects({ length, thickness, gap, dot }) {
  const half = thickness / 2;
  const rects = [];
  if (length > 0) {
    rects.push(
      { x: gap, y: -half, w: length, h: thickness },
      { x: -gap - length, y: -half, w: length, h: thickness },
      { x: -half, y: -gap - length, w: thickness, h: length },
      { x: -half, y: gap, w: thickness, h: length },
    );
  }
  if (dot) rects.push({ x: -half, y: -half, w: thickness, h: thickness });
  return rects;
}

// CS2 uses its own units: about 2.25 px per unit at 1080p, and gap 0 already leaves about 4 units of space.
// shortcut: approximate conversion, good enough as a starting point; the page tells the user to fine-tune in game.
const CS2_PX_PER_UNIT = 2.25;
const toHalf = (n) => Math.round(n * 2) / 2;

// Console commands, one per line, that recreate the crosshair in Counter-Strike 2.
export function cs2Commands(c) {
  const { r, g, b } = hexToRgb(c.color);
  return [
    'cl_crosshairstyle 4',
    `cl_crosshairsize ${toHalf(c.length / CS2_PX_PER_UNIT)}`,
    `cl_crosshairthickness ${Math.max(0.5, toHalf(c.thickness / CS2_PX_PER_UNIT))}`,
    `cl_crosshairgap ${toHalf(c.gap / CS2_PX_PER_UNIT - 4)}`,
    `cl_crosshairdot ${c.dot ? 1 : 0}`,
    `cl_crosshair_drawoutline ${c.outline ? 1 : 0}`,
    'cl_crosshair_outlinethickness 1',
    'cl_crosshaircolor 5',
    `cl_crosshaircolor_r ${r}`,
    `cl_crosshaircolor_g ${g}`,
    `cl_crosshaircolor_b ${b}`,
    'cl_crosshairalpha 255',
    'cl_crosshairusealpha 1',
  ].join('\n');
}

// [setting name, value] rows to type into Valorant's Settings > Crosshair screen by hand.
export function valorantSettings(c) {
  const onOff = (flag) => (flag ? 'On' : 'Off');
  return [
    ['Crosshair Color', c.color.toUpperCase()],
    ['Outlines', onOff(c.outline)],
    ['Center Dot', onOff(c.dot)],
    ['Show Inner Lines', onOff(c.length > 0)],
    ['Inner Line Length', String(c.length)],
    ['Inner Line Thickness', String(c.thickness)],
    ['Inner Line Offset', String(c.gap)],
    ['Show Outer Lines', 'Off'],
    ['Movement Error / Firing Error', 'Off'],
  ];
}

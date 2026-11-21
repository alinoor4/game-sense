// One fictional training map. Positions are fractions of the image (0-1), matching client/public/maps/training-yard.svg.
export const maps = [
  {
    game: 'fps-fundamentals',
    name: 'Training Yard',
    slug: 'training-yard',
    imageUrl: '/maps/training-yard.svg',
    callouts: [
      { name: 'Attacker Spawn', x: 0.5, y: 0.92 },
      { name: 'A Main', x: 0.17, y: 0.6 },
      { name: 'Mid', x: 0.5, y: 0.58 },
      { name: 'B Main', x: 0.83, y: 0.6 },
      { name: 'A Site', x: 0.2, y: 0.35 },
      { name: 'B Site', x: 0.8, y: 0.35 },
      { name: 'Window', x: 0.5, y: 0.14 },
      { name: 'Defender Spawn', x: 0.5, y: 0.06 },
    ],
    lineups: [
      {
        title: 'Window smoke from Attacker Spawn',
        kind: 'smoke',
        from: { x: 0.5, y: 0.88 },
        to: { x: 0.5, y: 0.26 },
        steps:
          '1. Stand in the middle of Attacker Spawn, facing straight up Mid.\n2. Aim at the top edge of the Window building.\n3. Throw while jumping.\n\nThe smoke lands in front of Window and blocks the long sightline, so your team can cross Mid.',
      },
      {
        title: 'A Site flash from A Main',
        kind: 'flash',
        from: { x: 0.17, y: 0.7 },
        to: { x: 0.22, y: 0.3 },
        steps:
          '1. Stop at the bottom of A Main, hugging the left wall.\n2. Aim high above the site.\n3. Throw, then turn away until it pops.\n\nIt bursts over the site and blinds anyone watching A Main. Push the moment it pops.',
      },
      {
        title: 'B Site corner molotov from B Main',
        kind: 'molotov',
        from: { x: 0.83, y: 0.7 },
        to: { x: 0.855, y: 0.275 },
        steps:
          '1. Stand at the bottom of B Main, against the right wall.\n2. Aim just above the crate in the back corner of the site.\n3. Running throw.\n\nThe fire covers the crate, the most common hiding spot, so nobody can hold it.',
      },
      {
        title: 'Mid smoke from Defender Spawn',
        kind: 'smoke',
        from: { x: 0.44, y: 0.08 },
        to: { x: 0.5, y: 0.5 },
        steps:
          '1. Stand left of centre in Defender Spawn.\n2. Aim through the Window gap, slightly above it.\n3. Standing throw.\n\nThe smoke lands at the top of Mid and slows an early Mid push while your team sets up.',
      },
    ],
  },
];

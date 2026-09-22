'use client';

/**
 * Mock QR code. Deterministic from the reservation code, so it looks like a
 * real code and stays stable between renders. It is decoration for the demo,
 * the production app renders a real code from the reservation id.
 */
export function QRCode({ value, size = 168 }: { value: string; size?: number }) {
  const modules = 25;
  const cells: boolean[] = [];

  let seed = 0;
  for (let i = 0; i < value.length; i += 1) {
    seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  }
  const next = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed / 0xffffffff;
  };

  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= modules - 7 && y < 7) || (x < 7 && y >= modules - 7);

  for (let y = 0; y < modules; y += 1) {
    for (let x = 0; x < modules; x += 1) {
      cells.push(inFinder(x, y) ? false : next() > 0.52);
    }
  }

  const unit = size / modules;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={value}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map((filled, index) =>
        filled ? (
          <rect
            key={index}
            x={(index % modules) * unit}
            y={Math.floor(index / modules) * unit}
            width={unit}
            height={unit}
            fill="#1c1c1e"
          />
        ) : null,
      )}
      {[
        [0, 0],
        [modules - 7, 0],
        [0, modules - 7],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x * unit} y={y * unit} width={unit * 7} height={unit * 7} fill="#1c1c1e" />
          <rect
            x={(x + 1) * unit}
            y={(y + 1) * unit}
            width={unit * 5}
            height={unit * 5}
            fill="#fff"
          />
          <rect
            x={(x + 2) * unit}
            y={(y + 2) * unit}
            width={unit * 3}
            height={unit * 3}
            fill="#1c1c1e"
          />
        </g>
      ))}
    </svg>
  );
}

/** Ilustración vectorial usada cuando aún no hay una foto principal cargada desde el admin. */
export function BurgerIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 360" className={className} role="img" aria-label="Ilustración de una hamburguesa">
      <defs>
        <linearGradient id="bun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb02e" />
          <stop offset="1" stopColor="#e07b00" />
        </linearGradient>
        <linearGradient id="patty" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b3a1e" />
          <stop offset="1" stopColor="#3a1d0c" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="335" rx="150" ry="14" fill="rgba(0,0,0,.28)" />
      {/* pan inferior */}
      <path d="M62 276h276c0 34-34 52-138 52S62 310 62 276z" fill="url(#bun)" />
      {/* carne */}
      <rect x="48" y="232" width="304" height="46" rx="23" fill="url(#patty)" />
      {/* queso */}
      <path d="M52 226h296l-26 40-20-22-22 34-24-30-24 34-26-36-22 28-24-30-28 24z" fill="#FFC400" />
      {/* tomate */}
      <rect x="64" y="196" width="272" height="26" rx="13" fill="#e5251d" />
      <rect x="64" y="196" width="272" height="9" rx="4.5" fill="#ff5a4d" opacity=".6" />
      {/* lechuga */}
      <path
        d="M44 196c14-22 26 6 40-8s26 8 40-6 26 8 40-6 26 8 40-6 26 8 40-6 26 8 40-6 26 8 40-6 24 8 36-2v32H44z"
        fill="#47b83c"
      />
      {/* pan superior */}
      <path d="M56 176C56 96 118 48 200 48s144 48 144 128z" fill="url(#bun)" />
      <path d="M92 150c8-40 40-66 84-72" stroke="#fff" strokeOpacity=".35" strokeWidth="10" strokeLinecap="round" fill="none" />
      {[
        [150, 98, -20], [200, 82, 5], [252, 100, 25], [120, 132, -35], [178, 120, -10], [232, 126, 18], [284, 134, 40], [150, 152, 10], [210, 154, -15], [262, 162, 30],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="9" ry="4.5" fill="#fff4d6" transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </svg>
  );
}

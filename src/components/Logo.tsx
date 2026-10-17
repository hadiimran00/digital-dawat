/**
 * Kabootar Post's mark: a carrier pigeon in flight, wings raised, with a sealed letter in its beak. The old way an
 * invitation travelled, drawn simply enough to read at favicon size. Decorative (the name always sits beside it).
 */
export function PigeonMark({ className = "", body = "#0F3D33", wing = "#B08A3E", letter = "#FBF7F0" }: { className?: string; body?: string; wing?: string; letter?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 64 64" className={className}>
      {/* the far wing, behind the body */}
      <path d="M24 37C21 25 24 13 31 4C33 15 35 25 35.5 34Z" fill={wing} opacity=".7" />
      {/* fanned tail, plump body and round head */}
      <path d="M16 45L4 41.5L6.5 46.5L4.5 52L16.5 48Z" fill={body} />
      <path d="M14 45.5C18 37 28 32.5 38 33.5C44 34 47.5 37 48.5 40.5C44.5 47 34.5 51 24.5 50C19 49.5 15.5 48 14 45.5Z" fill={body} />
      <circle cx="47.5" cy="34.5" r="6.5" fill={body} />
      <path d="M53.5 33L59.5 35L53.5 37.5Z" fill={wing} />
      <circle cx="49.5" cy="33" r="1.3" fill={letter} />
      {/* the near wing, raised */}
      <path d="M27 39C30.5 27 40 18 54 13C48.5 22 44.5 30 40 38.5C35.5 37.5 31 37.5 27 39Z" fill={wing} />
      <path d="M33 37C36 30 41 24.5 47 20.5" fill="none" stroke={letter} strokeOpacity=".5" strokeWidth="1.2" strokeLinecap="round" />
      {/* the letter it carries */}
      <g transform="translate(50.5 38) rotate(10)">
        <rect width="12" height="8.5" rx="1.2" fill={letter} stroke={body} strokeWidth="1.3" />
        <path d="M0.8 1L6 5L11.2 1" fill="none" stroke={body} strokeWidth="1.2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

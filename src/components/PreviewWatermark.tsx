/**
 * "PREVIEW · KABOOTAR POST" in diagonal rows over an invitation that isn't paid for yet (the editor's preview and the
 * owner's /i link before approval), so a screenshot can't stand in for the real invitation. Taps pass straight through.
 * Place it inside a `relative` box that holds the invitation.
 */
export function PreviewWatermark() {
  const row = "PREVIEW · KABOOTAR POST · PREVIEW · KABOOTAR POST";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[65] overflow-hidden select-none">
      <div className="absolute left-1/2 top-1/2 flex w-[260%] -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] flex-col items-center gap-[4.5rem]">
        {Array.from({ length: 14 }, (_, i) => (
          <p key={i} className="whitespace-nowrap text-[clamp(18px,5vw,30px)] font-extrabold tracking-[0.25em] text-white/40 [text-shadow:0_1px_2px_rgba(0,0,0,.35)] [font-family:var(--nf-sans),system-ui,sans-serif]"
            style={{ marginLeft: i % 2 ? "12rem" : 0 }}>
            {row}
          </p>
        ))}
      </div>
    </div>
  );
}

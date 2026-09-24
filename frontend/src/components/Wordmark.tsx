/* "desk•" wordmark. Colour follows the section tone. */
export default function Wordmark() {
  return (
    <span className="flex items-baseline gap-[3px] text-[1.5rem] leading-none tracking-[-0.045em] text-ink">
      <span className="font-bold">desk</span>
      <span aria-hidden="true" className="inline-block h-[7px] w-[7px] rounded-full bg-ink" />
      <span className="sr-only">Application Desk</span>
    </span>
  );
}

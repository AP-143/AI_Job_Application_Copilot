/* "desk•" wordmark. Colour follows the section tone. `serif` is the landing hero variant. */
export default function Wordmark({ serif = false }: { serif?: boolean }) {
  if (serif) {
    return (
      <span className="font-serif text-3xl leading-none tracking-tight text-ink">
        desk<span className="sr-only"> Application Desk</span>
      </span>
    );
  }
  return (
    <span className="flex items-baseline gap-[3px] text-[1.5rem] leading-none tracking-[-0.045em] text-ink">
      <span className="font-bold">desk</span>
      <span aria-hidden="true" className="inline-block h-[7px] w-[7px] rounded-full bg-ink" />
      <span className="sr-only">Application Desk</span>
    </span>
  );
}

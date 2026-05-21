export default function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-block rounded-xl px-2.5 py-1 text-[0.68rem] font-medium" style={{ background: `${color}33`, color }}>
      {label}
    </span>
  );
}

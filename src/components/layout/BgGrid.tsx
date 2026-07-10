export default function BgGrid() {
  return (
    <div className="bg-grid">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid-line" />
      ))}
    </div>
  );
}

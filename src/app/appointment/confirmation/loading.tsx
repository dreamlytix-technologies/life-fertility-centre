export default function Loading() {
  return (
    <div className="shell py-14" role="status" aria-label="Loading booking">
      <div className="skeleton h-12 w-72" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-20" />
          ))}
        </div>
        <div className="skeleton h-80" />
      </div>
    </div>
  );
}

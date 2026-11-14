export default function Loading() {
  return (
    <div className="shell py-16" role="status" aria-label="Loading page">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton mt-6 h-14 w-full max-w-2xl" />
      <div className="skeleton mt-4 h-5 w-full max-w-xl" />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-48" />
        ))}
      </div>
    </div>
  );
}

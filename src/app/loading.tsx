export default function Loading() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-background/50">
      <div
        aria-label="Loading"
        className="h-5 w-5 animate-spin rounded-full border border-black/20 border-t-black"
      />
    </div>
  );
}

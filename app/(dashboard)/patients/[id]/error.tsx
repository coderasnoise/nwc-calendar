"use client";

export default function PatientDetailError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded bg-red-50 p-4 text-sm text-red-700">
      <p>{error.message || "Failed to load patient."}</p>
      <button type="button" onClick={reset} className="mt-2 rounded border border-red-300 px-3 py-1">
        Try again
      </button>
    </div>
  );
}

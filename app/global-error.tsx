"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="text-lg font-semibold">Application error</h2>
          <p className="mt-2 text-sm">{error.message || "Unexpected fatal error."}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded border border-red-300 bg-white px-3 py-2 text-sm"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}

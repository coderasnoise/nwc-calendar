"use client";

import { useFormStatus } from "react-dom";

type Props = {
  action: (formData: FormData) => Promise<void>;
  patientId: string;
};

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-60"
    >
      {pending ? "Deleting..." : "Delete Patient"}
    </button>
  );
}

export function DeletePatientForm({ action, patientId }: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm("Delete this patient permanently?");
        if (!confirmed) {
          event.preventDefault();
        }
      }}
      className="space-y-3"
    >
      <input type="hidden" name="id" value={patientId} />
      <p className="text-sm text-slate-600">
        This action cannot be undone. The patient will be removed from all views.
      </p>
      <DeleteButton />
    </form>
  );
}

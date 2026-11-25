"use client";

import { FormEvent, useState } from "react";
import { verifySupervisorPin } from "@/lib/api";
import { Modal } from "./Modal";

export function PinOverrideModal({
  open,
  onClose,
  onAuthorized,
  title = "Supervisor PIN Required",
  subtitle = "Enter a supervisor or manager PIN to authorize this action.",
}: {
  open: boolean;
  onClose: () => void;
  onAuthorized: (approver: {
    user_id: number;
    user_name: string;
    role: string;
  }) => void;
  title?: string;
  subtitle?: string;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await verifySupervisorPin(pin);
      setPin("");
      onAuthorized(res.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid PIN code.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} maxWidthClass="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          required
          placeholder="Enter PIN code"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="rounded-xl border border-zinc-300 bg-transparent px-3.5 py-2.5 text-center font-mono text-lg tracking-widest outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-200"
        />
        {error && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-3.5 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {submitting ? "Verifying..." : "Authorize"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

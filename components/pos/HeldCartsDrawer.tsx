"use client";

import type { HeldCart } from "@/lib/types";
import { Modal } from "../Modal";

export function HeldCartsDrawer({
  open,
  onClose,
  carts,
  onResume,
  onDiscard,
}: {
  open: boolean;
  onClose: () => void;
  carts: HeldCart[];
  onResume: (id: string) => void;
  onDiscard: (id: string) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Held Carts"
      subtitle="Resume a held order back into the active register or discard it."
      maxWidthClass="max-w-xl"
    >
      {carts.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">
          No held carts for this outlet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {carts.map((cart) => (
            <li
              key={cart.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-sm font-semibold">{cart.id}</p>
                <p className="text-xs text-zinc-500">
                  {cart.customer_name} · {cart.total_items} items · Held by{" "}
                  {cart.user_name}
                </p>
                {cart.note && (
                  <p className="mt-0.5 text-xs italic text-zinc-500">
                    Note: {cart.note}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onResume(cart.id)}
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => onDiscard(cart.id)}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Discard
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

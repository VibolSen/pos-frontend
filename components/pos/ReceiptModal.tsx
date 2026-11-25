"use client";

import type { CheckoutResponse } from "@/lib/types";
import { Modal } from "../Modal";

export function ReceiptModal({
  receipt,
  onClose,
}: {
  receipt: CheckoutResponse | null;
  onClose: () => void;
}) {
  if (!receipt) return null;

  const { sale, lines } = receipt;

  return (
    <Modal
      open={Boolean(receipt)}
      onClose={onClose}
      title={`Receipt ${sale.receipt_number}`}
      subtitle={`Status: ${sale.status.toUpperCase()} · Currency: ${sale.currency}`}
      maxWidthClass="max-w-md"
    >
      <div className="flex flex-col gap-4 text-sm">
        <div className="rounded-xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
          <div className="mb-3 text-center">
            <p className="text-base font-bold">POS RECEIPT</p>
            <p className="font-mono text-xs text-zinc-500">
              {sale.receipt_number}
            </p>
          </div>

          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {lines.map((line, idx) => (
              <li
                key={`${line.product_id}-${idx}`}
                className="flex justify-between py-2"
              >
                <div>
                  <p className="font-medium">{line.product_name}</p>
                  <p className="text-xs text-zinc-500">
                    {Number(line.quantity)} × $
                    {Number(line.unit_price).toFixed(2)}
                  </p>
                </div>
                <span className="font-mono font-medium">
                  ${Number(line.subtotal).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-3 space-y-1 border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-mono">
                ${Number(sale.subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Discount</span>
              <span className="font-mono">
                -${Number(sale.discount_total).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tax</span>
              <span className="font-mono">
                ${Number(sale.tax_total).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold">
              <span>Grand Total</span>
              <span className="font-mono">
                ${Number(sale.grand_total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Print
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

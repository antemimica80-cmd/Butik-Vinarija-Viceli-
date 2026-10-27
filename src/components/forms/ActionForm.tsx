"use client";

import { useActionState, type ReactNode } from "react";
import { Icon } from "../Icon";

type R = { ok: true; message?: string } | { ok: false; error: string; fields?: string[] };

/** Form bound to a server action that stays visible and shows a status banner after submit. */
export function ActionForm<T extends R>({ action, children, submitLabel, messages, className = "space-y-5", encType }: {
  action: (prev: T | null, fd: FormData) => Promise<T>;
  children: ReactNode;
  submitLabel: string;
  messages: { submitted?: string; published?: string; error: string; pending: string };
  className?: string;
  encType?: "multipart/form-data";
}) {
  const [state, formAction, pending] = useActionState<T | null, FormData>(action, null);
  return (
    <form action={formAction} className={className} encType={encType}>
      {state?.ok && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-forest-100 p-3 text-sm text-forest">
          <Icon name="check" size={16} /> {state.message === "submitted" ? messages.submitted : messages.published}
        </p>
      )}
      {state && !state.ok && (
        <p role="alert" className="rounded-xl bg-burgundy-100 p-3 text-sm text-burgundy">
          {messages.error}{state.fields?.length ? ` (${state.fields.join(", ")})` : state.error !== "validation" ? ` (${state.error})` : ""}
        </p>
      )}
      {children}
      <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? messages.pending : submitLabel}</button>
    </form>
  );
}

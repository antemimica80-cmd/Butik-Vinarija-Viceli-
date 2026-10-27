"use client";

import { useActionState, type ReactNode } from "react";
import { Icon } from "../Icon";

type Result = { ok: true } | { ok: false; error: string; fields?: string[] };

/** Progressive-enhancement form wrapper around a server action (works without JavaScript). */
export function SimpleForm<R extends Result>({ action, children, submitLabel, successText, errorText, pendingLabel }: {
  action: (prev: R | null, fd: FormData) => Promise<R>;
  children: ReactNode;
  submitLabel: string;
  successText: string;
  errorText: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState<R | null, FormData>(action, null);
  if (state?.ok) {
    return (
      <div role="status" className="card flex items-start gap-3 p-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-100 text-forest"><Icon name="check" /></span>
        <p className="leading-relaxed">{successText}</p>
      </div>
    );
  }
  return (
    <form action={formAction} className="space-y-5">
      {state && !state.ok && <p role="alert" className="rounded-xl bg-burgundy-100 p-4 text-sm text-burgundy">{errorText}{state.fields?.length ? ` (${state.fields.join(", ")})` : ""}</p>}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {children}
      <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? pendingLabel : submitLabel}</button>
    </form>
  );
}

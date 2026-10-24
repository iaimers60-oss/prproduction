"use client";

import { useActionState } from "react";
import { signIn, type ActionState } from "@/lib/admin/actions";
import { FormMessage, SubmitButton } from "@/components/admin/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<ActionState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" defaultValue={state.data?.email} key={state.data?.email} />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="w-full py-3.5">Sign in</SubmitButton>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { updateInquiry, type ActionState } from "@/lib/admin/actions";
import { INQUIRY_STATUSES } from "@/lib/config/site";
import { AdminField, FormMessage, SubmitButton } from "./ui";
import type { BookingInquiry } from "@/types";

export function InquiryForm({ inquiry }: { inquiry: BookingInquiry }) {
  const [state, action] = useActionState<ActionState, FormData>(updateInquiry, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={inquiry.id} />
      <AdminField name="status" label="Status" state={state}>
        <select id="status" name="status" defaultValue={state.data?.status ?? inquiry.status} className="field py-2.5 text-sm">
          {INQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </AdminField>
      <AdminField name="internal_notes" label="Internal notes (private)" state={state} defaultValue={state.data?.internal_notes ?? inquiry.internal_notes} textarea rows={6} />
      <FormMessage state={state} />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}

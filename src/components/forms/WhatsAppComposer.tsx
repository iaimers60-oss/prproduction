"use client";

import { useState } from "react";
import { SERVICES, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/config/services";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

/** Pick a service, edit the prefilled message, then open WhatsApp. */
export function WhatsAppComposer({ number }: { number: string }) {
  const [service, setService] = useState("");
  const [message, setMessage] = useState(DEFAULT_WHATSAPP_MESSAGE);
  const url = buildWhatsAppUrl(number, message);

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="wa-service" className="field-label">I&apos;m interested in</label>
        <select
          id="wa-service"
          className="field"
          value={service}
          onChange={(e) => {
            setService(e.target.value);
            setMessage(SERVICES.find((s) => s.slug === e.target.value)?.whatsapp ?? DEFAULT_WHATSAPP_MESSAGE);
          }}
        >
          <option value="">General inquiry</option>
          {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="wa-text" className="field-label">Message (edit before sending)</label>
        <textarea id="wa-text" rows={4} className="field" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass("gold", "w-full sm:w-auto")}>
          <WhatsAppIcon className="h-4 w-4" /> Open WhatsApp
        </a>
      )}
    </div>
  );
}

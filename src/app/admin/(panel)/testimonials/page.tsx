import { requireAdmin } from "@/lib/admin/auth";
import { deleteTestimonial } from "@/lib/admin/actions";
import { PageHeader } from "@/components/admin/PageHeader";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { ConfirmSubmit } from "@/components/admin/ui";
import type { Testimonial } from "@/types";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const { db } = await requireAdmin();
  const { data } = await db.from("testimonials").select("*").order("sort_order");
  const items = (data ?? []) as Testimonial[];
  return (
    <>
      <PageHeader title="Testimonials" description="Add only genuine reviews you have permission to publish. The homepage testimonials section stays hidden until at least one is published." />
      <section className="mb-12 border border-gold/30 bg-charcoal/60 p-6">
        <h2 className="mb-4 text-2xl">Add testimonial</h2>
        <TestimonialForm />
      </section>
      <ul className="space-y-6">
        {items.map((t) => (
          <li key={t.id} className="border border-white/10 p-6">
            <TestimonialForm t={t} />
            <form action={deleteTestimonial} className="mt-4">
              <input type="hidden" name="id" value={t.id} />
              <ConfirmSubmit message={`Delete the testimonial from ${t.client_name}?`}>Delete</ConfirmSubmit>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}

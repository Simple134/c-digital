<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the C-Digital Next.js 15 App Router project. Here is a summary of everything that was done:

- **Installed** `posthog-js` (client-side) and `posthog-node` (server-side) via Yarn.
- **Configured** `instrumentation-client.ts` for client-side PostHog initialization using the Next.js 15.3+ pattern — no Provider needed.
- **Created** `src/lib/posthog-server.ts` as a shared server-side PostHog client.
- **Added reverse proxy rewrites** to `next.config.ts` so PostHog requests route through `/ingest/*`, improving ad-blocker resistance.
- **Set environment variables** (`NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`) in `.env.local`.
- **Added `posthog.identify()`** at all form submission success points (contact form, consultation booking, brand brief) to link anonymous users to their email.
- **Added `posthog.capture()`** across 6 files covering 8 distinct events including client and server-side tracking.
- **Enabled `capture_exceptions: true`** for automatic error tracking.

## Events Instrumented

| Event Name                 | Description                                                 | File                                             |
| -------------------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `contact_form_submitted`   | User successfully submits the main contact form             | `src/app/contacto/page.tsx`                      |
| `whatsapp_clicked`         | User clicks the WhatsApp chatbot link                       | `src/app/contacto/page.tsx`                      |
| `plan_contact_initiated`   | User arrives at /contacto with a pricing plan pre-filled    | `src/app/contacto/page.tsx`                      |
| `consultation_scheduled`   | User completes the 5-step consultation booking form         | `src/app/contacto/agendar/page.tsx`              |
| `brief_submitted`          | User submits the multi-step brand brief form                | `src/app/form/page.tsx`                          |
| `sales_cta_clicked`        | User clicks the "Agendar consultoría" CTA on the sales page | `src/app/sales/schedule-button.tsx`              |
| `portfolio_item_clicked`   | User clicks a portfolio item on the home page               | `src/app/page.tsx`                               |
| `form_submission_received` | Server-side: API route receives a form submission           | `src/app/api/contact-gestiono/[formId]/route.ts` |

## Next Steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **[Analytics basics Dashboard](https://us.posthog.com/project/445725/dashboard/1663688)** — Central hub for all C-Digital analytics
- **[Lead Generation Over Time](https://us.posthog.com/project/445725/insights/w85ok8eF)** — Daily trend of contact form submissions, consultation bookings, and brand briefs
- **[Contact Conversion Funnel](https://us.posthog.com/project/445725/insights/0XsAAgBJ)** — Funnel from Sales CTA click → Contact Form → Consultation Scheduled
- **[Portfolio Engagement](https://us.posthog.com/project/445725/insights/wMtnVYok)** — Which portfolio categories drive the most clicks (broken down by category)
- **[Plan Interest Distribution](https://us.posthog.com/project/445725/insights/UFmNHLRE)** — Which pricing plans (esencial, activo, estrategico) generate the most interest
- **[Contact Channel Comparison](https://us.posthog.com/project/445725/insights/1NeWITn5)** — Contact Form vs WhatsApp vs Consultation Booked side by side

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

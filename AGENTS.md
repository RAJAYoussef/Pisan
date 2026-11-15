<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## PiSan architecture
- Verify partner codes only inside session or authenticated teacher handlers against the service-role-only code registry; never expose codes through client bundles or Data API column grants.
- Show the test-view bar only in development or on Lovable id-preview hosts; published hosts must not expose test controls.
- Anonymous learning sessions use a high-entropy browser capability, hashed server-side; all private reads and writes require it, avoiding personal email collection and anonymous Auth signups.
- Store learning progress and daily quotas in Cloud; consume quotas transactionally to prevent parallel requests bypassing limits.
- Pedagogical modules are in-app workspace tabs; keep the shared session and language state in the workspace, with focused components for each teaching activity.
- Use browser speech synthesis for statement playback, with language selection and visible unsupported-browser errors; no paid AI narration is required.
- Keep CPA exercise selection and concrete/calculation validation in the shared exercise module; use normalized school levels for both demos and generated practice so their difficulty stays aligned.
- Teacher accounts use magic-link Auth and a protected named workspace; anonymous students retain capability sessions so email is never required for learners.
- Teacher class endpoints authorize ownership through the caller-scoped client before privileged session reads; expose membership UUIDs, never session hashes.
- Class joining uses a service-only transaction with a rolling-hour attempt counter locked on the capability session; return refusals rather than throwing so failed attempts commit. Partner entitlement comes from the active registry.
- Membership departures delete only the authorized membership, never learning progress; teacher deletion checks ownership and membership through caller-scoped reads before privileged deletion, and learner deletion requires the capability hash.
- Teacher DYS revisions apply once per browser, with a private local backup restored on disable; learner adjustments persist between revisions and never reach the teacher.

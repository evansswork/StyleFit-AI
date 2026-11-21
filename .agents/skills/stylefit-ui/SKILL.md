---
name: stylefit-ui
description: Implement or change StyleFit AI landing interactions and product UI states using its design and product requirements. Use for landing demos, wardrobe, styling results, avatar controls, or trip UI; not for backend-only changes.
---

# StyleFit UI

Read `DESIGN.md` and the relevant feature in `PRD.md` from the repository root. Inspect existing components before introducing new ones.

- For the landing, satisfy L01-L06: style, weather, and item choices must change the preview; the stylist CTA must carry valid choices into a working flow.
- Use local, labeled demo fixtures on the landing. Do not upload photos, call a paid provider, invent live prices, or simulate inference to present a preset.
- Keep control and preview changes connected. Preserve locked items and current input after recoverable failures.
- Distinguish owned items, purchases, unknown prices, verified references, and approximate visual assets in the visible UI.
- Preserve useful outfit details if a photo or 3D asset fails. Add manual alternatives where the feature supports them.
- Use touch and keyboard controls, visible focus, semantic selection state, and reduced-motion behavior. Do not make hover or drag the only way to act.

Verify the changed interaction on mobile and desktop with available browser tools. For landing changes, check U20 and U21 in `TESTING.md`; for product changes, check the relevant feature scenarios. Report what was actually tried and what remains unverified. Documentation or a screenshot of the default state alone does not prove the interaction works.

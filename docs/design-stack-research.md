# Design-First Stack Research

MiBarbero should use AI tools as a design acceleration layer, not as a replacement for art direction. The goal is a mobile-first consumer app that feels like a premium neighborhood barber link, not generic SaaS.

## Recommended stack

| Layer | Recommended tool | Why | Tradeoff |
| --- | --- | --- | --- |
| Primary app/code loop | v0 + Vercel | Strong fit for Next.js, Tailwind, shadcn-style components, high-fidelity UI iteration, and deploy previews. | Can produce samey UI without strong visual references and tokens. |
| Design source of truth | Figma / Figma Make | Better for exploring visual direction before code; useful frame context for v0 or Figma-to-code tools. | Local-codebase workflows may still vary by availability. |
| Component base | shadcn/ui | Accessible, editable component patterns; good base for dialogs, drawers, forms, tabs, badges, cards. | Default look is now common; must customize heavily. |
| Styling engine | Tailwind CSS v4 | CSS-first tokens, high-performance engine, P3 palette, gradients, container queries, modern transforms. | Expressive primitives still require deliberate art direction. |
| Visual differentiation | Magic UI, Aceternity UI, 21st.dev | Fast source for animated heroes, backgrounds, bento layouts, premium cards, and microinteractions. | Easy to overuse; adapt components instead of pasting showcases. |
| Motion | Motion for React | Smooth microinteractions for selection, confirmation, card expansion, and page transitions. | Must be subtle, fast, and reduced-motion aware. |

## Practical MiBarbero pipeline

1. **Art direction first**
   - Define one concept, e.g. `premium urban Dominican barbershop PWA: espresso/navy base, brass/gold accents, cream surfaces, teal live status, tactile cards, editorial headings, subtle barber-pole motion`.
   - Collect 5–8 references for profile pages, booking selectors, link-in-bio pages, barber branding, and live-status modules.

2. **Figma exploration**
   - Design small frames instead of the whole app at once:
     - home/landing
     - barber profile
     - service + queue picker
     - confirmation/status
     - barber dashboard cockpit

3. **v0 component generation**
   - Import one Figma frame at a time.
   - Generate isolated components, then manually wire them into the existing Next.js app.
   - Keep data/state in `src/lib/store.tsx` until the backend phase.

4. **shadcn structure, custom visuals**
   - Use shadcn-style primitives for accessibility and composition.
   - Replace default variants/tokens with MiBarbero-specific cards, badges, controls, and typography.

5. **Polish layer**
   - Add only a few memorable visual elements:
     - animated/live availability chip
     - premium barber profile card
     - tactile service selector
     - booking/queue confirmation animation

6. **Cleanup + verification**
   - Remove unused generated effects.
   - Run `npm run build` and `npm run smoke`.
   - Check phone viewport flows before merging.

## Tool notes

### v0

Use for main screen/component generation and iteration. Best when fed strong Figma frames, screenshots, or detailed visual constraints.

- Docs: https://v0.dev/docs
- Figma integration: https://v0.dev/docs/figma
- Design Mode: https://v0.dev/docs/design-mode

### shadcn/ui

Use as the editable component foundation, not the visual identity.

- Docs: https://ui.shadcn.com/docs
- Theming: https://ui.shadcn.com/docs/theming

### Tailwind CSS v4

Use CSS variables and theme tokens for the MiBarbero brand system.

- Release notes: https://tailwindcss.com/blog/tailwindcss-v4

### Magic UI / Aceternity / 21st.dev

Use selectively for inspiration and adapted components.

- Magic UI: https://magicui.design/
- Aceternity UI: https://ui.aceternity.com/
- 21st.dev: https://21st.dev/

### Figma-to-code options

- Builder.io Visual Copilot / Fusion: strong for polished Figma designs mapped to frameworks/components. https://www.builder.io/m/design-to-code
- Locofy: strong conversion workflow for Figma/Penpot/XD to frontend code. https://www.locofy.ai/
- Anima: useful for fast Figma/screenshot/site-to-prototype exploration. https://www.animaapp.com/

### Alternate AI app builders

- Magic Patterns: best for varied product UI ideation. https://www.magicpatterns.com/
- Lovable: useful for full-stack MVP experiments. https://docs.lovable.dev/introduction
- Bolt: useful for fast prototype variations and GitHub/Figma imports. https://bolt.new/
- Replit Agent: useful for hosted experiments and all-in-one testing. https://docs.replit.com/references/agent/overview

## MiBarbero-specific direction

Do **not** make MiBarbero look like generic salon SaaS. Make it feel like:

- a live link-in-bio page for a trusted barber
- a premium but local Dominican/Latin neighborhood brand
- an app where the main customer value is immediately visible: `open now`, `wait time`, `join line`, `book later`
- a barber cockpit where status, wait time, next customer, and queue controls are one tap away

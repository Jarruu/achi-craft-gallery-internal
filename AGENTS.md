# Agent Configurations & System Instructions

Welcome to the **Achi Craft Galery** project codebase. This configuration file acts as the primary instruction source for all AI agents (Cursor, Claude, Antigravity, etc.) interacting with this repository.

---

## 1. Project Stack & Architecture

AI agents must strictly align with the project's technical architecture:
*   **Routing System:** TanStack Router (file-based routing). Routes reside in `src/routes/`. Let the framework auto-generate routing configurations.
*   **Styling Engine:** Tailwind CSS v4. Styling configs are embedded inside [src/styles.css](file:///D:/Jarruu/Neo/My%20Project/Achi%20Craft%20Gallery/achi-craft-gallery/src/styles.css). Do not use Tailwind v3 configurations or write new CSS files unless necessary.
*   **Backend & DB:** Prisma ORM connecting to PostgreSQL database. Database scripts are executed via Docker containers and local `dotenv-cli`.
*   **State & Functions:** `@tanstack/react-start` server functions (`createServerFn`) to link backend logic to the frontend cleanly.

---

## 2. Design System Guidelines

Agents must strictly respect the design system requirements. Code that produces standard, plain, or overly bright Bootstrap-like components will be rejected.

### Aesthetic Combo
1.  **Modern Minimalist:** Clean whitespace, grid layouts, heavy focus on spacing.
2.  **Editorial / Magazine Style:** Elegant serif displays, asymmetric grids, block quotes, large bold section indicators.
3.  **Abstract Geometric UI:** Flat blocks of color, bold grid line divisions, geometric containers, asymmetric alignment.
4.  **Luxury / Art Gallery Vibe:** Understated typography, hairline borders (`border-[0.5px]`), high-quality transition micro-animations, and custom premium colors.

### Primary Color Scheme Reference
Configure and use these color palette variables from [src/styles.css](file:///D:/Jarruu/Neo/My%20Project/Achi%20Craft%20Gallery/achi-craft-gallery/src/styles.css):
*   `#F3F1F1` (Off White / Light Gray Background): The primary canvas for layouts.
*   `#E7E3E3` (Warm Light Gray): For right-hand columns, split-screen panels, and accent block fills.
*   `#2E2D31` (Charcoal / Dark Gray): Main typography and primary action colors.
*   `#8E8E93` (Soft Gray Text): Subtitles, structural captions, metadata, and hairline dividers.

### Typography System
This project only uses the following Google Fonts:
```html
<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Prata&display=swap');
</style>
```
*   **Primary Serif (Editorial/Headers):** `Prata` (`Prata`, serif) for display typography, section headers, and quotes.
*   **Primary Sans-Serif (UI/Body):** `Open Sans` (`Open Sans`, sans-serif) for body copies, functional UI elements, and metadata.

### Inspiration Sources
*   *Scandinavian Minimalism:* Cleanliness, functionality, simplicity.
*   *Contemporary Editorial Web Design:* High typographic contrast, asymmetric headers.
*   *Japanese Minimal Layout:* Perfect grid logic, negative space, and absolute visual harmony.
*   *Luxury Branding Websites:* Elegant transitions, spacing, thin lines.

---

## 3. Mandatory Agent Workflows

Before writing code or proposing edits, all agents must:
1.  **Analyze Context:** Check route layout in `src/routes/__root.tsx` and main CSS file [src/styles.css](file:///D:/Jarruu/Neo/My%20Project/Achi%20Craft%20Gallery/achi-craft-gallery/src/styles.css).
2.  **Use Tailwind v4 Classes:** Make sure all utility classes conform to Tailwind v4 updates.
3.  **Ensure Strict Typing:** Keep TypeScript type-safety clean. Do not use `any`. Always specify types or use Zod validation models.
4.  **Verify DB Operations:** When modifying Database structure, verify changes in `prisma/schema.prisma` and run `pnpm db:push` or generate migrations.
5.  **Interactive Elements:** Ensure buttons, links, and grid items are responsive and have high-end transition effects.

---

## 4. Development Command Cheatsheet

Always use these commands within the project environment:
*   Start development server: `pnpm dev`
*   Build project: `pnpm build`
*   Run tests: `pnpm test`
*   Sync DB schema: `pnpm db:push`
*   Prisma Studio (view database data): `pnpm db:studio`

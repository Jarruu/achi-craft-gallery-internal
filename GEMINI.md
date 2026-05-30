# Gemini Configuration & Design System Guidelines

This document outlines the technical stack, styling tokens, and design philosophy for the **Achi Craft Galery** project, tailored for the Gemini AI Coding Assistant.

---

## 1. Project Tech Stack
*   **Framework:** [TanStack Start](https://tanstack.com/start) (SSR, file-based routing)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & CSS variables in [styles.css](file:///D:/Jarruu/Neo/My%20Project/Achi%20Craft%20Gallery/achi-craft-gallery/src/styles.css)
*   **Database:** [Prisma ORM](https://www.prisma.io/) with PostgreSQL (Supabase / Docker)
*   **UI Components:** Shadcn UI primitives & Lucide React icons
*   **Package Manager:** pnpm

---

## 2. Design System: Aesthetic DNA
The visual direction of this project is a hybrid aesthetic combining high-end print editorial layout, geometric modernism, and a luxury art gallery experience.

### Aesthetic Dimensions
*   **Modern Minimalist:** Maximum restraint, clean lines, generous negative space, intentional layouts without clutter.
*   **Editorial / Magazine Style:** High typographic contrast, asymmetric grid structures, prominent text hierarchy, and editorial headers.
*   **Abstract Geometric UI:** Blocks of solid color, stark horizontal/vertical dividers, grid-based offsets, and geometric containers.
*   **Luxury / Art Gallery Vibe:** Thin elegant borders (`border-[0.5px]`), spacious layouts, muted sophisticated color palette, and subtle, high-quality hover states.

---

## 3. Color Palette Configuration
Integrate these colors into [styles.css](file:///D:/Jarruu/Neo/My%20Project/Achi%20Craft%20Gallery/achi-craft-gallery/src/styles.css) variables:

| Token | CSS Variable / Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Off-White Background** | `--bg-gallery-base` | `#F3F1F1` | Primary background of the application |
| **Warm Light Gray** | `--bg-gallery-split` | `#E7E3E3` | Split layouts, card backgrounds, and right-side panels |
| **Charcoal / Dark Gray** | `--text-gallery-dark` | `#2E2D31` | Principal typography, icons, and primary buttons |
| **Soft Gray Text** | `--text-gallery-muted` | `#8E8E93` | Captions, subtitles, secondary elements, and grid lines |
| **Border / Line** | `--border-gallery-line` | `rgba(46, 45, 49, 0.12)` | Subtle geometric layout dividers (hairline thickness) |

---

## 4. Typography System
This project only uses the following Google Fonts:
```html
<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Prata&display=swap');
</style>
```

*   **Primary Serif (Editorial/Headers):** `Prata` (`Prata`, serif). Use for titles, showcase items, display headings, and main page quotes.
*   **Primary Sans-Serif (UI/Body):** `Open Sans` (`Open Sans`, sans-serif). Use for functional navigation, metadata, and body text.
*   **Styling Rules:**
    *   Use generous letter-spacing (`tracking-wider` or `tracking-widest`) for uppercase headings and labels.
    *   Large font weight differences: bold serif display headers vs. light sans-serif body metadata.

---

## 5. UI Layout & Component Guidelines
When writing HTML/React elements:
1.  **Geometric Grids:** Use CSS grid with borders instead of container-gaps to simulate magazine grid dividers (e.g., standard `grid cols-12` with `border-r border-b`).
2.  **Asymmetry:** Place large typographic elements off-center. Let text blocks overflow or sit side-by-side with large images in uneven column splits (e.g., `col-span-5` and `col-span-7`).
3.  **Negative Space:** Do not fear empty grid cells. Leave areas empty to emphasize key assets.
4.  **Interactive States:**
    *   All hover states must be smooth (`transition-all duration-300 ease-out`).
    *   Images should have slow zoom-on-hover effects (`hover:scale-105 duration-700`).
    *   Links and buttons should use elegant underlines that expand from the center or fade in.

---

## 6. Gemini Agent Instructions
*   **Rule 1:** Never use bright primary colors (e.g., pure `blue-500`, `red-500`) unless for error states.
*   **Rule 2:** Always adhere to the Tailwind v4 custom theme setup.
*   **Rule 3:** Avoid dense, cramped component layouts. Add paddings matching editorial page layouts (e.g., `py-16`, `px-8` to `px-24`).
*   **Rule 4:** Keep comments precise and preserve original codebase architecture.

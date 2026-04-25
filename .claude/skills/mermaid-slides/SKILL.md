---
name: mermaid-slides
description: Generates high-impact, visual Mermaid charts in /mermaid. Use when the user asks for "slides", "charts", "diagrams", or "visuals".
---

# Mermaid Slide Architect (Clean & Vertical)

When this skill is invoked, follow these design principles to ensure a professional, vertical VS Code preview:

## 1. Visual Directives

Every file MUST begin with this "Modern Corporate" styling block. Note the matching background colors to hide section boxes:

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#1a1a2e',
    'primaryTextColor': '#ffffff',
    'primaryBorderColor': '#4ecca3',
    'lineColor': '#4ecca3',
    'tertiaryColor': '#1a1a2e',
    'mainBkg': '#1a1a2e',
    'nodeBorder': '#4ecca3',
    'clusterBkg': '#1a1a2e',
    'clusterBorder': 'transparent',
    'fontSize': '14px'
  }
} }%%
```

## 2. Layout & Stability Rules

- **No Overlaps:** Avoid `block-beta`. Use `graph TB` (Top to Bottom) exclusively for stable, vertical rendering.
- **Invisible Sections:** Use `subgraph` only for logical grouping, but rely on the `clusterBorder: transparent` and matching `clusterBkg` to ensure no "background boxes" appear.
- **Visuals > Text:** Keep text minimal (under 5 words per node). Use Unicode icons (e.g., 🛡️, 🚀, 📦, 👤, ☁️).
- **Header Nodes:** Create a title or header using a styled node at the top rather than a subgraph label.

## 3. Storage & Naming Protocol

- **Location:** You MUST save all generated output to the `/mermaid` directory.
- **Naming:**
  - Infer a descriptive filename from the user's query (e.g., "API Auth" becomes `api_auth.mmd`).
  - Sanitize the name: lowercase, replace spaces/special characters with underscores.
- **Tooling:**
  - Check if `/mermaid` exists; if not, use `run_terminal_command` to `mkdir -p /mermaid`.
  - Use `write_file` to save the content to `/mermaid/<filename>.mmd`.

## 4. Output Standard

- Output **ONLY** the `.mmd` code block unless the user explicitly asks for a breakdown.
- After saving, provide a brief confirmation: "Chart saved to /mermaid/<filename>.mmd. Toggle the VS Code Mermaid preview to view."

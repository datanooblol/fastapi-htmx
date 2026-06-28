# Component Architecture — Atomic Design

## Design Tokens (Tailwind Config)

All design decisions are abstracted into tokens in `tailwind.config.ts`:

```typescript
// tailwind.config.ts
const config = {
  darkMode: "class", // toggle via class="dark" on <html>
  theme: {
    extend: {
      colors: {
        // Semantic tokens
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",

        // Surface tokens
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-card": "var(--bg-card)",
        "bg-sidebar": "var(--bg-sidebar)",
        "bg-input": "var(--bg-input)",

        // Text tokens
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",

        // Border
        border: "var(--border-color)",

        // Node types (knowledge graph)
        "node-note": "var(--node-note)",
        "node-source": "var(--node-source)",
        "node-summary": "var(--node-summary)",
        "node-article": "var(--node-article)",
        "node-concept": "var(--node-concept)",
      },

      spacing: {
        sidebar: "240px",
      },

      borderRadius: {
        sm: "3px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        pill: "14px",
      },

      fontSize: {
        caption: ["0.6rem", { lineHeight: "1.4" }],
        label: ["0.65rem", { lineHeight: "1.4" }],
        hint: ["0.7rem", { lineHeight: "1.5" }],
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.8rem", { lineHeight: "1.6" }],
        base: ["0.85rem", { lineHeight: "1.7" }],
        md: ["0.9rem", { lineHeight: "1.7" }],
        lg: ["0.95rem", { lineHeight: "1.8" }],
        xl: ["1.1rem", { lineHeight: "1.3" }],
        "2xl": ["1.5rem", { lineHeight: "1.2" }],
        "3xl": ["1.75rem", { lineHeight: "1.2" }],
        "4xl": ["2.25rem", { lineHeight: "1.15" }],
      },

      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
    },
  },
};
```

CSS variables defined in `globals.css`:
```css
:root {
  --color-primary: #4fc3f7;
  --color-primary-hover: #81d4fa;
  --color-success: #66bb6a;
  --color-warning: #ffa726;
  --color-danger: #ef5350;
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-card: #1e2a45;
  --bg-sidebar: #0f1629;
  --bg-input: #151d30;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0b0;
  --text-muted: #6a6a7a;
  --border-color: #2a2a4a;
  /* ... light mode overrides in .light class */
}
```

---

## Component Hierarchy

### Atoms (`components/atoms/`)

Smallest, stateless, reusable building blocks.

| Component | Props | Storybook Variants |
|---|---|---|
| `Button` | variant (primary/secondary/ghost/danger/success), size (sm/md/lg), disabled, loading, icon, children | All variants, disabled, loading spinner |
| `Input` | type, placeholder, value, onChange, error | Default, focused, error, disabled |
| `Textarea` | placeholder, value, rows, onChange | Default, with content, error |
| `Select` | options[], value, onChange, placeholder | Default, with selection, disabled |
| `Badge` | variant (note/source/summary/article/concept/status), children | All type variants |
| `Tag` | label, onRemove?, clickable? | Default, removable, clickable |
| `StatusDot` | status (outline/writing/written/ai-drafted) | All 4 states |
| `Avatar` | initials, size (sm/md) | Small, medium |
| `Icon` | name, size | All icons used |
| `Checkbox` | checked, onChange, label? | Checked, unchecked, with label |
| `Spinner` | size (sm/md) | Inline, full |
| `Tooltip` | content, children, position | Top, bottom, left, right |
| `Divider` | orientation (horizontal/vertical) | Both |

### Molecules (`components/molecules/`)

Combinations of atoms that form functional units.

| Component | Contains | Props |
|---|---|---|
| `FormGroup` | Label + Input/Textarea/Select + Hint | label, hint?, error?, children |
| `SearchInput` | Icon + Input + Button | value, onChange, onSearch, placeholder |
| `NavItem` | Icon + Label + Badge? | href, icon, label, badge?, active |
| `FilterTab` | Button + Count | label, count, active, onClick |
| `StatusBadge` | Badge with status color | status (draft/review/published/outline) |
| `TagInput` | Tags[] + Input | tags[], onAdd, onRemove |
| `StatCard` | Label + Value + Change | label, value, change?, changeDirection? |
| `EngageButton` | Icon + Count | type (like/save/share), count, active, onClick |
| `SectionPills` | StatusDot[] | sections[{status}] |
| `ProgressBar` | Track + Fill | value (0-100), variant (low/mid/full) |
| `MatchIndicator` | Badge[] + Confidence | matches{keyword, fts, vector}, confidence |
| `ConnectionTypeBadge` | Strength badge | strength (strong/moderate/weak/existing) |
| `RefChip` | TypeLabel + Name + Remove | type, name, onRemove, onClick |
| `BreadcrumbNav` | Link chain | items[{label, href}] |

### Organisms (`components/organisms/`)

Complex components that form distinct sections of the UI.

#### Layout Organisms
| Component | Description |
|---|---|
| `Sidebar` | Full sidebar: logo, nav sections, theme toggle |
| `PageHeader` | Title + description/stats + action button |
| `AppLayout` | Sidebar + main content wrapper |
| `PublicLayout` | Minimal top nav for public pages (no sidebar) |

#### Source Workspace Organisms
| Component | Description |
|---|---|
| `StepIndicator` | Numbered step bar with active/completed states |
| `SourceForm` | Tabbed form (write/paste/upload) with tag input |
| `UploadZone` | Drag-drop area with file preview |
| `PromptSelector` | Dropdown + New Prompt button + preview textarea |
| `NewPromptForm` | Inline form for creating prompt templates |
| `SourceReader` | Left panel: original text + summaries tab with dropdown |
| `NoteEditor` | Right panel: title + toolbar + textarea + saved notes list |
| `NoteCard` | Saved note with title, preview, meta, delete |
| `SummaryCard` | Summary content with badge, delete button |

#### Notes List Organisms
| Component | Description |
|---|---|
| `SearchFilterBar` | Search + type/tag/sort filters + search options toggle |
| `SearchModeToggle` | Keyword (always on) + FTS + Semantic checkboxes |
| `NoteListItem` | Full result row: checkbox + badge + title + meta + preview + tags + actions |
| `NoteGridCard` | Card view variant of note |
| `BulkActionBar` | Selected count + action buttons (Synapse/Delete/Cancel) |

#### Article Organisms
| Component | Description |
|---|---|
| `ArticleCard` | Article list item: title + subtitle + status + progress + tags |
| `StatusFilterTabs` | All/Outline/Draft/Review/Published tabs |
| `SectionBlock` | Collapsible section: header + brief + refs + editor + AI actions |
| `AIActionsMenu` | Dropdown with contextual actions (varies by section status) |
| `ArticleAIMenu` | Article-level AI actions (coherence, tone, transitions) |
| `RefPicker` | Inline search to attach notes/summaries/sources to a section |
| `RefPanel` | Left panel: searchable list of notes/summaries/sources |

#### Muse (AI Companion) Organisms
| Component | Description |
|---|---|
| `MusePanel` | Collapsible right panel: header + quick chips + chat + input |
| `MuseMessage` | Chat bubble: user or assistant variant |
| `MuseSuggestion` | AI suggestion with Apply/Dismiss buttons |
| `QuickActionChips` | Row of preset action buttons |

#### Synapse Organisms
| Component | Description |
|---|---|
| `ConnectionCard` | Two notes + reason + strength + accept/skip |
| `ScanContext` | Info bar: which note, how many scanned, how many found |
| `NoteSelectGrid` | Checkbox grid for bulk note selection |
| `ResultSummary` | Post-review stats: accepted/skipped/existing |

#### Knowledge Graph Organisms
| Component | Description |
|---|---|
| `GraphCanvas` | D3.js force-directed graph (SVG) |
| `GraphToolbar` | Search + Concept + Query + Health + Synapse buttons |
| `NodeFilterBar` | Toggle node types + edge types |
| `NodeDetail` | Slide-out panel: type + title + content + connections |
| `HealthCheckModal` | Contradictions + suggested concepts + orphans |
| `QueryBar` | "Ask Knowledge" input + result display |
| `ConceptForm` | Create concept modal |

#### Publishing Organisms
| Component | Description |
|---|---|
| `ArticlePreview` | Rendered article as reader would see it |
| `PublishSettings` | Slug, excerpt, tags, cover, visibility, schedule |
| `PublishChecklist` | Pre-publish checks with pass/warn/fail icons |
| `ExportMenu` | Download (MD/PDF/HTML/DOCX) + Cross-post (Medium/Dev.to/etc.) |

#### Public Article Organisms
| Component | Description |
|---|---|
| `ArticleHeader` | Title + subtitle + author + date + read time |
| `ArticleBody` | Rendered markdown with headings, lists, blockquotes |
| `EngagementBar` | Like + Save + Share + Export |
| `ReferenceList` | Numbered references with type badges |
| `RelatedArticles` | 2-column grid of related article cards |

#### Analytics Organisms
| Component | Description |
|---|---|
| `DateRangeSelector` | 7d/30d/90d/All toggle buttons |
| `StatsGrid` | Row of StatCards |
| `ViewsChart` | Bar chart (views over time) |
| `TopArticlesChart` | Horizontal bar chart |
| `EngagementDonut` | Donut chart with legend |
| `ExportUsageChart` | Horizontal bar chart (platform/format) |
| `ActivityFeed` | Recent events list |
| `ArticlePerformanceTable` | Full table with sparklines |

---

## File Structure

```
frontend/
├── app/                            # Next.js pages (App Router)
│   ├── layout.tsx                  # Root: AppLayout wrapper
│   ├── page.tsx                    # Dashboard
│   ├── sources/
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── notes/page.tsx
│   ├── synapse/page.tsx
│   ├── articles/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       ├── edit/page.tsx
│   │       └── publish/page.tsx
│   ├── graph/page.tsx
│   ├── p/[slug]/page.tsx           # Public (uses PublicLayout)
│   └── analytics/page.tsx
│
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.stories.tsx
│   │   ├── Input/
│   │   ├── Textarea/
│   │   ├── Select/
│   │   ├── Badge/
│   │   ├── Tag/
│   │   ├── StatusDot/
│   │   ├── Avatar/
│   │   ├── Checkbox/
│   │   ├── Spinner/
│   │   ├── Tooltip/
│   │   └── Divider/
│   │
│   ├── molecules/
│   │   ├── FormGroup/
│   │   ├── SearchInput/
│   │   ├── NavItem/
│   │   ├── FilterTab/
│   │   ├── StatusBadge/
│   │   ├── TagInput/
│   │   ├── StatCard/
│   │   ├── EngageButton/
│   │   ├── SectionPills/
│   │   ├── ProgressBar/
│   │   ├── MatchIndicator/
│   │   ├── RefChip/
│   │   └── BreadcrumbNav/
│   │
│   └── organisms/
│       ├── layout/
│       │   ├── Sidebar/
│       │   ├── PageHeader/
│       │   ├── AppLayout/
│       │   └── PublicLayout/
│       ├── sources/
│       │   ├── StepIndicator/
│       │   ├── SourceForm/
│       │   ├── UploadZone/
│       │   ├── PromptSelector/
│       │   ├── SourceReader/
│       │   ├── NoteEditor/
│       │   ├── NoteCard/
│       │   └── SummaryCard/
│       ├── notes/
│       │   ├── SearchFilterBar/
│       │   ├── NoteListItem/
│       │   └── BulkActionBar/
│       ├── articles/
│       │   ├── ArticleCard/
│       │   ├── StatusFilterTabs/
│       │   ├── SectionBlock/
│       │   ├── AIActionsMenu/
│       │   ├── RefPicker/
│       │   └── RefPanel/
│       ├── muse/
│       │   ├── MusePanel/
│       │   ├── MuseMessage/
│       │   └── QuickActionChips/
│       ├── synapse/
│       │   ├── ConnectionCard/
│       │   ├── ScanContext/
│       │   └── NoteSelectGrid/
│       ├── graph/
│       │   ├── GraphCanvas/
│       │   ├── GraphToolbar/
│       │   ├── NodeDetail/
│       │   ├── HealthCheckModal/
│       │   └── ConceptForm/
│       ├── publish/
│       │   ├── ArticlePreview/
│       │   ├── PublishSettings/
│       │   ├── PublishChecklist/
│       │   └── ExportMenu/
│       ├── public/
│       │   ├── ArticleHeader/
│       │   ├── ArticleBody/
│       │   ├── EngagementBar/
│       │   └── RelatedArticles/
│       └── analytics/
│           ├── DateRangeSelector/
│           ├── ViewsChart/
│           ├── EngagementDonut/
│           └── ArticlePerformanceTable/
│
├── lib/
│   ├── api.ts                      # Fetch wrapper for FastAPI
│   ├── types.ts                    # TypeScript types (mirrors Pydantic)
│   └── hooks/                      # Custom React hooks
│       ├── useSource.ts
│       ├── useNotes.ts
│       ├── useArticles.ts
│       └── useTheme.ts
│
└── styles/
    └── globals.css                 # CSS variables (design tokens)
```

---

## Storybook Setup

### Install
```bash
cd frontend
npx storybook@latest init
```

### Story Pattern
Each component has a `.stories.tsx` file demonstrating all variants:

```tsx
// components/atoms/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary", children: "Save" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Cancel" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete" } };
export const Loading: Story = { args: { variant: "primary", loading: true, children: "Saving..." } };
export const Disabled: Story = { args: { variant: "primary", disabled: true, children: "Disabled" } };
```

### Theme Decorator (dark/light)
```tsx
// .storybook/preview.tsx
import "../styles/globals.css";

const preview = {
  decorators: [
    (Story, context) => (
      <div className={context.globals.theme === "dark" ? "dark" : ""}>
        <div className="bg-bg-primary text-text-primary p-4 min-h-screen">
          <Story />
        </div>
      </div>
    ),
  ],
  globalTypes: {
    theme: {
      name: "Theme",
      defaultValue: "dark",
      toolbar: { items: ["dark", "light"], dynamicTitle: true },
    },
  },
};
```

### Running
```bash
npm run storybook      # http://localhost:6006
npm run build-storybook # static build
```

---

## Build Order (Bottom-Up)

1. **Design Tokens** → globals.css + tailwind.config.ts
2. **Atoms** → Button, Input, Badge, Tag, etc. (with Storybook stories)
3. **Molecules** → FormGroup, SearchInput, StatCard, etc.
4. **Organisms** → Sidebar, PageHeader, then page-specific organisms
5. **Pages** → Wire organisms together with API data

Build and test each level in Storybook before moving up.

# Stack detection rules

Read by `detect-stack` and `install-banner` at runtime, and parsed verbatim by
`tests/stacks.test.ts`: this is the one copy of the rules, not a description of a copy that lives
somewhere else.

## Table grammar

- Rows are evaluated **top to bottom**. The first row whose **Signals** hold wins. Order is what
  disambiguates — Nuxt, Astro, SvelteKit and Remix repos all have `vite` as a dependency, so Vite
  sits below them; a Shopify theme may carry a `package.json` for build tooling, so it sits above
  everything.
- **Signals**: alternatives separated by ` OR `; terms inside one alternative joined by ` + `. An
  alternative holds when every one of its terms holds.
  - `dep:<name>` — `<name>` is a key in the repo root's `package.json`, under `dependencies` **or**
    `devDependencies`.
  - `file:<glob>` — at least one file in the repo matches `<glob>`.
  - `any` — always holds. Only the last row uses this, and the last row must.
- **Head file**: globs separated by ` OR `, in priority order. The first glob that matches at least
  one file wins. A glob may carry a `#has:<text>` suffix: only files whose contents contain `<text>`
  count as a match. The rows test for `</head>`, not `<head`, because `<head` is also the start of
  `<header>`.

## The table

| # | Stack | Signals | Head file |
| --- | --- | --- | --- |
| 1 | Shopify theme | `file:layout/theme.liquid` | `layout/theme.liquid` |
| 2 | Next.js | `dep:next` | `app/layout.tsx OR app/layout.jsx OR app/layout.ts OR app/layout.js OR src/app/layout.tsx OR src/app/layout.jsx OR src/app/layout.ts OR src/app/layout.js OR pages/_document.tsx OR pages/_document.jsx OR pages/_document.ts OR pages/_document.js OR src/pages/_document.tsx OR src/pages/_document.jsx OR src/pages/_document.ts OR src/pages/_document.js` |
| 3 | Nuxt | `dep:nuxt` | `nuxt.config.ts OR nuxt.config.js OR nuxt.config.mjs` |
| 4 | Astro | `dep:astro` | `src/layouts/**/*.astro#has:</head> OR src/pages/**/*.astro#has:</head>` |
| 5 | SvelteKit | `dep:@sveltejs/kit` | `src/app.html` |
| 6 | Remix / React Router v7 | `dep:@remix-run/react OR dep:@react-router/dev` | `app/root.tsx OR app/root.jsx OR app/root.ts OR app/root.js` |
| 7 | Vite | `dep:vite` | `index.html#has:</head>` |
| 8 | Custom build | `any` | `index.html#has:</head> OR public/index.html#has:</head> OR src/index.html#has:</head> OR _layouts/**/*.html#has:</head> OR layouts/**/*.html#has:</head> OR templates/**/*.html#has:</head> OR _includes/**/*.html#has:</head>` |

## Ambiguity pre-checks

Run these **before** resolving a row's Head file column. Each row names two groups of globs. If
**each** group matches at least one file, the stack is ambiguous: report every matched file and ask
the user which one serves the site's live pages. Never pick one yourself.

Without this, first-glob-wins would silently answer a question that has two real answers — the
groups below are exactly the globs that sit in one ordered `OR` list in the table above, where only
the leftmost could ever win.

| # | Stack | Group A | Group B |
| --- | --- | --- | --- |
| 2 | Next.js | `app/layout.tsx OR app/layout.jsx OR app/layout.ts OR app/layout.js OR src/app/layout.tsx OR src/app/layout.jsx OR src/app/layout.ts OR src/app/layout.js` | `pages/_document.tsx OR pages/_document.jsx OR pages/_document.ts OR pages/_document.js OR src/pages/_document.tsx OR src/pages/_document.jsx OR src/pages/_document.ts OR src/pages/_document.js` |
| 4 | Astro | `src/layouts/**/*.astro#has:</head>` | `src/pages/**/*.astro#has:</head>` |

A row needs an entry here when files from two of its globs could both serve live pages and only the
leftmost would ever win. Inside one `**` glob that cannot happen: it already returns several files,
so the "more than one match → ask" branch reaches them. Across globs it can — on the Astro blog
starter a layout and two pages each hold their own `<head>`, and first-glob-wins would put the tag
in the layout alone, leaving the home page without a banner. Row 8's variants
(`index.html`, `public/index.html`, a template directory) are different conventions, not rival
entry points in one repo, so first-glob-wins is the answer there rather than a question.

### One shared head component is one answer

Before asking, whether a pre-check fired or one glob matched several files, read the first child of
each candidate's `<head>`. If it is the same component in every candidate, imported from the same
file, that file is the head file and there is nothing to ask. On the Astro blog starter every
`<head>` starts with `<BaseHead />` from `src/components/BaseHead.astro`, so the tag goes there and
reaches every page. Two components with the same name imported from different files are not
shared.

## Per-stack insertion rules

`SRC` below means the `src` value from the snippet `get_install_snippet` returned — never retyped,
never rebuilt.

### 1. Shopify theme

Head file: `layout/theme.liquid`. Anchor: the line containing `{{ content_for_header }}` (also
matches `{{content_for_header}}`, with no spaces). Insert the tag on a new line **immediately
after** that line. If the anchor is not in the file, insert immediately before `</head>` instead.

```liquid
{{ content_for_header }}
<script id="cookiepal" src="SRC" defer></script>
```

> ⚠️ **This is the one stack where "before other scripts" is not fully achievable.** Shopify
> requires `content_for_header` to come first in `<head>`, and that tag is what injects Shopify's
> own scripts. Directly after it is the earliest position the platform permits — say this to the
> user rather than claim the banner blocks everything. The snippet for a Shopify store carries
> `defer`; that is intended, so leave it.

### 2a. Next.js, App Router

Head file: `app/layout.tsx`, `app/layout.jsx`, `app/layout.ts`, `app/layout.js`, or the same under
`src/app/`. Insert a raw tag as the first child of `<head>`. If the layout has no `<head>`, add one
as the first child of `<html>`, above `<body>`:

```tsx
<head>
  {/* eslint-disable-next-line @next/next/no-sync-scripts -- the consent default must run before any other script */}
  <script id="cookiepal" src="SRC"></script>
</head>
```

Do not use `next/script` with `strategy="beforeInteractive"`: in the App Router, Next appends that
tag at the end of `<head>`, after its own chunks, so an inline tag manager snippet above it runs
first and the consent default arrives late. The lint comment follows the rule in 2b.

### 2b. Next.js, Pages Router

Head file: `pages/_document.tsx`, `pages/_document.jsx`, `pages/_document.js`, or the same under
`src/pages/`. Insert a raw tag as the first child of the `<Head>` component imported from
`next/document`:

```tsx
{/* eslint-disable-next-line @next/next/no-sync-scripts -- the consent default must run before any other script */}
<script id="cookiepal" src="SRC"></script>
```

A script with no `async` or `defer` trips `@next/next/no-sync-scripts`, which `next/core-web-vitals`
makes an error, so without the comment `next build` fails on Next 13 to 15. Add it only when the
repo lints with `eslint-config-next`: ESLint reports a disable comment for a rule it has no plugin
for.

If **both** an `app/layout.*` and a `pages/_document.*` exist in the same repo, do not guess: name
both files and ask the user which router serves the pages the banner must cover.

### 3. Nuxt

Head file: `nuxt.config.ts`, `nuxt.config.js`, or `nuxt.config.mjs`. Add to `app.head.script` inside
the config object passed to `defineNuxtConfig`, creating `app`, `head` and `script` where any of
them is missing:

```ts
app: {
  head: {
    script: [{ src: 'SRC', id: 'cookiepal', tagPosition: 'head', tagPriority: 'critical' }],
  },
},
```

`tagPriority: 'critical'` is what puts the tag ahead of other head tags; this runs earlier than a
`useHead` call in `app.vue`, which is why the config file is the head file for Nuxt and `app.vue` is
not.

### 4. Astro

Head file: the one `.astro` file under `src/layouts/` or `src/pages/` whose contents contain
`</head>`. Insert as the first child of `<head>`, **with `is:inline`**:

```astro
<script is:inline id="cookiepal" src="SRC"></script>
```

Without `is:inline`, Astro processes, bundles and may reorder the script, which loses the early
execution the banner needs.

When the head file is a shared head component (see "One shared head component is one answer"), it
has no `<head>` of its own: insert the tag as its first element, after its frontmatter and any
leading comment, and edit nothing else.

### 5. SvelteKit

Head file: `src/app.html`. Insert on a new line **immediately before** the `%sveltekit.head%`
placeholder:

```html
<script id="cookiepal" src="SRC"></script>
%sveltekit.head%
```

### 6. Remix / React Router v7

Head file: `app/root.tsx`, `app/root.jsx`, `app/root.ts`, or `app/root.js`. Insert a raw tag as the
first child of `<head>`, above `<Meta />` and `<Links />`:

```tsx
<script id="cookiepal" src="SRC"></script>
<Meta />
<Links />
```

In React Router v7 framework mode the `<head>` sits inside the exported `Layout` component; in
Remix v2 it sits in the default export. Find the literal `<head>` and insert there either way —
which export it is in does not change the rule.

### 7. Vite

Head file: `index.html` at the repo root (**not** `public/index.html`, which Vite copies verbatim
into the build output and does not use as the page entry). Insert as the first child of `<head>`.

### 8. Custom build

Head file: the one HTML or template file containing `<head>`, found by the globs in the table
above, in order. If exactly one file matches, use it. If more than one matches, list them all and
ask the user which one the live pages are built from — do not edit more than one. If none matches,
say the head file could not be found, show the globs that were tried, and stop without editing
anything.

## The "already installed" check

This applies before installing, whatever the stack. Search every text file in the repo for the
banner script's path, skipping these directories — build output and vendored code carry other
people's tags, and a hit in one says nothing about this site:

```skip
node_modules
dist
build
.git
.next
.nuxt
.svelte-kit
.output
.astro
```

The search is for:

```
/client_data/
```

The `CLIENT_DATA` matcher in `src/install.ts` applies the same rule to a parsed URL:

```
/\/client_data\/[^/]+\/script\.js(?:[?#]|$)/
```

In source text the path sits inside quotes rather than standing alone as a URL, so match this
instead — the same rule, written for the other place it is read from:

```
/\/client_data\/[^/\s"'`]+\/script\.js/
```

Both spellings share the literal fragment `/client_data/`. `tests/stacks.test.ts` asserts that this
file, `src/install.ts` and the fixtures all still agree on it, so changing the CDN path in one place
fails the suite rather than silently leaving three stale copies.

- **A live tag whose `src` is the one `get_install_snippet` returned** → already installed. Change
  nothing. Name the file and the line it is on, and point the user at
  `/cookiepal:verify-installation`.
- **A match only inside a comment** (`<!-- -->`, `//`, `/* */`, `{# #}`, `{% comment %}`) → treat as
  not installed. Install normally, and say the commented-out tag was found and left alone.
- **A live tag whose `src` names a different `/client_data/<id>/`** → a tag for another domain. Do
  not add a second one: a page with two CookiePal banners has them fighting over consent. Show both
  script URLs and ask the user which one should be there.
- **Nothing found** → install. Say that a tag injected by a tag manager would not show up in a
  repository search, and that `/cookiepal:verify-installation` is what settles whether one is live.

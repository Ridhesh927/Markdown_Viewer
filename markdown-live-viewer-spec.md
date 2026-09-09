# Markdown Live Viewer --- Project Specification

## 1. Project Overview

Build a polished, responsive **Markdown Live Viewer** web application.

The application allows a user to:

-   Drag and drop a `.md` / `.markdown` file into the browser.
-   Read and edit the Markdown content.
-   See the rendered HTML preview update immediately.
-   View Markdown with useful styling, including code blocks, tables,
    headings, lists, blockquotes, links, and inline formatting.
-   Automatically generate a table of contents from headings.
-   Copy individual code blocks.
-   Download the rendered document as a **standalone `.html` file**.
-   Clear/reset the current document.

The application is intentionally **ephemeral**. Do not add a database,
authentication, backend, cloud storage, or persistence layer.

All Markdown processing should happen locally in the browser.

------------------------------------------------------------------------

## 2. Required Technology Stack

Use:

-   React
-   Vite
-   JavaScript or JSX
-   Tailwind CSS
-   marked.js for Markdown → HTML conversion
-   DOMPurify for sanitizing generated HTML

Do not introduce a backend.

Prefer a small dependency footprint. Do not add libraries unless there
is a clear technical reason.

------------------------------------------------------------------------

## 3. Core User Flow

The main flow is:

``` text
User drops/selects .md file
        ↓
Browser FileReader API
        ↓
Markdown text
        ↓
React state
        ↓
marked.js
        ↓
DOMPurify
        ↓
Sanitized HTML
        ↓
Preview
        ↓
Optional standalone HTML export
```

More specifically:

1.  User opens the application.
2.  User sees an empty-state/drop zone.
3.  User drags a Markdown file onto the drop zone OR uses a file picker.
4.  Validate that the selected file is a Markdown file.
5.  Read the file using the browser `FileReader` API.
6.  Store the text in React state.
7.  Render the Markdown through `marked.js`.
8.  Sanitize the generated HTML with `DOMPurify`.
9.  Display the result in the preview panel.
10. User can edit Markdown directly in the editor.
11. Preview updates as the Markdown changes.
12. User can inspect the generated table of contents.
13. User can copy individual code blocks.
14. User can download the rendered document as a standalone HTML file.
15. User can click Clear/Reset to return to the initial empty state.
16. Refreshing the browser should remove the current document because
    there is intentionally no persistence.

------------------------------------------------------------------------

# 4. UI / UX Requirements

## 4.1 Overall Design

Create a modern developer-tool interface.

The UI should feel like a small polished product rather than a raw demo.

Recommended visual direction:

-   Dark-first interface.
-   Clean neutral background.
-   High contrast text.
-   Subtle borders.
-   Rounded cards/panels.
-   Clear primary action buttons.
-   Monospace typography for code/editor areas.
-   Good spacing and hierarchy.
-   Minimal unnecessary decoration.

Also support a light theme if practical.

The design should remain usable on:

-   Desktop
-   Laptop
-   Tablet
-   Smaller screens

Do not make the interface depend on a fixed desktop width.

------------------------------------------------------------------------

# 5. Main Layout

Use a layout similar to:

``` text
┌─────────────────────────────────────────────────────────────┐
│ Markdown Live Viewer                         Theme / Clear  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Drop .md file here / Choose File                           │
│                                                             │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│  Markdown Editor         │  Rendered Preview                │
│                          │                                  │
│  # Hello                 │  Hello                           │
│                          │  ─────                           │
│  Some **markdown**       │  Some markdown                   │
│                          │                                  │
│                          │  [Copy] code block               │
│                          │                                  │
├──────────────────────────┴──────────────────────────────────┤
│ Table of Contents / document information / actions          │
└─────────────────────────────────────────────────────────────┘
```

The exact layout can differ if there is a stronger UX solution, but the
following capabilities must remain obvious.

------------------------------------------------------------------------

# 6. Empty State

When no Markdown file has been loaded:

Show a prominent drop zone containing:

-   Markdown/file icon or simple visual indicator.
-   Text such as:
    -   "Drop your Markdown file here"
    -   "or choose a .md file"
-   Browse/Choose File button.
-   Supported format information.
-   Clear visual hover/drag-over state.

The drop zone must react visually while a file is being dragged over it.

Do not automatically accept arbitrary file types.

------------------------------------------------------------------------

# 7. File Handling

Support:

-   `.md`
-   `.markdown`

File handling must happen entirely in the browser.

Use:

``` javascript
FileReader
```

or an equivalent browser-native file reading approach.

Validation:

-   Reject unsupported file extensions/types.
-   Display a clear user-facing error.
-   Do not crash the application when an invalid file is dropped.

Also handle:

-   Empty files.
-   Very large files reasonably.
-   Read errors.
-   Multiple dropped files by processing the first valid Markdown file
    or clearly informing the user.

Do not upload files to a server.

------------------------------------------------------------------------

# 8. Markdown Editor

Provide a Markdown editor after a document is loaded.

The editor should:

-   Show the complete Markdown source.
-   Allow direct editing.
-   Update preview immediately or with a very small debounce.
-   Preserve whitespace/newlines.
-   Support normal keyboard editing.
-   Have a readable monospace font.
-   Have adequate padding.
-   Have a clear focus state.

A `<textarea>` is acceptable for the first version.

Do not build a complex custom code editor unless necessary.

The goal is functionality and reliability, not unnecessary complexity.

------------------------------------------------------------------------

# 9. Markdown Rendering

Use `marked.js`.

The renderer should support normal Markdown features including:

-   Headings
-   Paragraphs
-   Bold
-   Italic
-   Strikethrough where supported
-   Ordered lists
-   Unordered lists
-   Nested lists
-   Links
-   Images
-   Blockquotes
-   Inline code
-   Fenced code blocks
-   Tables
-   Horizontal rules
-   Escaped characters

Configure `marked.js` appropriately.

The rendering pipeline must be:

``` text
Markdown
   ↓
marked.js
   ↓
Generated HTML
   ↓
DOMPurify
   ↓
Safe HTML
   ↓
React preview
```

Do not directly inject unsanitized `marked.js` output into the DOM.

------------------------------------------------------------------------

# 10. Security Requirements

Security is a first-class requirement.

Markdown is user-controlled input.

Before rendering HTML:

``` text
marked.parse(markdown)
        ↓
DOMPurify.sanitize(html)
        ↓
render sanitized HTML
```

Protect against:

-   `<script>` injection
-   Event-handler attributes such as `onerror`
-   Dangerous HTML
-   JavaScript URLs
-   Other XSS vectors supported by the browser

Do not bypass DOMPurify.

Do not use unsafe HTML rendering without sanitization.

For links, ensure dangerous URL protocols such as `javascript:` cannot
be used.

The downloaded HTML should also contain only sanitized/generated
content.

------------------------------------------------------------------------

# 11. Code Blocks

Code blocks are a major feature.

Requirements:

-   Render fenced code blocks clearly.
-   Use a monospace font.
-   Preserve whitespace.
-   Provide syntax highlighting.

Use a lightweight syntax-highlighting solution compatible with
`marked.js`.

If adding a syntax-highlighting dependency, keep it minimal and
configure it correctly.

Each code block should have a visible:

``` text
Copy
```

button.

Copy behavior:

1.  User clicks Copy.
2.  Code is copied using the Clipboard API.
3.  Button temporarily changes to something like:
    -   "Copied!"
4.  After a short delay it returns to "Copy".

If Clipboard API is unavailable, provide a graceful fallback or clear
error.

Do not copy the Markdown fence markers.

Copy only the actual code content.

------------------------------------------------------------------------

# 12. Table of Contents

Automatically generate a table of contents from Markdown headings.

At minimum support:

``` text
# Heading 1
## Heading 2
### Heading 3
```

The TOC should:

-   Extract headings from the rendered/document structure.
-   Generate stable anchor IDs.
-   Preserve heading hierarchy.
-   Allow users to click an item.
-   Scroll to the corresponding heading.

Example:

``` text
Table of Contents

1. Introduction
2. Installation
   2.1 Requirements
   2.2 Setup
3. Usage
4. API
```

Avoid duplicate or invalid IDs.

If two headings have the same text, generate unique IDs.

Example:

``` text
installation
installation-1
installation-2
```

The TOC should update whenever the Markdown changes.

------------------------------------------------------------------------

# 13. Preview

The preview should look like a properly styled documentation/article
page.

Style at least:

-   `h1`
-   `h2`
-   `h3`
-   `h4`
-   paragraphs
-   lists
-   blockquotes
-   links
-   inline code
-   code blocks
-   tables
-   images
-   horizontal rules

Tables should have:

-   Borders
-   Cell padding
-   Header distinction
-   Horizontal scrolling on narrow screens if required

Code blocks should be visually separated from normal text.

Links should be clearly recognizable.

Images should not overflow the preview container.

Long words/URLs should wrap safely.

------------------------------------------------------------------------

# 14. Download as HTML

Provide a prominent:

``` text
Download HTML
```

action.

When clicked:

1.  Take the current Markdown.
2.  Render it with `marked.js`.
3.  Sanitize the resulting HTML.
4.  Build a complete HTML document.
5.  Embed the necessary CSS directly into the HTML.
6.  Trigger a browser download.

The downloaded file must work independently.

Example structure:

``` html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    /* Embedded document styles */
  </style>
</head>
<body>
  <main class="markdown-body">
    <!-- Sanitized generated HTML -->
  </main>
</body>
</html>
```

Important:

-   No backend.
-   No external runtime dependency required for basic document
    rendering.
-   CSS must be embedded.
-   Do not put the entire React application inside the exported file.
-   Export only the rendered document and the styles required to display
    it.

Use a sensible filename such as:

``` text
markdown-document.html
```

If the original file name is available, derive the output name from it:

``` text
README.md → README.html
```

Sanitize the filename before using it for download.

------------------------------------------------------------------------

# 15. Clear / Reset

Provide a Clear or Reset button.

When clicked:

-   Remove the current Markdown.
-   Clear preview.
-   Clear TOC.
-   Return to the empty state.
-   Reset relevant UI state.

No data should remain in localStorage/sessionStorage unless there is a
deliberate reason. This project is intentionally ephemeral.

------------------------------------------------------------------------

# 16. State Management

Do not use Redux or another global state library.

React state is sufficient.

A reasonable state model:

``` javascript
const [markdown, setMarkdown] = useState("");
const [fileName, setFileName] = useState("");
const [isDragging, setIsDragging] = useState(false);
const [error, setError] = useState("");
const [theme, setTheme] = useState("dark");
```

Derived values such as rendered HTML and TOC should be calculated from
the Markdown rather than duplicated unnecessarily in state.

Avoid state duplication.

------------------------------------------------------------------------

# 17. Suggested Component Architecture

Keep components reasonably separated.

Suggested structure:

``` text
src/
├── components/
│   ├── Header.jsx
│   ├── DropZone.jsx
│   ├── MarkdownEditor.jsx
│   ├── MarkdownPreview.jsx
│   ├── TableOfContents.jsx
│   ├── CodeBlock.jsx
│   └── EmptyState.jsx
│
├── utils/
│   ├── markdownRenderer.js
│   ├── toc.js
│   ├── downloadHtml.js
│   └── fileUtils.js
│
├── App.jsx
├── main.jsx
└── index.css
```

This is a suggestion, not a command to create files that do nothing.

Do not split tiny pieces into unnecessary components.

------------------------------------------------------------------------

# 18. Markdown Rendering Utility

Create a centralized Markdown rendering pipeline instead of scattering
parsing logic throughout components.

Conceptually:

``` javascript
function renderMarkdown(markdown) {
  const rawHtml = marked.parse(markdown);
  return DOMPurify.sanitize(rawHtml);
}
```

Configure marked once rather than repeatedly creating separate
configurations.

If syntax highlighting requires additional processing, keep it inside
the rendering layer.

------------------------------------------------------------------------

# 19. TOC Implementation

The TOC can be generated from the Markdown AST/output or from the
rendered heading elements.

A practical approach:

1.  Parse the Markdown.
2.  Identify heading tokens.
3.  Generate stable IDs.
4.  Ensure IDs are attached to rendered headings.
5.  Build a TOC array.

Example data:

``` javascript
[
  {
    id: "introduction",
    text: "Introduction",
    level: 1
  },
  {
    id: "installation",
    text: "Installation",
    level: 2
  }
]
```

Keep the TOC generation deterministic.

------------------------------------------------------------------------

# 20. Theme

Support dark mode as the primary design.

If implementing light mode:

-   Provide a visible theme toggle.
-   Make sure both themes have sufficient contrast.
-   Do not allow theme styles to break Markdown content.

The exported HTML should use a clean document style independent of the
application's dashboard UI.

------------------------------------------------------------------------

# 21. Responsive Behavior

Desktop:

``` text
Editor | Preview
```

Tablet:

``` text
Editor
Preview
```

or another layout that remains readable.

Mobile:

-   Stack sections vertically.
-   Make buttons usable with touch.
-   Avoid horizontal page overflow.
-   Allow horizontal scrolling only where appropriate, such as very wide
    code blocks/tables.
-   Keep the editor usable.

Do not simply shrink desktop elements until they become unusable.

------------------------------------------------------------------------

# 22. Accessibility

Implement basic accessibility properly.

Requirements:

-   Buttons must have accessible names.
-   File input must be accessible.
-   Drop zone should have a keyboard-accessible alternative.
-   Focus states must be visible.
-   Color contrast should be reasonable.
-   Do not communicate important information using color alone.
-   Images should have appropriate `alt` handling.
-   Error messages should be readable and associated with the relevant
    UI.

The app should remain usable without a mouse.

------------------------------------------------------------------------

# 23. Error Handling

Handle errors explicitly.

Potential errors:

### Invalid file

Display:

``` text
Please select a Markdown file (.md or .markdown).
```

### File reading failure

Display a useful error rather than silently failing.

### Empty document

Allow it, but display an appropriate empty preview state.

### Rendering failure

Do not crash the entire React application.

### Download failure

Display a clear message if browser download APIs fail.

Never expose raw stack traces to normal users.

------------------------------------------------------------------------

# 24. Performance

This is a client-side application.

Optimize for normal Markdown documents without overengineering.

Requirements:

-   Avoid unnecessary re-renders.
-   Avoid parsing Markdown multiple times for the same render.
-   Use memoization only where it provides actual value.
-   Debounce editor rendering if necessary for large documents.
-   Do not introduce a complicated state-management architecture.

For normal files, preview updates should feel immediate.

------------------------------------------------------------------------

# 25. Security vs UX Trade-off

Do not sacrifice sanitization for richer HTML.

The priority is:

``` text
Security
   >
Correct rendering
   >
Convenience
```

If a Markdown feature requires unsafe HTML, prefer safe behavior.

------------------------------------------------------------------------

# 26. What NOT to Build

Do NOT add:

-   Backend server
-   Database
-   Authentication
-   User accounts
-   Cloud uploads
-   API
-   Firebase
-   Supabase
-   MongoDB
-   PostgreSQL
-   Login system
-   Chat
-   Collaboration
-   Real-time multiplayer editing
-   Complex persistence
-   AI features
-   Analytics
-   Payment system

These are outside the project scope.

Do not turn a small Markdown viewer into a SaaS platform.

------------------------------------------------------------------------

# 27. Visual Quality Requirements

The final UI should not look like a default Tailwind tutorial.

Pay attention to:

-   Spacing
-   Typography
-   Border radius
-   Panel hierarchy
-   Button states
-   Hover states
-   Focus states
-   Empty states
-   Drag-over feedback
-   Loading/read states
-   Error states
-   Code block presentation
-   Table styling

Use subtle animations only where they improve interaction.

Avoid excessive animations.

------------------------------------------------------------------------

# 28. Project Setup

If the repository is empty:

1.  Create a Vite React application.
2.  Configure Tailwind CSS.
3.  Install required dependencies.
4.  Set up the source structure.
5.  Implement the application.
6.  Run the development server.
7.  Run tests.
8.  Run production build.

If an existing project already has a React/Vite/Tailwind setup:

-   Inspect it first.
-   Reuse the existing structure where sensible.
-   Do not overwrite unrelated files.
-   Do not replace working configuration without a reason.

------------------------------------------------------------------------

# 29. Required Dependencies

At minimum:

``` text
react
react-dom
marked
dompurify
```

Add a syntax highlighting library only if required by the
implementation.

Do not add packages simply because they are convenient.

------------------------------------------------------------------------

# 30. Testing Requirements

Before considering the project complete, test:

### File handling

-   Drop valid `.md`
-   Select valid `.md`
-   Drop `.markdown`
-   Reject `.txt`
-   Reject unsupported files
-   Handle empty file

### Markdown rendering

Test:

-   Heading
-   Paragraph
-   Bold
-   Italic
-   Lists
-   Links
-   Blockquotes
-   Tables
-   Inline code
-   Fenced code
-   Images
-   Horizontal rule

### Security

Test malicious Markdown/HTML such as:

``` html
<script>alert("xss")</script>
```

and:

``` html
<img src=x onerror=alert(1)>
```

The scripts/events must not execute.

Also test dangerous links such as:

``` markdown
[click me](javascript:alert('xss'))
```

### Editor

-   Editing changes preview.
-   New headings update TOC.
-   Removing headings removes TOC entries.

### TOC

-   Correct heading hierarchy.
-   Clicking entries scrolls to the correct heading.
-   Duplicate headings receive unique IDs.

### Copy

-   Copies only code.
-   Button gives feedback.
-   Multiple code blocks work independently.

### Download

-   `.html` file downloads.
-   File contains complete HTML structure.
-   CSS is embedded.
-   Rendered Markdown is present.
-   Sanitized content is exported.

### Reset

-   Clear removes all current document state.

### Build

Run:

``` bash
npm test
npm run build
```

Fix all build errors.

If the project does not currently have a test setup, add a minimal
appropriate test setup rather than pretending tests exist.

------------------------------------------------------------------------

# 31. Definition of Done

The project is complete only when all of the following work:

-   [ ] React + Vite application runs.
-   [ ] Tailwind styling works.
-   [ ] `.md` files can be dragged and dropped.
-   [ ] `.md` files can be selected through a file picker.
-   [ ] Markdown is loaded entirely in the browser.
-   [ ] Markdown can be edited.
-   [ ] Preview updates live.
-   [ ] `marked.js` performs Markdown parsing.
-   [ ] DOMPurify sanitizes rendered HTML.
-   [ ] Headings render correctly.
-   [ ] Lists render correctly.
-   [ ] Tables render correctly.
-   [ ] Links render correctly.
-   [ ] Code blocks render correctly.
-   [ ] Syntax highlighting works.
-   [ ] Code blocks have Copy buttons.
-   [ ] Copy feedback works.
-   [ ] TOC is automatically generated.
-   [ ] TOC links scroll to headings.
-   [ ] Duplicate heading IDs are handled.
-   [ ] Download HTML works.
-   [ ] Exported HTML contains embedded CSS.
-   [ ] Exported HTML does not depend on the React app.
-   [ ] Clear/reset works.
-   [ ] No database or persistence exists.
-   [ ] Invalid files produce useful errors.
-   [ ] XSS payloads are sanitized.
-   [ ] Responsive layout works.
-   [ ] Basic accessibility requirements are met.
-   [ ] `npm test` passes.
-   [ ] `npm run build` passes.

------------------------------------------------------------------------

# 32. Development Rules for Antigravity

You are implementing this project inside an existing coding workspace.

Before changing anything:

1.  Inspect the existing repository.
2.  Identify the current framework and package manager.
3.  Inspect `package.json`.
4.  Inspect the existing `src` structure.
5.  Inspect existing Tailwind/Vite configuration.
6.  Reuse working infrastructure.

Then implement the smallest clean architecture that satisfies this
specification.

Important rules:

-   Do not modify unrelated files.
-   Do not delete existing functionality without a reason.
-   Do not rewrite the entire project unnecessarily.
-   Do not install duplicate libraries.
-   Do not create placeholder components that are never used.
-   Do not hardcode fake Markdown output.
-   Do not fake the download functionality.
-   Do not fake syntax highlighting.
-   Do not skip DOMPurify.
-   Do not use a backend.
-   Do not add persistence.

After implementation:

``` bash
npm run dev
npm test
npm run build
```

Fix actual errors rather than hiding them.

------------------------------------------------------------------------

# 33. Verification Checklist

After implementation, manually verify this exact scenario:

Create a Markdown file containing:

``` markdown
# Markdown Live Viewer

This is **bold** and this is *italic*.

## Features

- Drag and drop
- Live preview
- Code highlighting
- Table of contents

## Code

```javascript
function hello(name) {
  console.log(`Hello ${name}`);
}
```

## Table

  Feature    Status
  ---------- ---------
  Markdown   Working
  Preview    Working
  Export     Working

## Security

```{=html}
<script>alert("XSS")</script>
```

    Load it into the application.

    Verify:

    1. The file loads.
    2. Markdown is displayed in the editor.
    3. Preview updates.
    4. Heading structure appears in the TOC.
    5. Clicking a TOC item scrolls correctly.
    6. Code is syntax highlighted.
    7. Copy copies only the JavaScript.
    8. The script does not execute.
    9. Table renders correctly.
    10. Editing the Markdown updates the preview.
    11. Download HTML produces a working standalone document.
    12. Clear returns to the initial state.

    ---

    # 34. Final Deliverable

    Produce a complete working Markdown Live Viewer, not merely a visual mockup.

    The final result should be:

    ```text
    Small
    Fast
    Secure
    Responsive
    Client-side only
    Easy to understand
    Easy to maintain

The most important engineering principle is:

> Build the simplest reliable implementation that satisfies the complete
> feature set. Do not overengineer the project.

# Markdown Live Viewer

> A fast, private, and responsive web application to view, edit, and convert Markdown files into beautifully styled documents and standalone HTML files.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌟 Overview

**Markdown Live Viewer** allows you to drag and drop any `.md` or `.markdown` file into the browser, edit it in real-time, view live rendered HTML with syntax highlighting and diagrams, and export the result as an all-in-one standalone `.html` file.

The application is entirely **client-side and ephemeral** — no files or data are ever uploaded to a server or external database. All parsing, rendering, and exporting take place directly in your browser.

---

## ✨ Features

- 📂 **Drag & Drop / File Picker**: Easily load Markdown files from your computer or test with sample Markdown.
- ⚡ **Live Side-by-Side Editor**: Real-time preview with a line-numbered Markdown editor and draggable resizable split panels (horizontal on desktop, vertical on mobile/tablet).
- 🎨 **Rich Styling & Typography**: Polished GitHub-style typography, tables, blockquotes, task lists, and custom alerts.
- 💻 **Syntax Highlighting**: Built-in syntax highlighting for JavaScript, TypeScript, Python, Bash, HTML, CSS, JSON, YAML, and more.
- 📊 **Mermaid Diagrams**: Interactive flowchart, sequence, and state diagram rendering directly from markdown code blocks.
- 📋 **One-Click Code Copy**: Copy snippets directly from rendered code blocks with instant visual feedback.
- 📑 **Auto-Generated Table of Contents**: Dynamic navigation drawer built from headings with smooth scrolling to sections.
- 💾 **Standalone HTML Export**: Download the rendered document as a single, self-contained `.html` file that includes all styles and works offline in any browser.
- 🌓 **Dark & Light Mode**: Built-in theme switcher with automatic detection of your system color preference.
- 🔒 **Safe & Secure**: Robust sanitization powered by DOMPurify to protect against XSS injection.

---

## 📁 Project Structure

```text
Markdown_Viewer/
├── public/                     # Static assets
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── DropZone.jsx        # Drag-and-drop & file selector landing screen
│   │   ├── Header.jsx          # App header with theme toggle, clear, & export buttons
│   │   ├── Icons.jsx           # SVG icon components
│   │   ├── MarkdownEditor.jsx  # Line-numbered live Markdown textarea editor
│   │   ├── MarkdownPreview.jsx # HTML preview panel with Mermaid rendering & copy buttons
│   │   ├── ResizableSplit.jsx  # Draggable divider component for split panels
│   │   └── TableOfContents.jsx # Collapsible table of contents drawer & navigation
│   ├── test/                   # Test configuration and suites
│   │   ├── setup.js            # Vitest environment setup
│   │   └── utils.test.js       # Unit tests for rendering, sanitization, and TOC utilities
│   ├── utils/                  # Core helper modules & utilities
│   │   ├── downloadHtml.js     # Standalone HTML bundle generator and file download helper
│   │   ├── fileUtils.js        # File reading, validation, and sample markdown loader
│   │   ├── markdownRenderer.js # Marked parser configuration, syntax highlighter, and DOMPurify sanitizer
│   │   └── toc.js              # Heading extractor and anchor slug generator
│   ├── App.jsx                 # Top-level application component and state management
│   ├── index.css               # Global styling, Tailwind directives, and markdown typography
│   └── main.jsx                # React application entry point
├── index.html                  # HTML template entry point
├── markdown-live-viewer-spec.md# Detailed project technical specification
├── package.json                # Project dependencies, scripts, and metadata
├── postcss.config.js           # PostCSS configuration for Tailwind CSS
├── tailwind.config.js          # Tailwind CSS theme configuration
└── vite.config.js              # Vite bundler and Vitest test runner configuration
```

---

## 🚀 How to Run

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `pnpm` / `yarn`)

### 1. Clone the Repository

```bash
git clone https://github.com/Ridhesh927/Markdown_Viewer.git
cd Markdown_Viewer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will start locally at **`http://localhost:5173`** (or the port specified in terminal output). Open the URL in your browser to start viewing and editing Markdown files.

---

## 🛠️ Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Start Dev Server** | `npm run dev` | Runs the Vite development server with Hot Module Replacement (HMR). |
| **Build for Production** | `npm run build` | Bundles and optimizes the app for production in the `dist/` directory. |
| **Preview Build** | `npm run preview` | Locally serves the production build from `dist/` for testing. |
| **Run Unit Tests** | `npm test` | Runs the test suites using [Vitest](https://vitest.dev/). |
| **Lint Code** | `npm run lint` | Runs ESLint to check for code quality and syntax issues. |

---

## 💻 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Markdown Parsing**: [Marked](https://marked.js.org/)
- **HTML Sanitization**: [DOMPurify](https://github.com/cure53/DOMPurify)
- **Diagrams**: [Mermaid](https://mermaid.js.org/)
- **Testing**: [Vitest](https://vitest.dev/) & [Testing Library](https://testing-library.com/)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

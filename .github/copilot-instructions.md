# GitHub Copilot Instructions

These guidelines help GitHub Copilot generate clean, context-aware, and maintainable code for my projects. It is intended to reduce hallucinated logic, prevent unnecessary complexity, and preserve coding standards across languages and frameworks.

---

## 🧠 General Philosophy

- Prefer **clear, maintainable code** over clever or overly abstract solutions.
- When a fix is obvious, **go with the straightforward option** — avoid unnecessary workarounds.
- Favor **progressive enhancement** and **incremental refactoring** rather than wholesale rewrites.
- Maintain the tone and architectural direction of the surrounding code.

---

## 🧱 Project Structure & Conventions

Structure varies slightly depending on language and framework, but some standards are universal:

### 🔄 Common Structure

- Organize code into logical folders:
  - `controllers/`, `routes/`, `models/`, `services/`, `middleware/`, `utils/` (backend)
  - `components/`, `assets/`, `styles/`, `hooks/`, `store/` (frontend)
- Configuration files and `.env` files should be kept in the project root.
- Do not hardcode secrets or config values — use environment variables.
- Favor modular code: one responsibility per file.

### 📦 Dependency Management

- **Python**: Use `requirements.txt`, virtual environments, and avoid unpinned versions in production.
- **Node.js**: Use `package.json`, and lock files (`package-lock.json` or `yarn.lock`) to ensure consistent environments.
- Avoid bloated or unnecessary third-party libraries.
- If a dependency is added, ensure it’s:
  - Well-maintained
  - Popular and community-tested
  - Necessary

---

## ✍️ Code Style & Formatting

### Python

- Follow [PEP 8](https://peps.python.org/pep-0008/)
- Use:
  - `black` for formatting
  - `flake8` or `pylint` for linting
  - Type hints where clarity is improved
- File names: `snake_case.py`

### JavaScript / TypeScript

- Use camelCase for variables/functions, PascalCase for classes/components.
- Use:
  - Prettier for formatting
  - ESLint (with Airbnb or Standard config) for linting
- File names: `kebab-case.js` or `PascalCase.jsx` for components

### HTML / CSS / Templating

- Use semantic HTML5
- Use Mustache, Jinja, or JSX appropriately depending on project context
- Keep styles modular or scoped where supported (e.g. CSS modules, Tailwind)

---

## 🧪 Testing

- Favor **testable, modular code** — write functions that are easy to isolate.
- Project testing tools include:
  - Python: `pytest`, `unittest`
  - JavaScript: `jest`, `vitest`
- Testing folder conventions:
  - `tests/` for Python
  - `__tests__/` or colocated `.test.js/.test.ts` for JS
- Use mocking for APIs, external services, or DB calls.

---

## ⚙️ Runtime Environment & Config

- Use `.env` files and `dotenv` packages for all environment-specific variables.
- Code should run on local dev machines and be deployable to:
  - Vercel (frontend)
  - Azure or Docker (backend/API)
  - Netlify (static/web apps)
- Avoid hardcoding paths, secrets, or platform-specific logic.

---

## 🔐 Security

- **Never expose secrets, tokens, or API keys** — these must be injected via environment variables.
- Validate and sanitize **all user inputs** (especially in web apps).
- Avoid dynamic `eval`, `exec`, or raw SQL.
- Implement secure headers, CORS policies, and HTTPS where applicable.

---

## ⚡ Performance & Reliability

- Use efficient data structures and avoid redundant processing.
- Cache repetitive or expensive operations where appropriate.
- Don’t over-optimize prematurely — prefer **clean working code first**.
- If using async logic (promises, `async/await`), handle errors with `try/catch` or `.catch()`.

---

## 🧹 Clean Code Practices

- Remove unused imports, variables, and functions.
- No commented-out blocks of old code — use version control.
- Use descriptive names — no single-letter vars except in small scopes (e.g. `i` in loops).
- Document **why**, not just what — use comments for explaining purpose or context, not syntax.

---

## 🧠 When in Doubt

- Mirror the style and conventions already in the file or repo.
- Choose the **most idiomatic** and **widely recognized** approach for the given language.
- Provide fallback or alternative logic only if necessary.
- Avoid adding complexity unless it solves a real problem.

---

> Place this file in `.github/copilot-instructions.md` to help guide GitHub Copilot in generating context-aware, maintainable code aligned with this project’s standards.

# GitHub Copilot Instructions

These are detailed coding guidelines and usage conventions for GitHub Copilot. This file exists to guide Copilot in producing correct, maintainable, and idiomatic code across my personal and collaborative projects.

---

## 🧠 General Philosophy

- Favor **readable and maintainable code** over clever or abstract solutions.
- When an error or bug is likely, **assume it's worth investigating**, not working around.
- **Do not overcomplicate fixes** — if the correct solution is simple and direct, use it.
- Use the project’s **existing patterns and architecture** as a base unless explicitly told otherwise.

---

## 🛠️ Use of Copilot Chat Commands

Copilot Chat should actively use its built-in functionality to stay accurate and useful. You are encouraged to:

- Use `/explain` to summarize what unfamiliar or complex code is doing before editing.
- Use `/fix` to attempt repairs **only after understanding the context** and consulting logs or problems.
- Use `/tests` to generate relevant test cases for new or modified logic.
- Use `/terminal` to check recent terminal output or errors related to the changes being made.
- Use `/problems` to inspect current issues in the Problems tab before proposing new code.
- Use `/code` or `/edit` to modify specific blocks **only after context-aware evaluation**.

> When debugging or troubleshooting, **always cross-reference the output from `/terminal` and `/problems`** — do not assume silence equals success.

---

## 🧱 Project Structure & Layout

Organize and maintain a clean folder structure based on project type:

### Python / Flask / Backend

- Common folders: `routes/`, `controllers/`, `models/`, `services/`, `utils/`, `tests/`
- Use `__init__.py` files to manage modules.
- Entry points should be minimal — keep logic out of `main.py` or `app.py`.
- Separate config logic from application logic.
- Load environment variables from `.env` using `dotenv`.

### Node.js / JavaScript / Express

- Organize into: `routes/`, `controllers/`, `middleware/`, `models/`, `services/`, `utils/`
- Use ES6 modules or CommonJS consistently (do not mix).
- Keep startup logic clean and separate from app logic (`server.js` or `index.js`).

### Frontend Projects

- Organize components in `components/`, global state in `store/`, styles in `styles/`
- Use functional React components and hooks
- Prefer `Tailwind` or modular CSS for styling when present
- Keep logic and markup co-located only when it improves readability

---

## ✍️ Code Style & Patterns

### Python

- Follow PEP 8
- Use `black` for formatting
- Use type hints where useful
- Follow `snake_case` for functions/variables, `PascalCase` for classes

### JavaScript / TypeScript

- Use camelCase for variables/functions, PascalCase for components/classes
- Use `async/await` with `try/catch`, avoid callback hell
- Format with Prettier, lint with ESLint

### HTML / Templates

- Use semantic HTML5
- Use Jinja2, Mustache, or JSX templating syntax as appropriate
- Ensure views/components are modular and reusable

---

## 🔐 Security & Reliability

- Never hardcode secrets, tokens, or passwords
- Validate and sanitize all external input
- Escape user-provided content before rendering it
- Use HTTPS and secure headers when applicable
- Handle errors explicitly and provide informative messages/logs

---

## ⚙️ Tooling and Environment

- Use `.env` files for environment variables
- Use `dotenv` in Python or `dotenv/config` in Node
- Ensure compatibility across platforms (macOS, Linux, Windows)
- Always provide setup instructions for new dependencies

---

## 🧪 Testing and Debugging

- Use `/tests` to generate unit tests with clear structure
- Python: use `pytest` or `unittest`, colocated in a `tests/` directory
- JS: use `jest` or `vitest`, tests should mirror the source file layout
- Include tests for:
  - Normal usage
  - Edge cases
  - Error handling paths

### Troubleshooting Checklist

When things go wrong, Copilot should:

- Check `/terminal` for crash logs, stack traces, and runtime errors
- Use `/problems` to view current linting and type errors
- Run `/explain` on suspicious or confusing blocks
- Run `/fix` only after reviewing logs and understanding the issue
- Suggest logging or error outputs to help isolate bugs

---

## ⚡ Performance and Optimization

- Optimize **after** a working baseline is established
- Prefer clean, performant data structures and native methods
- For expensive operations:
  - Use memoization, caching, or pagination
- For async code, always handle both success and failure paths

---

## 🧹 Clean Code Practices

- Delete commented-out or unused code
- Avoid one-letter variable names (except `i`, `j` in loops)
- Document complex logic but keep comments minimal
- Ensure consistency in spacing, naming, and ordering
- Refactor when similar patterns repeat more than twice

---

## ✅ Final Expectations

Copilot should:

- Use `/explain`, `/problems`, `/terminal`, and `/tests` to improve quality
- Write code that runs **cleanly without issues** in Problems tab or terminal
- Follow the **existing architecture and idioms** of the repo
- Write comments only when the logic isn’t self-evident
- Strive for correctness and developer clarity first, performance second

---

> This file provides structure and expectations for GitHub Copilot. It should be located in `.github/copilot-instructions.md` to guide consistent, accurate, and readable code generation across all projects.

# Contributing to AutoParse

We welcome contributions! Please follow these guidelines:

## Code Quality Standards
- **TypeScript**: Strict mode is enabled. No `any` unless absolutely necessary.
- **Linting**: ESLint and Prettier are configured. Run `npm run lint` before committing.
- **Commits**: Follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.). Husky hooks will run lint-staged on pre-commit.

## Architecture
- Do NOT mix business logic into controllers/routes. Keep it in services.
- Never write direct DB queries in UI components. Use React Query calling API routes.
- Keep the separation between `app/` (Frontend/Routing) and `src/` (Backend core).

## Local Development
1. `npm install`
2. Set up `.env` using `.env.example` as a template.
3. Start the dev server: `npm run dev`

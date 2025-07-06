# Access Control Dashboard

A React + TypeScript dashboard for managing users, roles, and access control, featuring modern UI components and global notification support.

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm (v8+ recommended)

### Installation

```bash
git clone <your-repo-url>
cd access-control-dashboard
npm install
```

### Running the App

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) (or as specified in your terminal).

### Building for Production

```bash
npm run build
```

### Linting & Type Checking

```bash
npm run lint
npm run typecheck
```

## Project Structure

- `src/`
  - `apis/` — API logic for authentication, users, roles
  - `auth/` — Route guards for authentication/privileges
  - `components/` — UI components (shadcn/ui)
  - `contexts/` — React context providers (e.g., Auth)
  - `hooks/` — Custom React hooks
  - `layouts/` — Layout components
  - `lib/` — Utility libraries (e.g., notification)
  - `pages/` — Page-level components
  - `utils/` — HTTP and utility functions

## Notifications

Use the global notification system via:

```ts
import { globalNotify } from "@/lib/notify";
globalNotify({ title: "Success", description: "Action completed!" });
```

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/foo`)
3. Commit your changes (`git commit -am 'Add foo'`)
4. Push to the branch (`git push origin feature/foo`)
5. Open a Pull Request

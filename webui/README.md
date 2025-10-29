# Open Playground

A modern React TypeScript Single Page Application (SPA) built with the latest technologies.

## Tech Stack

- **React 19** - UI library
- **TypeScript 5.9** - Type safety and better DX
- **Vite 7** - Lightning fast build tool with HMR
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **ESLint 9** - Code linting
- **Prettier 3** - Code formatting

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (Home, About, NotFound)
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── services/       # API services and external integrations
├── layouts/        # Layout components
├── App.tsx         # Main app component with routing
└── main.tsx        # App entry point
```

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build

Build for production:

```bash
npm run build
```

### Preview

Preview the production build:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Lint and auto-fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Features

- Modern React with TypeScript
- Fast development with Vite HMR
- Beautiful UI with Tailwind CSS v4
- Client-side routing with React Router
- Code quality with ESLint and Prettier
- Production-ready build optimization

## License

MIT

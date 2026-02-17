# FrontEnd-Continuum

Frontend application for the Continuum platform - a comprehensive system for tracking entities, journals, connections, and user progress.

## Technologies

This project is built with:

- **Vite** - Lightning fast build tool
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - High-quality UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Hook Form** - Form management

## Getting Started

### Prerequisites

- Node.js (v18+) or Bun
- npm, yarn, or bun package manager

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd FrontEnd-Continuum

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
VITE_API_BASE_URL=https://continuum-backend.onrender.com
VITE_APP_NAME=Continuum
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # Reusable UI components (shadcn-ui)
│   └── [other]       # Feature-specific components
├── pages/            # Page components (routed)
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── stores/           # Zustand state stores
├── contexts/         # React context providers
└── pages/            # Page routes
```

## API Integration

The application communicates with the Continuum Backend API using Axios.

### Base URL

Default: `https://continuum-backend.onrender.com`

Can be customized via `VITE_API_BASE_URL` environment variable.

### Authentication

- Tokens are stored in `localStorage` as `continuum_token`
- Authorization header: `Bearer {token}`
- Automatic redirect to login on 401 responses

## Building & Deployment

### Production Build

```sh
npm run build
```

The `dist` folder will contain the optimized build ready for deployment.

### Deployment Options

The application can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## License

MIT

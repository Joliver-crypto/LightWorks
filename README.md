# LightWork - Optics Bench Lab Application

A production-quality frontend for optics bench lab applications. Configure devices, manage workflows, and orchestrate experiments with an intuitive Tinkercad-style interface.

## Features

- **2D Top-View Editor**: Drag-and-drop device placement with snap-to-grid functionality
- **Device Management**: Support for lasers, mirrors, cameras, motors, and more
- **Real-time Status**: Live device status monitoring and telemetry
- **Workflow Automation**: Create and manage automated workflows
- **Extension Marketplace**: Install device drivers and analysis tools
- **Project Management**: Save/load projects with full validation

## Technology Stack

### Frontend
- **React 18** + **TypeScript** - Modern React with full type safety
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React-Konva** - High-performance 2D canvas for device rendering
- **Zustand** - Lightweight state management
- **React Query** - Server state management and caching
- **Zod** - Runtime type validation
- **Radix UI** - Accessible component primitives

### Development
- **Vitest** - Fast unit testing
- **Testing Library** - Component testing utilities
- **ESLint** + **Prettier** - Code quality and formatting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LightWork
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── Shell/          # Main application shell
│   ├── Canvas/         # 2D canvas components
│   ├── Panels/         # Sidebar panels
│   └── Common/         # Reusable UI components
├── routes/             # Page components
├── state/              # Zustand stores
├── api/                # API client and mock data
├── models/             # TypeScript types and Zod schemas
├── utils/              # Utility functions
└── tests/              # Unit tests
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend URL (set to use real backend instead of mock)
VITE_BACKEND_URL=http://localhost:8000

# Use mock API (set to true for development without backend)
VITE_USE_MOCK_API=true
```

### Backend Integration

The application can run in two modes:

1. **Mock Mode** (default): Uses mock data and simulated API responses
2. **Backend Mode**: Connects to a real backend server

To switch to backend mode:
1. Set `VITE_USE_MOCK_API=false` in your `.env` file
2. Ensure your backend server is running on the configured URL

## Usage

### Creating a Project

1. Click "New Project" in the top toolbar
2. Configure your optics bench table in the right sidebar
3. Drag devices from the left palette to the canvas
4. Connect devices and configure their properties

### Device Management

- **Add Devices**: Drag from the palette to the canvas
- **Select Devices**: Click to select, drag to select multiple
- **Move Devices**: Drag selected devices to new positions
- **Rotate Devices**: Use the rotation handle or press 'R'
- **Configure Devices**: Use the inspector panel on the right

### Workflows

1. Navigate to the Workflows tab in the left sidebar
2. Create new workflows or edit existing ones
3. Use the Run/Stop buttons in the top toolbar to execute workflows

### Extensions

1. Navigate to the Extensions tab in the left sidebar
2. Browse available device drivers and analysis tools
3. Install extensions to enable new device types

## Keyboard Shortcuts

- `Ctrl+N` - New Project
- `Ctrl+O` - Open Project
- `Ctrl+S` - Save Project
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+K` - Command Palette
- `R` - Rotate selected device
- `Shift+R` - Rotate selected device (reverse)
- `Delete` - Delete selected devices
- `Ctrl+D` - Duplicate selected devices
- `Ctrl+A` - Select all devices
- `Escape` - Clear selection
- `Ctrl+0` - Fit to screen
- `Ctrl+=` - Zoom in
- `Ctrl+-` - Zoom out
- `F5` - Run workflow
- `Escape` - Stop workflow

## Development

### Running Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix
```

### Code Formatting

```bash
# Format code with Prettier
npx prettier --write .
```

## Architecture

### State Management

The application uses Zustand for state management with three main stores:

- **ProjectStore**: Manages project data, devices, and table configuration
- **SelectionStore**: Handles device selection and multi-select
- **UIStore**: Manages UI state, viewport, and modal states

### Canvas Rendering

The 2D canvas is built with React-Konva and organized into layers:

- **GridLayer**: Renders the hole grid and snap points
- **DeviceLayer**: Renders all devices with status indicators
- **SelectionLayer**: Handles selection marquee and handles

### API Integration

The application includes both mock and real API clients:

- **MockClient**: Provides simulated data for development
- **ApiClient**: Connects to real backend services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies and best practices
- Inspired by Tinkercad's intuitive interface design
- Designed for the scientific research community



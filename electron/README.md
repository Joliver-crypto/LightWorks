# LightWorks Electron Setup

This directory contains the Electron configuration for LightWorks desktop app.

## Files

- `main.js` - Electron main process that creates the app window and handles file system operations
- `preload.js` - Preload script that safely exposes Electron APIs to the renderer process

## Development

To run the app in development mode:

```bash
npm run dev:electron
```

This will:
1. Start the Vite dev server on http://localhost:3000
2. Wait for the server to be ready
3. Launch Electron and load the app from the dev server

## Building

To build the app for distribution:

```bash
npm run build:electron
```

This will:
1. Build the React app with Vite
2. Package everything into a distributable app using electron-builder

## File System Access

The Electron app provides full file system access through the main process:

- Files are saved to `~/Documents/LightWorks/Experiments/` and `~/Documents/LightWorks/Community/`
- All file operations (read, write, list, create directories) work natively
- Native file dialogs for opening and saving files
- No more browser download limitations!

## Security

The app uses Electron's context isolation and preload scripts for security:
- No `nodeIntegration` in the renderer process
- All file system operations go through IPC to the main process
- Only necessary APIs are exposed to the renderer










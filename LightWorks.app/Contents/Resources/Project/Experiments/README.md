# LightWorks Experiments

This folder contains your personal optical experiments and table designs. Each table is stored as a separate LightWorks file with the `.lightworks` extension.

## File Format

Each table file follows the LightWorks format specification:

- **Format**: `lightworks` (version 1)
- **Components**: Optical components with both continuous poses and discrete hole poses
- **Connections**: Beam paths between components
- **Grid**: Configurable hole grid with pitch, thread type, and origin
- **View**: Zoom, pan, and display settings
- **Assets**: Thumbnails and notes
- **History**: Command log for undo/redo (optional)

## File Structure

```
Experiments/
├── README.md
├── sample-raman-setup.lightworks
├── my-laser-setup.lightworks
└── ...
```

## Sharing

- **Personal**: Files in this folder are your personal experiments
- **Community**: Files in the `../Community/` folder are shared designs
- **Export**: Use the export function to share individual tables
- **Import**: Use the import function to add shared tables

## File Naming

- Files are automatically named based on your experiment name
- Special characters are automatically sanitized (e.g., "My Experiment!" becomes "my-experiment.lightworks")
- Keep experiment names under 50 characters for better compatibility

## Backup

- Files are stored locally in this folder
- Consider backing up this folder regularly
- The LightWorks format is human-readable and version-controllable

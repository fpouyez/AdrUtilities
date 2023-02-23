# ADR Utilities

ADR Utilities is a toolset for create and mange your Architecture Decision Records.

Why another extension ? Because it manages multiple ADR directories, and follows its own rules for naming and managing content.

## Features

### Create an ADR

Right-click on the explorer or by command palette.

### Navigate with CodeLens

Each mention of ADR in a text editor (which matches the naming pattern) enables a codelens link to navigate to this ADR.

If the name doesn't match a real ADR, the CodeLens annotation marks it as not navigable.

## Requirements

None

## Extension Settings

### adrDirectoryName

To change the name of ADR folders used by this extension.

### adrFilePrefix

Prefix use in ADR filename, to differenciate ADR files from other MD files.

### enableCodeLensNavigation

Enable CodeLens navigation to ADRs.
## Known Issues

None

## Release Notes

### 0.1

Initial release of ADR Utilities

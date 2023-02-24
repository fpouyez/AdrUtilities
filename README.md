# ADR Utilities

ADR Utilities is a toolset for create and manage your Architecture Decision Records.

Why another extension ? Because it manages multiple ADR directories and follows its own rules for naming and managing content.

## Conventions

This extension manipulates ADR files by a naming conventions, which follows this pattern :
```{prefix}{shortTitle}_{timestamp}.md```

* *prefix* : Identifies ADR among all yous markdown files. By default : 'ADR_'.
* *shortTitle* : Subject of your ADR. Ex : 'WhyWeUseAPatternForADR'.
* *timestamp* : A way to avoid collision among your ADRs. More convenient than an integer.

So by default :
```ADR_WhyWeUseAPatternForADR_20230225.md```

## Features

### Create an ADR

Right-click on the explorer (Create an ADR) or launch it with the command palette (ADR Create).

In the explorer, a new file is created into the current directory if its name matches the ADR directory name. If not, the command searches for an ADR directory in the first child directories. Otherwise, an ADR directory is created.

With the Palette, a directory choosing box is displayed to select an ADR location.

In all cases, you must complete the ADR file name by an input box.

Finally, the ADR file is filled with a template.

### Navigate with CodeLens

Each mention of ADR in a text editor (which matches the naming pattern) enables a codelens link to navigate to this ADR.

If the name doesn't match a real ADR, the CodeLens annotation marks it as not navigable.

## Requirements

vscode : 1.74.0 or more

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

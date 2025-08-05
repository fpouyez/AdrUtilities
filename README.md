<h1 align="center">ADR Utilities</h1>

<div align="center">

![Build Status](https://github.com/fpouyez/AdrUtilities/actions/workflows/release.yml/badge.svg)
![Security Scorecard](https://api.securityscorecards.dev/projects/github.com/fpouyez/AdrUtilities/badge)
![TypeScript](https://img.shields.io/badge/adr--utilities-typescript-0038e0?logo=adr-utilities)

**Complete toolset for creating and managing your Architecture Decision Records (ADR)**

</div>

## 🚀 Main Features

### ✨ Simplified ADR Creation
- **Right-click** in explorer or **command palette**
- **Automatic detection** of ADR directories
- **Flexible organization** (subdirectory or current directory)
- **Customizable templates** (French, English, MADR)
- **Smart naming** with timestamp

### 🔗 Navigation with CodeLens
- **Clickable links** to your ADRs in code
- **Automatic detection** of ADR references
- **Visual indicators** for non-found ADRs

### 📋 Template Preview
- **Preview** before creation
- **Standard and custom** templates
- **Complete MADR 4.0.0** support

## 🎯 Why this extension?

This extension manages **multiple ADR directories** simultaneously with flexible organization, essential for:
- **Complex projects** and monorepos
- **Multiple libraries**
- **Distributed teams**
- **Different organizational preferences**

It follows its own naming and content management rules while adapting to your project structure.

## 📦 Installation

1. Open VS Code
2. Go to Extensions tab (Ctrl+Shift+X)
3. Search for "ADR Utilities"
4. Click Install

**Requirements:** VS Code 1.101.0 or newer

## 🛠️ Quick Usage

### Create an ADR

#### Right-click Method
1. **Right-click** in explorer → "Create an ADR"
2. Choose location
3. Enter your ADR name
4. File is created with selected template

#### Command Palette Method
1. **Ctrl+Shift+P** → "ADR Create"
2. Select directory from the chooser
3. Enter your ADR name
4. File is created with selected template

#### ADR Directory Management
The extension intelligently manages ADR directories with flexible organization options:

- **Current directory**: If the current directory name matches the ADR directory name, the ADR is created there
- **Child directories**: If not found in current directory, it searches for an ADR directory in first-level child directories
- **Auto-creation**: If no ADR directory is found, one is automatically created (configurable)

**Flexible Organization:**
- **Subdirectory mode** (default): Creates ADRs in a dedicated `adr/` subdirectory
- **Current directory mode**: Creates ADRs directly in the selected directory
- **Custom directory names**: Use your own directory names (e.g., `decisions/`, `architecture/`)

This ensures your ADRs are always organized according to your preferences, even in complex project structures with multiple ADR directories.

### Navigate to an ADR
- ADR references in your code become **clickable**
- Click on the CodeLens link to open the ADR

### Preview a template
- **Ctrl+Shift+P** → "ADR Template Preview"
- View template content before creation

## ⚙️ Configuration

### Main Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `adrDirectoryName` | Name of ADR directories | `adr` |
| `adrFilePrefix` | Prefix for ADR files | `adr` |
| `autoCreateFolder` | Automatically create ADR subdirectory | `true` |
| `enableCodeLensNavigation` | Enable CodeLens navigation | `true` |
| `currentTemplate` | Default template | `defaultTemplateFrench` |

### Available Templates

- **`defaultTemplateFrench`** : Custom template in French
- **`defaultTemplateEnglish`** : Custom template in English  
- **`madrTemplateEnglish`** : MADR 4.0.0 template in English
- **`madrTemplateFrench`** : MADR 4.0.0 template in French

### Directory Organization

Control how ADR directories are created:

```json
{
  "adr-utilities.autoCreateFolder": true,    // Create subdirectory (default)
  "adr-utilities.adrDirectoryName": "adr"    // Custom directory name
}
```

**Organization Modes:**
- **`autoCreateFolder: true`** (default): Creates ADRs in `adr/` subdirectory
- **`autoCreateFolder: false`**: Creates ADRs directly in the selected directory
- **Custom names**: Use `adrDirectoryName` to specify custom directory names

**Examples:**
```bash
# Subdirectory mode (default)
project/
├── src/
├── docs/
└── adr/
    └── adr_MyDecision_20250127.md

# Current directory mode
project/
├── src/
├── docs/
└── adr_MyDecision_20250127.md

# Custom directory name
project/
├── src/
├── docs/
└── decisions/
    └── adr_MyDecision_20250127.md
```

### Custom Template

Use `customTemplatePath` to define your own template:
```json
{
  "adr-utilities.customTemplatePath": "/path/to/your/template.md"
}
```

## 📋 Naming Conventions

ADR files follow the pattern: `{prefix}{shortTitle}_{timestamp}.md`

**Example:** `adr_WhyWeUseAPatternForADR_20230225.md`

- **prefix**: Identifies ADRs among your markdown files
- **shortTitle**: Subject of your ADR (e.g., 'WhyWeUseAPatternForADR')
- **timestamp**: Avoids collisions (more convenient than an integer)

## 🔒 Security

This extension implements robust security measures:

- ✅ **Path injection protection**: Strict validation
- ✅ **Regex injection protection**: Automatic escaping
- ✅ **DoS attack protection**: Resource limitation
- ✅ **Input validation**: Complete sanitization

📖 [Complete details](./SECURITY.md)

## ⚡ Performance Optimizations

- **Automatic activation** for immediate CodeLens
- **Smart caching** of CodeLens results
- **Early exit** to avoid unnecessary processing
- **Multi-file support** for all file types

### Optimization Tips

1. Disable `enableCodeLensNavigation` if you don't need it
2. Use "ADR Navigation Enable/Disable" commands as needed
3. Extension automatically optimizes based on your usage patterns

## 🐛 Known Issues

No known issues currently.

## 📝 Release Notes

See [Changelog](./CHANGELOG.md) for version details.

## 🤝 Contributing

Contributions are welcome! Check the [project ADRs](./doc/adrs/) to understand architectural decisions.

## 📄 License

This project is under MIT license. See [LICENSE](./LICENSE) file for details.

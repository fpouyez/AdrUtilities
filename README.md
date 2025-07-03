<h1 align="center" style="border-bottom: none;">ADR Utilities</h1>
<h3 align="center">Toolset for create and manage your ADRs</h3>
<p align="center">
  <a href="https://github.com/fpouyez/AdrUtilities/actions/workflows/ci.yml">
    <img alt="Build states" src="https://github.com/fpouyez/AdrUtilities/actions/workflows/release.yml/badge.svg">
  </a>
  <a href="https://securityscorecards.dev/viewer/?uri=github.com/fpouyez/AdrUtilities">
    <img alt="OpenSSF Scorecard" src="https://api.securityscorecards.dev/projects/github.com/fpouyez/AdrUtilities/badge">
  </a>
  <a href="#badge">
    <img alt="adr-utilities:typescript" src="https://img.shields.io/badge/adr--utilities-typescript-0038e0?logo=adr-utilities">
  </a>
</p>

ADR Utilities is a toolset for create and manage your Architecture Decision Records.

Why another extension ? Because it manages multiple ADR directories (which is essential in huge projects / mono-repository projects / multiple libraries projects) and follows its own rules for naming and managing content.

## 🔒 Security

This extension implements robust security measures to protect against:

- **Path injection**: Strict validation of file paths
- **Regular expression injection**: Automatic escaping of special characters
- **Denial of service attacks**: Limitation of the number of files and matches
- **Input validation**: Sanitization and validation of all user inputs

See [SECURITY.md](./SECURITY.md) for more details about security measures.

## 📋 Conventions

This extension manipulates ADR files by a naming conventions, which follows this pattern :
```{prefix}{shortTitle}_{timestamp}.md```

- *prefix* : Identifies ADR among all your markdown files. See [the adrFilePrefix config](#adrfileprefix).
- *shortTitle* : Subject of your ADR. Ex : 'WhyWeUseAPatternForADR'.
- *timestamp* : A way to avoid collision among your ADRs. More convenient than an integer.

So by default :
```adr_WhyWeUseAPatternForADR_20230225.md```

## ✨ Features

### Create an ADR

Right-click on the explorer (Create an ADR) or launch it with the command palette (ADR Create).

In the explorer, a new file is created into the current directory if its name matches the ADR directory name. If not, the command searches for an ADR directory in the first child directories. Otherwise, an ADR directory is created.

With the Palette, a directory choosing box is displayed to select an ADR location.

In all cases, you must complete the ADR file name by an input box.

Finally, the ADR file is filled with a template.

### Navigate with CodeLens

Each mention of ADR in a text editor (which matches the naming pattern) enables a codelens link to navigate to this ADR.

If the name doesn't match a real ADR, the CodeLens annotation marks it as not navigable.

## 📋 Requirements

vscode : 1.92.0 or more

## ⚙️ Extension Settings

### adrDirectoryName

To change the name of ADR folders used by this extension.

Default : *'adr'*.

### adrFilePrefix

Prefix use in ADR filename, to differenciate ADR files from other MD files.

Default : *'adr'*.

### enableCodeLensNavigation

Enable CodeLens navigation to ADRs.

Default : *true*.

### enableCodeLensOnStartup

Enable CodeLens navigation automatically on startup. Set to false for better performance.

Default : *false*.

### currentTemplate

Template used to fill the created ADR.

Possible values :

- *'defaultTemplateFrench'* : a custom template created to fill our needs, in French.
- *'defaultTemplateEnglish'* : the same custom template, in English.
- *'madrTemplateEnglish'* : standard MADR (Markdown Architecture Decision Records) template with YAML frontmatter, in English.
- *'madrTemplateFrench'* : standard MADR (Markdown Architecture Decision Records) template with YAML frontmatter, in French.

Default : *defaultTemplateFrench*.

**If you select an unknown template name, a warning message will be displayed and the default French template will be used as a fallback.**

**MADR templates** follow the [MADR 4.0.0 specification](https://adr.github.io/madr/), with YAML metadata and a standardized structure. The French version is a faithful translation of the English MADR template, allowing you to document your architectural decisions in your preferred language while remaining compatible with industry standards.

## 🚀 Performance Optimizations

This extension has been optimized for better performance:

- **Lazy Activation**: The extension only activates when needed (commands executed)
- **Smart Caching**: CodeLens results are cached to avoid recalculation
- **Early Exit**: Quick checks prevent unnecessary processing of files without ADR references
- **Configurable Startup**: CodeLens can be disabled at startup for better initial load time
- **Cross-file Support**: CodeLens work on all file types to transform comments into ADR links

To maximize performance:

1. Set `enableCodeLensOnStartup` to `false` if you don't need CodeLens immediately
2. Use the command `ADR Navigation Enable` when you need CodeLens functionality
3. The extension will automatically optimize processing based on your usage patterns

## 🐛 Known Issues

None

## 📝 Release Notes

See [Changelog](./CHANGELOG.md)

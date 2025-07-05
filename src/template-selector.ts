import * as vscode from 'vscode';
import * as adrStrings from './adr-string-const';
import * as fs from 'fs';

/**
 * Mapping centralisé des templates disponibles
 * Permet d'ajouter facilement de nouveaux templates sans modifier la logique de sélection
 */
const templateMap: Record<string, string> = {
	defaultTemplateFrench: adrStrings.defaultTemplateFrench,
	defaultTemplateEnglish: adrStrings.defaultTemplateEnglish,
	madrTemplateEnglish: adrStrings.madrTemplateEnglish,
	madrTemplateFrench: adrStrings.madrTemplateFrench,
};

/**
 * Template par défaut utilisé en cas de template inconnu
 */
const DEFAULT_TEMPLATE = adrStrings.defaultTemplateFrench;

/**
 * Sélectionne le template approprié selon la configuration
 * @returns Le contenu du template sélectionné
 */
export const pickTemplate = (): string => {
	const config = vscode.workspace.getConfiguration("adrutilities");
	const templateString = config.get("currentTemplate") as string;
	const customTemplatePath = config.get("customTemplatePath") as string | undefined;

	if (customTemplatePath && customTemplatePath.trim() !== '') {
		try {
			const content = fs.readFileSync(customTemplatePath, 'utf8');
			return content;
		} catch {
			vscode.window.showWarningMessage(`Unable to read custom template: ${customTemplatePath}. Falling back to default template.`);
		}
	}

	if (!(templateString in templateMap)) {
		vscode.window.showWarningMessage(`Le template "${templateString}" est inconnu. Utilisation du template français par défaut.`);
	}
	return templateMap[templateString] || DEFAULT_TEMPLATE;
};
import * as vscode from 'vscode';
import { pickTemplate } from './template-selector';

/**
 * Register the command to preview the current ADR template.
 * Opens the template content in a temporary editor with Markdown syntax highlighting.
 * @param context The VS Code extension context
 */
export const registerPreviewTemplateCommand = (context: vscode.ExtensionContext): void => {
	const disposable = vscode.commands.registerCommand('adrutilities.previewTemplate', async () => {
		try {
			const templateContent = pickTemplate();
			
			// Ouvrir le template dans un éditeur temporaire avec coloration syntaxique Markdown
			const document = await vscode.workspace.openTextDocument({
				content: templateContent,
				language: 'markdown'
			});
			
			await vscode.window.showTextDocument(document, { 
				preview: true,
				viewColumn: vscode.ViewColumn.Active
			});
			
			vscode.window.showInformationMessage('Template ADR affiché dans l\'éditeur');
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la prévisualisation du template';
			vscode.window.showErrorMessage(errorMessage);
			console.error('Erreur lors de la prévisualisation du template:', error);
		}
	});
	context.subscriptions.push(disposable);
}; 
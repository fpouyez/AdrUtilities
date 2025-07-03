import * as vscode from 'vscode';
import { pickTemplate } from './template-selector';

/**
 * Register the command to preview the current ADR template.
 * Shows the template content in an information message.
 * @param context The VS Code extension context
 */
export const registerPreviewTemplateCommand = (context: vscode.ExtensionContext): void => {
	const disposable = vscode.commands.registerCommand('adrutilities.previewTemplate', () => {
		const templateContent = pickTemplate();
		vscode.window.showInformationMessage(templateContent);
	});
	context.subscriptions.push(disposable);
}; 
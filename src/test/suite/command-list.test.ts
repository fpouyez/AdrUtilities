import * as assert from 'assert';
import * as vscode from 'vscode';
import { list } from '../../command-list';

suite('Command-List Test Suite', () => {
	vscode.window.showInformationMessage('Start all list tests.');

	test('List should return empty array when no ADRs found', async () => {
        const adrList = await list();
		assert.strictEqual(0, adrList.length);
	});

	test('List should handle invalid prefix gracefully', async () => {
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
			} as vscode.WorkspaceConfiguration;
		};

		try {
			const adrList = await list();
			// Devrait utiliser le préfixe par défaut et ne pas planter
			assert(Array.isArray(adrList));
		} finally {
			// Restaure la fonction originale
			vscode.workspace.getConfiguration = originalGet;
		}
	});

	test('List should handle workspace.findFiles errors gracefully', async () => {
		// Mock de workspace.findFiles pour simuler une erreur
		const originalFindFiles = vscode.workspace.findFiles;
		vscode.workspace.findFiles = function() {
			return Promise.reject(new Error('Simulated error'));
		} as unknown as typeof vscode.workspace.findFiles;

		try {
			const adrList = await list();
			// Devrait retourner un tableau vide en cas d'erreur
			assert.strictEqual(adrList.length, 0);
		} finally {
			// Restaure la fonction originale
			vscode.workspace.findFiles = originalFindFiles;
		}
	});

	test('List should limit number of files returned', async () => {
		// Mock de workspace.findFiles pour retourner beaucoup de fichiers
		const originalFindFiles = vscode.workspace.findFiles;
		const mockFiles = Array.from({length: 2000}, (_, i) => 
			vscode.Uri.file(`/test/path/adr_test_${i}.md`)
		);
		
		vscode.workspace.findFiles = function() {
			return Promise.resolve(mockFiles);
		} as unknown as typeof vscode.workspace.findFiles;

		try {
			const adrList = await list();
			// Devrait être limité à 1000 fichiers maximum
			assert(adrList.length <= 1000);
		} finally {
			// Restaure la fonction originale
			vscode.workspace.findFiles = originalFindFiles;
		}
	});
});

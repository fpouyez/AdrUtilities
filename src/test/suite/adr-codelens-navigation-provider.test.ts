import * as assert from 'assert';
import * as vscode from 'vscode';
import { AdrCodelensNavigationProvider } from '../../adr-codelens-navigation-provider';
import { SecurityValidator } from '../../security-validator';

suite('ADR CodeLens Navigation Provider Test Suite', () => {
	vscode.window.showInformationMessage('Start all CodeLens provider tests.');

	test('Provider should be created successfully', () => {
		const provider = new AdrCodelensNavigationProvider();
		assert(provider instanceof AdrCodelensNavigationProvider);
	});

	test('Provider should handle invalid prefix in regex', () => {
		// Mock de la configuration avec un préfixe malveillant
		const originalGet = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string) {
					if (key === 'adrFilePrefix') {
						return 'adr.*+?^${}()|[\\]'; // Préfixe avec caractères regex spéciaux
					}
					return true;
				}
			} as any;
		};

		try {
			const provider = new AdrCodelensNavigationProvider();
			// Le provider devrait être créé sans erreur même avec un préfixe malveillant
			assert(provider instanceof AdrCodelensNavigationProvider);
		} finally {
			vscode.workspace.getConfiguration = originalGet;
		}
	});

	test('Provider should handle empty document', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document vide
		const mockDocument = {
			getText: () => '',
			lineAt: () => ({ text: '', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => null
		} as any;

		const result = await provider.provideCodeLenses(mockDocument, {} as any);
		assert(Array.isArray(result));
		assert.strictEqual(result.length, 0);
	});

	test('Provider should limit number of matches', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document avec beaucoup de références ADR
		const manyAdrRefs = 'adr_test_1.md\n'.repeat(2000); // 2000 références
		const mockDocument = {
			getText: () => manyAdrRefs,
			lineAt: () => ({ text: 'adr_test_1.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 10 } })
		} as any;

		const result = await provider.provideCodeLenses(mockDocument, {} as any);
		assert(Array.isArray(result));
		// Devrait être limité à 1000 matches maximum
		assert(result.length <= 1000);
	});

	test('Provider should handle regex execution errors', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document qui pourrait causer des problèmes avec regex
		const problematicText = 'adr_test.md\n'.repeat(100) + 'a'.repeat(10000); // Texte très long
		const mockDocument = {
			getText: () => problematicText,
			lineAt: () => ({ text: 'adr_test.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 10 } })
		} as any;

		const result = await provider.provideCodeLenses(mockDocument, {} as any);
		// Devrait retourner un tableau même en cas d'erreur
		assert(Array.isArray(result));
	});

	test('SecurityValidator integration in provider should work', () => {
		// Test que les fonctions de sécurité sont utilisées correctement
		assert.strictEqual(SecurityValidator.escapeRegex('adr_'), 'adr_');
		assert.strictEqual(SecurityValidator.escapeRegex('adr.*+?^${}()|[\\]'), 'adr\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\\\\\]');
		assert.strictEqual(SecurityValidator.validateAdrPrefix('adr_'), true);
		assert.strictEqual(SecurityValidator.validateAdrPrefix('<invalid>'), false);
	});
}); 
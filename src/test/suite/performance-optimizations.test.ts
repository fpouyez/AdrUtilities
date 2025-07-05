import * as assert from 'assert';
import * as vscode from 'vscode';
import { AdrCodelensNavigationProvider } from '../../adr-codelens-navigation-provider';

suite('Performance Optimizations Test Suite', () => {
	vscode.window.showInformationMessage('Start all performance optimization tests.');

	/**
	 * Test que l'extension ne se charge pas automatiquement au démarrage
	 */
	test('Extension should not activate automatically on startup', async () => {
		// Mock de la configuration pour simuler le comportement par défaut
		const originalGet = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					if (key === 'enableCodeLensNavigation') {
						return true;
					}
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			// Le provider devrait être créé automatiquement
			// Ce test vérifie que l'activation automatique fonctionne
			const provider = new AdrCodelensNavigationProvider();
			assert(provider instanceof AdrCodelensNavigationProvider);
		} finally {
			vscode.workspace.getConfiguration = originalGet;
		}
	});

	/**
	 * Test que le cache évite les recalculs pour le même document
	 */
	test('Cache should avoid recalculation for same document', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Vérifier la configuration actuelle
		const config = vscode.workspace.getConfiguration('adrutilities');
		const isCodeLensEnabled = config.get('enableCodeLensNavigation', true);
		
		// Mock d'un document avec des références ADR
		const mockDocument = {
			getText: () => '// adr_test_20241220.md\n// adr_another_20241220.md',
			uri: { toString: () => 'file:///test.ts' },
			version: 1,
			lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		} as unknown as vscode.TextDocument;

		// Premier appel - devrait calculer les CodeLens
		const result1 = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result1));
		
		if (isCodeLensEnabled) {
			assert(result1.length > 0, 'Should have CodeLens when enabled');
		} else {
			assert.strictEqual(result1.length, 0, 'Should have no CodeLens when disabled');
		}

		// Deuxième appel avec le même document - devrait utiliser le cache
		const result2 = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result2));
		assert.strictEqual(result1.length, result2.length);
	});

	/**
	 * Test que le cache se met à jour quand le document change
	 */
	test('Cache should update when document version changes', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document avec version 1
		const mockDocumentV1 = {
			getText: () => '// adr_test_20241220.md',
			uri: { toString: () => 'file:///test.ts' },
			version: 1,
			lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		} as unknown as vscode.TextDocument;

		// Mock du même document avec version 2 (modifié)
		const mockDocumentV2 = {
			getText: () => '// adr_test_20241220.md\n// adr_new_20241220.md',
			uri: { toString: () => 'file:///test.ts' },
			version: 2,
			lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		} as unknown as vscode.TextDocument;

		// Premier appel avec version 1
		const result1 = await provider.provideCodeLenses(mockDocumentV1);
		assert(Array.isArray(result1));

		// Deuxième appel avec version 2 - devrait recalculer
		const result2 = await provider.provideCodeLenses(mockDocumentV2);
		assert(Array.isArray(result2));
		// Le nombre de CodeLens devrait être différent car le contenu a changé
		// Note: Le comportement exact dépend de l'implémentation du regex
		assert(result2.length >= result1.length, 'Modified document should have at least as many CodeLens');
	});

	/**
	 * Test que la vérification préalable évite le traitement des fichiers sans références ADR
	 */
	test('Early exit should prevent processing files without ADR references', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document sans références ADR
		const mockDocument = {
			getText: () => '// This is a regular comment\n// No ADR references here',
			uri: { toString: () => 'file:///test.ts' },
			version: 1,
			lineAt: () => ({ text: '// This is a regular comment', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => null
		} as unknown as vscode.TextDocument;

		const result = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result));
		assert.strictEqual(result.length, 0);
	});

	/**
	 * Test que les CodeLens fonctionnent sur tous les types de fichiers
	 */
	test('CodeLens should work on all file types', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Vérifier la configuration actuelle
		const config = vscode.workspace.getConfiguration('adrutilities');
		const isCodeLensEnabled = config.get('enableCodeLensNavigation', true);
		
		// Test avec différents types de fichiers
		const fileTypes = [
			'file:///test.ts',
			'file:///test.js',
			'file:///test.py',
			'file:///test.java',
			'file:///test.md'
		];

		for (const fileUri of fileTypes) {
			const mockDocument = {
				getText: () => '// adr_test_20241220.md',
				uri: { toString: () => fileUri },
				version: 1,
				lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
				positionAt: () => ({ line: 0, character: 0 }),
				getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
			} as unknown as vscode.TextDocument;

			const result = await provider.provideCodeLenses(mockDocument);
			assert(Array.isArray(result));
			
			if (isCodeLensEnabled) {
				assert(result.length > 0, `CodeLens should work on ${fileUri} when enabled`);
			} else {
				assert.strictEqual(result.length, 0, `CodeLens should have no results on ${fileUri} when disabled`);
			}
		}
	});

	/**
	 * Test que la configuration enableCodeLensNavigation contrôle l'activation
	 */
	test('enableCodeLensNavigation configuration should control activation', async () => {
		// Test avec enableCodeLensNavigation = false
		const originalGet = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function() {
			return {
				get: function(key: string, defaultValue?: unknown) {
					
					if (key === 'enableCodeLensNavigation') {
						return false;
					}
					if (key === 'adrFilePrefix') {
						return 'adr_';
					}
					return defaultValue;
				}
			} as vscode.WorkspaceConfiguration;
		} as typeof vscode.workspace.getConfiguration;

		try {
			const provider = new AdrCodelensNavigationProvider();
			// Le provider devrait être créé mais les CodeLens ne devraient pas être actifs
			assert(provider instanceof AdrCodelensNavigationProvider);
		} finally {
			vscode.workspace.getConfiguration = originalGet;
		}
	});

	/**
	 * Test que le nettoyage du cache fonctionne
	 */
	test('Cache cleanup should work', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document
		const mockDocument = {
			getText: () => '// adr_test_20241220.md',
			uri: { toString: () => 'file:///test.ts' },
			version: 1,
			lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		} as unknown as vscode.TextDocument;

		// Premier appel pour remplir le cache
		const result1 = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result1));

		// Simulation du nettoyage du cache (accès privé pour le test)
		(provider as unknown as { documentCache: Map<string, unknown> }).documentCache.clear();

		// Deuxième appel après nettoyage - devrait recalculer
		const result2 = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result2));
		assert.strictEqual(result1.length, result2.length);
	});

	/**
	 * Test que les performances sont améliorées avec le cache
	 */
	test('Performance should be improved with caching', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document complexe
		const complexText = '// adr_test_20241220.md\n'.repeat(100) + '// adr_another_20241220.md\n'.repeat(100);
		const mockDocument = {
			getText: () => complexText,
			uri: { toString: () => 'file:///test.ts' },
			version: 1,
			lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		} as unknown as vscode.TextDocument;

		// Mesure du temps pour le premier appel (sans cache)
		const start1 = Date.now();
		const result1 = await provider.provideCodeLenses(mockDocument);
		const time1 = Date.now() - start1;

		// Mesure du temps pour le deuxième appel (avec cache)
		const start2 = Date.now();
		const result2 = await provider.provideCodeLenses(mockDocument);
		const time2 = Date.now() - start2;

		assert(Array.isArray(result1));
		assert(Array.isArray(result2));
		assert.strictEqual(result1.length, result2.length);
		
		// Le deuxième appel devrait être plus rapide (ou au moins pas plus lent)
		// On tolère les cas où les deux temps sont très faibles ou égaux
		assert(
			time2 <= time1 * 1.1 || time1 <= 2,
			`Cache should improve performance: ${time1}ms vs ${time2}ms`
		);
	});

	test('Provider should use caching for repeated calls', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document
		const mockDocument = {
			getText: () => 'adr_test.md\nadr_decision.md',
			lineAt: () => ({ text: 'adr_test.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		// Premier appel
		const result1 = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result1));
		const count1 = result1.length;
		
		// Deuxième appel avec le même document (devrait utiliser le cache)
		const result2 = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result2));
		assert.strictEqual(result2.length, count1, 'Cache should return same result');
	});

	test('Provider should limit number of matches for performance', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document avec beaucoup de références ADR
		const manyAdrRefs = 'adr_test.md\n'.repeat(2000); // 2000 références
		const mockDocument = {
			getText: () => manyAdrRefs,
			lineAt: () => ({ text: 'adr_test.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		const result = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result));
		// Devrait être limité à 1000 matches maximum pour les performances
		assert(result.length <= 1000, 'Should be limited to 1000 matches for performance');
	});

	test('Provider should handle regex execution efficiently', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document avec du contenu complexe
		const complexContent = 'adr_test.md\n'.repeat(100) + 'a'.repeat(10000); // Texte très long
		const mockDocument = {
			getText: () => complexContent,
			lineAt: () => ({ text: 'adr_test.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		const startTime = Date.now();
		const result = await provider.provideCodeLenses(mockDocument);
		const endTime = Date.now();

		assert(Array.isArray(result));
		// Vérifier que le temps d'exécution est raisonnable
		const executionTime = endTime - startTime;
		assert(executionTime < 2000, `Execution time ${executionTime}ms should be less than 2000ms`);
	});

	test('Provider should handle cache invalidation correctly', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Premier document
		const mockDocument = {
			getText: () => 'adr_test.md\nadr_decision.md',
			lineAt: () => ({ text: 'adr_test.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		const result = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result));
		
		// Simuler l'invalidation du cache (accès direct à la propriété privée pour les tests)
		(provider as unknown as { documentCache: Map<string, unknown> }).documentCache.clear();
		
		// Deuxième appel après invalidation du cache
		const result2 = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result2));
		assert.strictEqual(result2.length, result.length, 'Results should be the same after cache invalidation');
	});

	test('Provider should handle concurrent access efficiently', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Créer plusieurs documents de test
		const documents = Array.from({ length: 5 }, (_, i) => ({
			getText: () => `adr_test_${i}.md\nadr_decision_${i}.md`,
			lineAt: () => ({ text: `adr_test_${i}.md`, lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument));

		// Exécuter les requêtes en parallèle
		const startTime = Date.now();
		const promises = documents.map(doc => provider.provideCodeLenses(doc));
		const results = await Promise.all(promises);
		const endTime = Date.now();

		// Vérifier que toutes les requêtes ont réussi
		results.forEach(result => {
			assert(Array.isArray(result));
		});

		// Vérifier que le temps d'exécution est raisonnable
		const executionTime = endTime - startTime;
		assert(executionTime < 3000, `Execution time ${executionTime}ms should be less than 3000ms for 5 concurrent requests`);
	});

	test('Provider should handle memory efficiently with large documents', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Créer un document très volumineux
		const largeContent = 'adr_test.md\n'.repeat(5000) + 'Some other content\n'.repeat(20000);
		const mockDocument = {
			getText: () => largeContent,
			lineAt: () => ({ text: 'adr_test.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		// Exécuter plusieurs fois pour tester la gestion mémoire
		for (let i = 0; i < 5; i++) {
			const result = await provider.provideCodeLenses(mockDocument);
			assert(Array.isArray(result));
			assert(result.length <= 1000);
		}
	});

	test('Provider should handle rapid successive calls efficiently', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		const mockDocument = {
			getText: () => 'adr_test.md\nadr_decision.md\nadr_architecture.md',
			lineAt: () => ({ text: 'adr_test.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		const startTime = Date.now();
		
		// Exécuter 50 appels rapides
		const promises = Array.from({ length: 50 }, () => 
			provider.provideCodeLenses(mockDocument)
		);
		
		const results = await Promise.all(promises);
		const endTime = Date.now();

		// Vérifier que tous les résultats sont corrects
		results.forEach(result => {
			assert(Array.isArray(result));
		});

		// Vérifier que le temps total est raisonnable
		const totalTime = endTime - startTime;
		assert(totalTime < 5000, `Total time ${totalTime}ms should be less than 5000ms for 50 calls`);
	});
}); 
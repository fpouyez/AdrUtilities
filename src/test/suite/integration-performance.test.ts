import * as assert from 'assert';
import * as vscode from 'vscode';
import { AdrCodelensNavigationProvider } from '../../adr-codelens-navigation-provider';

suite('Integration Performance Test Suite', () => {
	vscode.window.showInformationMessage('Start all integration performance tests.');

	let originalGetConfiguration: typeof vscode.workspace.getConfiguration;

	setup(() => {
		originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = function(section?: string) {
			if (section === 'adrutilities') {
				return {
					get: (key: string, defaultValue?: unknown) => {
						if (key === 'enableCodeLensNavigation') {return true;}
				
						if (key === 'adrDirectoryName') {return 'adr';}
						if (key === 'adrFilePrefix') {return 'adr_';}
						if (key === 'currentTemplate') {return 'defaultTemplateFrench';}
						return defaultValue;
					},
					update: async () => true
				} as unknown as vscode.WorkspaceConfiguration;
			}
			return originalGetConfiguration(section);
		};
	});

	teardown(() => {
		vscode.workspace.getConfiguration = originalGetConfiguration;
	});

	/**
	 * Test d'intégration complet du workflow d'optimisation
	 */
	test('Complete optimization workflow should work', async () => {
		// 1. Créer un provider (simule l'activation manuelle)
		const provider = new AdrCodelensNavigationProvider();
		assert(provider instanceof AdrCodelensNavigationProvider, 'Provider should be created');
		
		// 2. Vérifier la configuration actuelle
		const config = vscode.workspace.getConfiguration('adrutilities');
		const isCodeLensEnabled = config.get('enableCodeLensNavigation', true);
		
		// 3. Tester le fonctionnement avec un document
		const mockDocument = {
			getText: () => '// adr_test_20241220.md\n// adr_another_20241220.md',
			uri: { toString: () => 'file:///test.ts' },
			version: 1,
			lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		} as unknown as vscode.TextDocument;
		
		const result = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result), 'Should return array of CodeLens');
		
		// Le résultat dépend de la configuration
		if (isCodeLensEnabled) {
			assert(result.length > 0, 'Should find CodeLens in document with ADR references when enabled');
		} else {
			assert.strictEqual(result.length, 0, 'CodeLens should be empty when disabled');
		}
	});

	/**
	 * Test que les performances sont maintenues avec plusieurs documents
	 */
	test('Performance should be maintained with multiple documents', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Vérifier la configuration actuelle
		const config = vscode.workspace.getConfiguration('adrutilities');
		const isCodeLensEnabled = config.get('enableCodeLensNavigation', true);
		
		// Créer plusieurs documents avec des contenus différents
		const documents = [
			{
				getText: () => '// adr_test1_20241220.md',
				uri: { toString: () => 'file:///test1.ts' },
				version: 1,
				lineAt: () => ({ text: '// adr_test1_20241220.md', lineNumber: 0 }),
				positionAt: () => ({ line: 0, character: 0 }),
				getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
			},
			{
				getText: () => '// adr_test2_20241220.md\n// adr_test3_20241220.md',
				uri: { toString: () => 'file:///test2.ts' },
				version: 1,
				lineAt: () => ({ text: '// adr_test2_20241220.md', lineNumber: 0 }),
				positionAt: () => ({ line: 0, character: 0 }),
				getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
			},
			{
				getText: () => '// No ADR references here',
				uri: { toString: () => 'file:///test3.ts' },
				version: 1,
				lineAt: () => ({ text: '// No ADR references here', lineNumber: 0 }),
				positionAt: () => ({ line: 0, character: 0 }),
				getWordRangeAtPosition: () => null
			}
		] as unknown as vscode.TextDocument[];
		
		// Traiter tous les documents
		const results = await Promise.all(
			documents.map(doc => provider.provideCodeLenses(doc))
		);
		
		// Vérifier les résultats selon la configuration
		assert.strictEqual(results.length, 3, 'Should process all documents');
		
		if (isCodeLensEnabled) {
			assert(results[0].length > 0, 'Document 1 should have CodeLens when enabled');
			assert(results[1].length > 0, 'Document 2 should have CodeLens when enabled');
		} else {
			assert.strictEqual(results[0].length, 0, 'Document 1 should have no CodeLens when disabled');
			assert.strictEqual(results[1].length, 0, 'Document 2 should have no CodeLens when disabled');
		}
		assert.strictEqual(results[2].length, 0, 'Document 3 should have no CodeLens (no ADR references)');
	});

	/**
	 * Test que le cache fonctionne correctement avec des modifications de documents
	 */
	test('Cache should work correctly with document modifications', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Vérifier la configuration actuelle
		const config = vscode.workspace.getConfiguration('adrutilities');
		const isCodeLensEnabled = config.get('enableCodeLensNavigation', true);
		
		// Document initial
		const documentV1 = {
			getText: () => '// adr_test_20241220.md',
			uri: { toString: () => 'file:///test.ts' },
			version: 1,
			lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		} as unknown as vscode.TextDocument;
		
		// Document modifié
		const documentV2 = {
			getText: () => '// adr_test_20241220.md\n// adr_new_20241220.md',
			uri: { toString: () => 'file:///test.ts' },
			version: 2,
			lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		} as unknown as vscode.TextDocument;
		
		// Premier appel
		const result1 = await provider.provideCodeLenses(documentV1);
		assert(Array.isArray(result1));
		const count1 = result1.length;
		
		// Deuxième appel avec le même document (devrait utiliser le cache)
		const result2 = await provider.provideCodeLenses(documentV1);
		assert(Array.isArray(result2));
		assert.strictEqual(result2.length, count1, 'Cache should return same result');
		
		// Troisième appel avec document modifié (devrait recalculer)
		const result3 = await provider.provideCodeLenses(documentV2);
		assert(Array.isArray(result3));
		
		if (isCodeLensEnabled) {
			assert(result3.length >= count1, 'Modified document should have at least as many CodeLens when enabled');
		} else {
			assert.strictEqual(result3.length, 0, 'Modified document should have no CodeLens when disabled');
		}
	});

	/**
	 * Test que les optimisations ne cassent pas la fonctionnalité de base
	 */
	test('Optimizations should not break basic functionality', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Vérifier la configuration actuelle
		const config = vscode.workspace.getConfiguration('adrutilities');
		const isCodeLensEnabled = config.get('enableCodeLensNavigation', true);
		
		// Test avec différents formats de références ADR
		const testCases = [
			'// adr_test_20241220.md',
			'/* adr_test_20241220.md */',
			'# adr_test_20241220.md',
			'<!-- adr_test_20241220.md -->',
			'  adr_test_20241220.md  ',
			'adr_test_20241220.md'
		];
		
		for (const testCase of testCases) {
			const mockDocument = {
				getText: () => testCase,
				uri: { toString: () => 'file:///test.ts' },
				version: 1,
				lineAt: () => ({ text: testCase, lineNumber: 0 }),
				positionAt: () => ({ line: 0, character: 0 }),
				getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: testCase.length } })
			} as unknown as vscode.TextDocument;
			
			const result = await provider.provideCodeLenses(mockDocument);
			assert(Array.isArray(result), `Should return array for: ${testCase}`);
			
			if (isCodeLensEnabled) {
				assert(result.length > 0, `Should find CodeLens for: ${testCase} when enabled`);
			} else {
				assert.strictEqual(result.length, 0, `Should have no CodeLens for: ${testCase} when disabled`);
			}
		}
	});

	/**
	 * Test de charge avec de nombreux documents
	 */
	test('Load test with many documents', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Vérifier la configuration actuelle
		const config = vscode.workspace.getConfiguration('adrutilities');
		const isCodeLensEnabled = config.get('enableCodeLensNavigation', true);
		
		// Créer 50 documents avec des contenus différents
		const documents = Array.from({ length: 50 }, (_, i) => ({
			getText: () => `// adr_test${i}_20241220.md`,
			uri: { toString: () => `file:///test${i}.ts` },
			version: 1,
			lineAt: () => ({ text: `// adr_test${i}_20241220.md`, lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		}) as unknown as vscode.TextDocument);
		
		// Mesurer le temps de traitement
		const startTime = Date.now();
		
		// Traiter tous les documents
		const results = await Promise.all(
			documents.map(doc => provider.provideCodeLenses(doc))
		);
		
		const endTime = Date.now();
		const processingTime = endTime - startTime;
		
		// Vérifier que tous les documents ont été traités
		assert.strictEqual(results.length, 50, 'Should process all 50 documents');
		results.forEach((result, index) => {
			assert(Array.isArray(result), `Document ${index} should return array`);
			if (isCodeLensEnabled) {
				assert(result.length > 0, `Document ${index} should have CodeLens when enabled`);
			} else {
				assert.strictEqual(result.length, 0, `Document ${index} should have no CodeLens when disabled`);
			}
		});
		
		// Le temps de traitement devrait être raisonnable (< 5 secondes pour 50 documents)
		assert(processingTime < 5000, `Processing time should be reasonable: ${processingTime}ms for 50 documents`);
		
		console.log(`Processed 50 documents in ${processingTime}ms`);
	});

	test('Provider should handle large documents efficiently', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document très volumineux
		const largeText = 'adr_test.md\n'.repeat(5000) + 'Some other content\n'.repeat(10000);
		const mockDocument = {
			getText: () => largeText,
			lineAt: () => ({ text: 'adr_test.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		const result = await provider.provideCodeLenses(mockDocument);
		assert(Array.isArray(result));
		// Devrait être limité à 1000 matches maximum
		assert(result.length <= 1000);
	});

	test('Provider should handle multiple concurrent requests efficiently', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Créer plusieurs documents de test
		const documents = Array.from({ length: 10 }, (_, i) => ({
			getText: () => `adr_test_${i}.md\n`.repeat(100),
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

		// Vérifier que le temps d'exécution est raisonnable (moins de 5 secondes)
		const executionTime = endTime - startTime;
		assert(executionTime < 5000, `Execution time ${executionTime}ms should be less than 5000ms`);
	});

	test('Provider should handle documents with many ADR references efficiently', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Mock d'un document avec beaucoup de références ADR
		const manyAdrRefs = Array.from({ length: 2000 }, (_, i) => `adr_test_${i}.md`).join('\n');
		const mockDocument = {
			getText: () => manyAdrRefs,
			lineAt: () => ({ text: 'adr_test_0.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		const startTime = Date.now();
		const result = await provider.provideCodeLenses(mockDocument);
		const endTime = Date.now();

		assert(Array.isArray(result));
		assert(result.length <= 1000, 'Should be limited to 1000 matches');
		
		// Vérifier que le temps d'exécution est raisonnable
		const executionTime = endTime - startTime;
		assert(executionTime < 3000, `Execution time ${executionTime}ms should be less than 3000ms`);
	});

	test('Provider should handle cache invalidation efficiently', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Premier appel pour remplir le cache
		const documentV1 = {
			getText: () => 'adr_test_v1.md\nadr_test_v2.md',
			lineAt: () => ({ text: 'adr_test_v1.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		const result1 = await provider.provideCodeLenses(documentV1);
		assert(Array.isArray(result1));

		// Deuxième appel avec le même contenu (devrait utiliser le cache)
		const result2 = await provider.provideCodeLenses(documentV1);
		assert(Array.isArray(result2));

		// Troisième appel avec un contenu différent (devrait invalider le cache)
		const documentV2 = {
			getText: () => 'adr_test_v3.md\nadr_test_v4.md',
			lineAt: () => ({ text: 'adr_test_v3.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		const result3 = await provider.provideCodeLenses(documentV2);
		assert(Array.isArray(result3));
	});

	test('Provider should handle memory usage efficiently', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Créer un document avec beaucoup de contenu
		const largeContent = 'adr_test.md\n'.repeat(10000) + 'Some other content\n'.repeat(50000);
		const mockDocument = {
			getText: () => largeContent,
			lineAt: () => ({ text: 'adr_test.md', lineNumber: 0 }),
			positionAt: () => new vscode.Position(0, 0),
			getWordRangeAtPosition: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
		} as unknown as vscode.TextDocument;

		// Exécuter plusieurs fois pour tester la gestion mémoire
		for (let i = 0; i < 10; i++) {
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
		
		// Exécuter 100 appels rapides
		const promises = Array.from({ length: 100 }, () => 
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
		assert(totalTime < 10000, `Total time ${totalTime}ms should be less than 10000ms for 100 calls`);
	});
}); 
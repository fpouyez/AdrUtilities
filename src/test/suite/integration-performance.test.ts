import * as assert from 'assert';
import * as vscode from 'vscode';
import { AdrCodelensNavigationProvider } from '../../adr-codelens-navigation-provider';

suite('Integration Performance Test Suite', () => {
	vscode.window.showInformationMessage('Start all integration performance tests.');

	/**
	 * Test d'intégration complet du workflow d'optimisation
	 */
	test('Complete optimization workflow should work', async () => {
		// 1. Configuration initiale (CodeLens désactivés au démarrage)
		const config = vscode.workspace.getConfiguration('adrutilities');
		const originalNavigation = config.get('enableCodeLensNavigation');
		
		try {
			// 2. Désactiver les CodeLens via configuration directe
			await config.update('enableCodeLensNavigation', false, true);
			assert.strictEqual(config.get('enableCodeLensNavigation'), false, 'CodeLens should be disabled');
			
			// 3. Créer un provider (simule l'activation manuelle)
			const provider = new AdrCodelensNavigationProvider();
			assert(provider instanceof AdrCodelensNavigationProvider, 'Provider should be created');
			
			// 4. Activer les CodeLens via configuration directe (au lieu de commande)
			await config.update('enableCodeLensNavigation', true, true);
			assert.strictEqual(config.get('enableCodeLensNavigation'), true, 'CodeLens should be enabled');
			
			// 5. Tester le fonctionnement avec un document
			const mockDocument = {
				getText: () => '// adr_test_20241220.md\n// adr_another_20241220.md',
				uri: { toString: () => 'file:///test.ts' },
				version: 1,
				lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
				positionAt: () => ({ line: 0, character: 0 }),
				getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
			} as any;
			
			const result = await provider.provideCodeLenses(mockDocument, {} as any);
			assert(Array.isArray(result), 'Should return array of CodeLens');
			assert(result.length > 0, 'Should find CodeLens in document with ADR references');
			
		} finally {
			// Restaurer les valeurs originales
			await config.update('enableCodeLensNavigation', originalNavigation, true);
		}
	});

	/**
	 * Test que les performances sont maintenues avec plusieurs documents
	 */
	test('Performance should be maintained with multiple documents', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
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
		] as any[];
		
		// Traiter tous les documents
		const results = await Promise.all(
			documents.map(doc => provider.provideCodeLenses(doc, {} as any))
		);
		
		// Vérifier les résultats
		assert.strictEqual(results.length, 3, 'Should process all documents');
		assert(results[0].length > 0, 'Document 1 should have CodeLens');
		assert(results[1].length > 0, 'Document 2 should have CodeLens');
		assert.strictEqual(results[2].length, 0, 'Document 3 should have no CodeLens');
	});

	/**
	 * Test que le cache fonctionne correctement avec des modifications de documents
	 */
	test('Cache should work correctly with document modifications', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Document initial
		const documentV1 = {
			getText: () => '// adr_test_20241220.md',
			uri: { toString: () => 'file:///test.ts' },
			version: 1,
			lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		} as any;
		
		// Document modifié
		const documentV2 = {
			getText: () => '// adr_test_20241220.md\n// adr_new_20241220.md',
			uri: { toString: () => 'file:///test.ts' },
			version: 2,
			lineAt: () => ({ text: '// adr_test_20241220.md', lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		} as any;
		
		// Premier appel
		const result1 = await provider.provideCodeLenses(documentV1, {} as any);
		assert(Array.isArray(result1));
		const count1 = result1.length;
		
		// Deuxième appel avec le même document (devrait utiliser le cache)
		const result2 = await provider.provideCodeLenses(documentV1, {} as any);
		assert(Array.isArray(result2));
		assert.strictEqual(result2.length, count1, 'Cache should return same result');
		
		// Troisième appel avec document modifié (devrait recalculer)
		const result3 = await provider.provideCodeLenses(documentV2, {} as any);
		assert(Array.isArray(result3));
		assert(result3.length >= count1, 'Modified document should have at least as many CodeLens');
	});

	/**
	 * Test que les optimisations ne cassent pas la fonctionnalité de base
	 */
	test('Optimizations should not break basic functionality', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
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
			} as any;
			
			const result = await provider.provideCodeLenses(mockDocument, {} as any);
			assert(Array.isArray(result), `Should return array for: ${testCase}`);
			assert(result.length > 0, `Should find CodeLens for: ${testCase}`);
		}
	});

	/**
	 * Test de charge avec de nombreux documents
	 */
	test('Load test with many documents', async () => {
		const provider = new AdrCodelensNavigationProvider();
		
		// Créer 50 documents avec des contenus différents
		const documents = Array.from({ length: 50 }, (_, i) => ({
			getText: () => `// adr_test${i}_20241220.md`,
			uri: { toString: () => `file:///test${i}.ts` },
			version: 1,
			lineAt: () => ({ text: `// adr_test${i}_20241220.md`, lineNumber: 0 }),
			positionAt: () => ({ line: 0, character: 0 }),
			getWordRangeAtPosition: () => ({ start: { line: 0, character: 0 }, end: { line: 0, character: 20 } })
		})) as any[];
		
		// Mesurer le temps de traitement
		const startTime = Date.now();
		
		// Traiter tous les documents
		const results = await Promise.all(
			documents.map(doc => provider.provideCodeLenses(doc, {} as any))
		);
		
		const endTime = Date.now();
		const processingTime = endTime - startTime;
		
		// Vérifier que tous les documents ont été traités
		assert.strictEqual(results.length, 50, 'Should process all 50 documents');
		results.forEach((result, index) => {
			assert(Array.isArray(result), `Document ${index} should return array`);
			assert(result.length > 0, `Document ${index} should have CodeLens`);
		});
		
		// Le temps de traitement devrait être raisonnable (< 5 secondes pour 50 documents)
		assert(processingTime < 5000, `Processing time should be reasonable: ${processingTime}ms for 50 documents`);
		
		console.log(`Processed 50 documents in ${processingTime}ms`);
	});
}); 
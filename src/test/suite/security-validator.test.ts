import * as assert from 'assert';
import * as vscode from 'vscode';
import { SecurityValidator } from '../../security-validator';

suite('Security Validator Test Suite', () => {

	test('validateAdrTitle should accept valid titles', () => {
		const validTitles = [
			'MyADR',
			'My ADR',
			'My-ADR',
			'My_ADR',
			'ADR123',
			'Why We Use This Pattern',
			'Decision about API Design'
		];

		validTitles.forEach(title => {
			assert.strictEqual(SecurityValidator.validateAdrTitle(title), true, `Title "${title}" should be valid`);
		});
	});

	test('validateAdrTitle should reject invalid titles', () => {
		const invalidTitles = [
			'', // Empty
			null as any, // Null
			undefined as any, // Undefined
			'<script>alert("xss")</script>', // XSS attempt
			'../../../etc/passwd', // Path traversal
			'a'.repeat(101), // Too long
			'ADR with special chars: !@#$%^&*()', // Special characters
			'ADR with newline\ninjection', // Newline injection
			'ADR with tab\tinjection' // Tab injection
		];

		invalidTitles.forEach(title => {
			assert.strictEqual(SecurityValidator.validateAdrTitle(title), false, `Title "${title}" should be invalid`);
		});
	});

	test('sanitizeAdrTitle should clean valid titles', () => {
		const testCases = [
			{ input: '  My ADR  ', expected: 'My ADR' },
			{ input: 'My   ADR', expected: 'My ADR' },
			{ input: 'MyADR', expected: 'MyADR' }
		];

		testCases.forEach(testCase => {
			const result = SecurityValidator.sanitizeAdrTitle(testCase.input);
			assert.strictEqual(result, testCase.expected);
		});
	});

	test('sanitizeAdrTitle should return null for invalid titles', () => {
		const invalidTitles = [
			'<script>alert("xss")</script>',
			'../../../etc/passwd',
			'a'.repeat(101)
		];

		invalidTitles.forEach(title => {
			assert.strictEqual(SecurityValidator.sanitizeAdrTitle(title), null);
		});
	});

	test('escapeRegex should escape special regex characters', () => {
		const testCases = [
			{ input: 'adr_', expected: 'adr_' },
			{ input: 'adr.*+?^${}()|[\\]', expected: 'adr\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\\\\\]' },
			{ input: 'test[0-9]', expected: 'test\\[0\\-9\\]' }
		];

		testCases.forEach(testCase => {
			const result = SecurityValidator.escapeRegex(testCase.input);
			assert.strictEqual(result, testCase.expected);
		});
	});

	test('escapeRegex should handle edge cases', () => {
		assert.strictEqual(SecurityValidator.escapeRegex(''), '');
		assert.strictEqual(SecurityValidator.escapeRegex(null as any), '');
		assert.strictEqual(SecurityValidator.escapeRegex(undefined as any), '');
	});

	test('validateAdrPrefix should accept valid prefixes', () => {
		const validPrefixes = [
			'adr_',
			'ADR_',
			'decision_',
			'arch_',
			'prefix123'
		];

		validPrefixes.forEach(prefix => {
			assert.strictEqual(SecurityValidator.validateAdrPrefix(prefix), true, `Prefix "${prefix}" should be valid`);
		});
	});

	test('validateAdrPrefix should reject invalid prefixes', () => {
		const invalidPrefixes = [
			'', // Empty
			null as any, // Null
			undefined as any, // Undefined
			'a'.repeat(21), // Too long
			'prefix with spaces', // Spaces
			'prefix-with-special-chars!', // Special characters
			'prefix/with/slashes' // Slashes
		];

		invalidPrefixes.forEach(prefix => {
			assert.strictEqual(SecurityValidator.validateAdrPrefix(prefix), false, `Prefix "${prefix}" should be invalid`);
		});
	});

	test('validateAdrDirectoryName should accept valid directory names', () => {
		const validNames = [
			'adr',
			'ADR',
			'decisions',
			'architecture_decisions',
			'dir123'
		];

		validNames.forEach(name => {
			assert.strictEqual(SecurityValidator.validateAdrDirectoryName(name), true, `Directory name "${name}" should be valid`);
		});
	});

	test('validateAdrDirectoryName should reject invalid directory names', () => {
		const invalidNames = [
			'', // Empty
			null as any, // Null
			undefined as any, // Undefined
			'a'.repeat(51), // Too long
			'dir with spaces', // Spaces
			'dir-with-special-chars!', // Special characters
			'dir/with/slashes' // Slashes
		];

		invalidNames.forEach(name => {
			assert.strictEqual(SecurityValidator.validateAdrDirectoryName(name), false, `Directory name "${name}" should be invalid`);
		});
	});

	test('generateSecureFileName should generate valid filenames', () => {
		const testCases = [
			{
				title: 'My ADR',
				prefix: 'adr_',
				date: '20231201',
				expected: 'adr_My_ADR_20231201.md'
			},
			{
				title: 'Decision about API',
				prefix: 'dec_',
				date: '20231201',
				expected: 'dec_Decision_about_API_20231201.md'
			}
		];

		testCases.forEach(testCase => {
			const result = SecurityValidator.generateSecureFileName(testCase.title, testCase.prefix, testCase.date);
			assert.strictEqual(result, testCase.expected);
		});
	});

	test('generateSecureFileName should throw error for invalid title', () => {
		assert.throws(() => {
			SecurityValidator.generateSecureFileName('<script>alert("xss")</script>', 'adr_', '20231201');
		}, Error, 'Titre d\'ADR invalide');
	});

	test('generateSecureFileName should use default prefix for invalid prefix', () => {
		const result = SecurityValidator.generateSecureFileName('My ADR', '<invalid>', '20231201');
		assert.strictEqual(result, 'adr_My_ADR_20231201.md');
	});

	test('generateSecureFileName should use current date for invalid date', () => {
		const result = SecurityValidator.generateSecureFileName('My ADR', 'adr_', 'invalid-date');
		// Vérifie que le résultat contient le titre et l'extension
		assert(result.includes('My_ADR'));
		assert(result.endsWith('.md'));
		assert(result.match(/adr_My_ADR_\d{8}\.md/));
	});

	test('validateFilePath should validate workspace paths', () => {
		// Ce test nécessite un workspace ouvert
		// En mode test, on vérifie juste que la fonction ne plante pas
		const result = SecurityValidator.validateFilePath('/test/path');
		assert(typeof result === 'boolean');
	});

	test('validateFilePath should reject invalid paths', () => {
		const invalidPaths = [
			'', // Empty
			null as any, // Null
			undefined as any, // Undefined
			'../../../etc/passwd', // Path traversal
			'<script>alert("xss")</script>', // XSS attempt
			'/etc/passwd', // System path
			'/var/log/syslog', // System path
			'/tmp/malicious', // System path
			'a'.repeat(501) // Too long
		];

		invalidPaths.forEach(path => {
			assert.strictEqual(SecurityValidator.validateFilePath(path), false, `Path "${path}" should be invalid`);
		});
	});

	test('validateFilePath should accept test paths', () => {
		const validTestPaths = [
			'/test/path/file.md',
			'/some/path/file.md',
			'relative/path/file.md'
		];

		validTestPaths.forEach(path => {
			assert.strictEqual(SecurityValidator.validateFilePath(path), true, `Path "${path}" should be valid`);
		});
	});
}); 
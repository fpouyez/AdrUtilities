import * as assert from 'assert';
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
			assert.strictEqual(SecurityValidator.validateAdrTitle(title as string), true, `Title "${title}" should be valid`);
		});
	});

	test('validateAdrTitle should reject invalid titles', () => {
		const invalidTitles = [
			'', // Empty
			null as unknown, // Null
			undefined as unknown, // Undefined
			'<script>alert("xss")</script>', // XSS attempt
			'../../../etc/passwd', // Path traversal
			'a'.repeat(101), // Too long
			'ADR with special chars: !@#$%^&*()', // Special characters
			'ADR with newline\ninjection', // Newline injection
			'ADR with tab\tinjection' // Tab injection
		];

		invalidTitles.forEach(title => {
			assert.strictEqual(SecurityValidator.validateAdrTitle(title as string), false, `Title "${title}" should be invalid`);
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
			assert.strictEqual(SecurityValidator.sanitizeAdrTitle(title as string), null);
		});
	});

	test('escapeRegex should handle valid strings', () => {
		assert.strictEqual(SecurityValidator.escapeRegex('adr_'), 'adr_');
		assert.strictEqual(SecurityValidator.escapeRegex('adr.*+?^${}()|[\\]'), 'adr\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\\\\\]');
		assert.strictEqual(SecurityValidator.escapeRegex('simple'), 'simple');
		assert.strictEqual(SecurityValidator.escapeRegex(''), '');
	});

	test('escapeRegex should handle invalid inputs', () => {
		// Test avec des valeurs invalides
		const invalidInputs = [
			null as unknown as string, // Null
			undefined as unknown as string, // Undefined
		];

		invalidInputs.forEach(input => {
			assert.strictEqual(SecurityValidator.escapeRegex(input as string), '');
		});
	});

	test('escapeRegex should handle special regex characters', () => {
		const specialChars = [
			{ input: '.', expected: '\\.' },
			{ input: '*', expected: '\\*' },
			{ input: '+', expected: '\\+' },
			{ input: '?', expected: '\\?' },
			{ input: '^', expected: '\\^' },
			{ input: '$', expected: '\\$' },
			{ input: '{', expected: '\\{' },
			{ input: '}', expected: '\\}' },
			{ input: '(', expected: '\\(' },
			{ input: ')', expected: '\\)' },
			{ input: '[', expected: '\\[' },
			{ input: ']', expected: '\\]' },
			{ input: '\\', expected: '\\\\' },
			{ input: '|', expected: '\\|' }
		];

		specialChars.forEach(({ input, expected }) => {
			assert.strictEqual(SecurityValidator.escapeRegex(input as string), expected);
		});
	});

	test('escapeRegex should handle mixed content', () => {
		assert.strictEqual(SecurityValidator.escapeRegex('adr_123'), 'adr_123');
		assert.strictEqual(SecurityValidator.escapeRegex('adr.*test'), 'adr\\.\\*test');
		assert.strictEqual(SecurityValidator.escapeRegex('test[123]'), 'test\\[123\\]');
		assert.strictEqual(SecurityValidator.escapeRegex('file(1).txt'), 'file\\(1\\)\\.txt');
	});

	test('escapeRegex should handle null and undefined explicitly', () => {
		assert.strictEqual(SecurityValidator.escapeRegex(null as unknown as string), '');
		assert.strictEqual(SecurityValidator.escapeRegex(undefined as unknown as string), '');
	});

	test('validateAdrPrefix should accept valid prefixes', () => {
		const validPrefixes = [
			'adr_',
			'adr-',
			'ADR_',
			'ADR-',
			'adr123',
			'adr_123',
			'adr-123',
			'a',
			'AD',
			'adr_long_prefix_123'
		];

		validPrefixes.forEach(prefix => {
			assert.strictEqual(SecurityValidator.validateAdrPrefix(prefix as string), true, `Prefix "${prefix}" should be valid`);
		});
	});

	test('validateAdrPrefix should reject invalid prefixes', () => {
		const invalidPrefixes = [
			'',
			'adr.',
			'adr/',
			'adr\\',
			'adr*',
			'adr?',
			'adr+',
			'adr^',
			'adr$',
			'adr{',
			'adr}',
			'adr(',
			'adr)',
			'adr[',
			'adr]',
			'adr|',
			'adr<',
			'adr>',
			'adr&',
			'adr#',
			'adr@',
			'adr!',
			'adr%',
			'adr=',
			'adr+',
			'adr;',
			'adr:',
			'adr"',
			'adr\'',
			'adr,',
			'adr.',
			'adr ',
			'adr\t',
			'adr\n',
			'adr\r'
		];

		invalidPrefixes.forEach(prefix => {
			assert.strictEqual(SecurityValidator.validateAdrPrefix(prefix as string), false, `Prefix "${prefix}" should be invalid`);
		});
	});

	test('validateAdrPrefix should handle edge cases', () => {
		// Test avec des valeurs invalides
		const invalidInputs = [
			null as unknown as string, // Null
			undefined as unknown as string, // Undefined
		];

		invalidInputs.forEach(input => {
			assert.strictEqual(SecurityValidator.validateAdrPrefix(input as string), false);
		});
	});

	test('validateAdrPrefix should handle empty and whitespace', () => {
		assert.strictEqual(SecurityValidator.validateAdrPrefix(''), false);
		assert.strictEqual(SecurityValidator.validateAdrPrefix(' '), false);
		assert.strictEqual(SecurityValidator.validateAdrPrefix('\t'), false);
		assert.strictEqual(SecurityValidator.validateAdrPrefix('\n'), false);
		assert.strictEqual(SecurityValidator.validateAdrPrefix('  '), false);
	});

	test('validateAdrPrefix should handle very long prefixes', () => {
		const longValidPrefix = 'a'.repeat(20); // Exactement 20 caractères (limite max)
		const longInvalidPrefix = 'a'.repeat(21); // Plus de 20 caractères

		assert.strictEqual(SecurityValidator.validateAdrPrefix(longValidPrefix as string), true);
		assert.strictEqual(SecurityValidator.validateAdrPrefix(longInvalidPrefix as string), false);
	});

	test('validateAdrPrefix should handle unicode characters', () => {
		// Les caractères unicode ne sont pas acceptés par le pattern actuel
		assert.strictEqual(SecurityValidator.validateAdrPrefix('adré' as string), false);
		assert.strictEqual(SecurityValidator.validateAdrPrefix('adrñ' as string), false);
	});

	test('validateAdrPrefix should handle null and undefined explicitly', () => {
		assert.strictEqual(SecurityValidator.validateAdrPrefix(null as unknown as string), false);
		assert.strictEqual(SecurityValidator.validateAdrPrefix(undefined as unknown as string), false);
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
			assert.strictEqual(SecurityValidator.validateAdrDirectoryName(name as string), true, `Directory name "${name}" should be valid`);
		});
	});

	test('validateAdrDirectoryName should reject invalid directory names', () => {
		const invalidNames = [
			'', // Empty
			null as unknown, // Null
			undefined as unknown, // Undefined
			'a'.repeat(51), // Too long
			'dir with spaces', // Spaces
			'dir-with-special-chars!', // Special characters
			'dir/with/slashes' // Slashes
		];

		invalidNames.forEach(name => {
			assert.strictEqual(SecurityValidator.validateAdrDirectoryName(name as string), false, `Directory name "${name}" should be invalid`);
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
			null as unknown, // Null
			undefined as unknown, // Undefined
			'../../../etc/passwd', // Path traversal
			'<script>alert("xss")</script>', // XSS attempt
			'/etc/passwd', // System path
			'/var/log/syslog', // System path
			'/tmp/malicious', // System path
			'a'.repeat(501) // Too long
		];

		invalidPaths.forEach(path => {
			assert.strictEqual(SecurityValidator.validateFilePath(path as string), false, `Path "${path}" should be invalid`);
		});
	});

	test('validateFilePath should accept test paths', () => {
		const validTestPaths = [
			'/test/path/file.md',
			'/some/path/file.md',
			'relative/path/file.md'
		];

		validTestPaths.forEach(path => {
			assert.strictEqual(SecurityValidator.validateFilePath(path as string), true, `Path "${path}" should be valid`);
		});
	});
}); 
import * as assert from 'assert';
import * as vscode from 'vscode';
import { convertSeparators, findLastDirectoryName, convertSeparatorsOnUri } from '../../adr-filepath';

suite('ADR FilePath Test Suite', () => {

	test('Convert separator should replace \\ to /', async () => {
        const obtain = convertSeparators("test\\path\\To\\Convert");
		assert.strictEqual("test/path/To/Convert", obtain);
	});

    test('Convert separator should replace \\ to / from vscode.Uri', async () => {
        const obtain = convertSeparators(vscode.Uri.file("test/path/To/Convert").fsPath);
		assert(obtain.endsWith("test/path/To/Convert"));
	});

	test('Convert separator should throw error for invalid path', async () => {
		assert.throws(() => {
			convertSeparators("../../../etc/passwd");
		}, Error, 'Chemin de fichier invalide ou en dehors de l\'espace de travail');
	});

	test('Convert separator should throw error for empty path', async () => {
		assert.throws(() => {
			convertSeparators("");
		}, Error, 'Chemin de fichier invalide ou en dehors de l\'espace de travail');
	});

	test('Convert separators on URI should work with valid URI', async () => {
		const uri = vscode.Uri.file("test/path/To/Convert");
		const result = convertSeparatorsOnUri(uri);
		// Normalise les séparateurs pour la comparaison multiplateforme
		const normalizedResult = result.fsPath.replace(/\\/g, '/');
		assert(normalizedResult.endsWith("test/path/To/Convert"));
	});

	test('Convert separators on URI should throw error for invalid URI', async () => {
		assert.throws(() => {
			convertSeparatorsOnUri(null as unknown as vscode.Uri);
		}, Error, 'URI invalide');
	});

	test('Find last directory name must ignore name file', async () => {
    	const segments = ["dir1","dir2","file.txt"];
		const dir = findLastDirectoryName(segments);
		assert.strictEqual("dir2", dir);
	});

	test('Find last directory name must take the last directory of an array', async () => {
    	const segments = ["dir1","dir2","dir4", "dir3"];
		const dir = findLastDirectoryName(segments);
		assert.strictEqual("dir3", dir);
	});

	test('Find last directory name should return undefined for empty array', async () => {
		const segments: string[] = [];
		const dir = findLastDirectoryName(segments);
		assert.strictEqual(dir, undefined);
	});

	test('Find last directory name should return undefined for null array', async () => {
		const dir = findLastDirectoryName(null as unknown as string[]);
		assert.strictEqual(dir, undefined);
	});

	test('Find last directory name should throw error for invalid directory name', async () => {
		const segments = ["dir1", "dir2", "invalid<directory>"];
		assert.throws(() => {
			findLastDirectoryName(segments);
		}, Error, 'Nom de répertoire invalide');
	});
});

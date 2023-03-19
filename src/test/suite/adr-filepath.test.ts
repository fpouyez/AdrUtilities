import * as assert from 'assert';
import * as vscode from 'vscode';
import { convertSeparators, findLastDirectoryName } from '../../adr-filepath';

suite('ADR FilePath Test Suite', () => {

	test('Convert separator should replace \\ to /', async () => {
        let obtain = convertSeparators("Some\\path\\To\\Convert");
		assert.strictEqual("Some/path/To/Convert", obtain);
	});

    test('Convert separator should replace \\ to / from vscode.Uri', async () => {
        let obtain = convertSeparators(vscode.Uri.file("Some\\path\\To\\Convert").fsPath);
		assert.strictEqual("/Some/path/To/Convert", obtain);
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
});

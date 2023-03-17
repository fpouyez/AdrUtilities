import * as assert from 'assert';
import * as vscode from 'vscode';
import { convertSeparators } from '../../adr-filepath';

suite('ADR FilePath Test Suite', () => {

	test('Convert separator should replace \\ to /', async () => {
        let obtain = convertSeparators("Some\\path\\To\\Convert");
		assert.strictEqual("Some/path/To/Convert", obtain);
	});

    test('Convert separator should replace \\ to / from vscode.Uri', async () => {
        let obtain = convertSeparators(vscode.Uri.file("Some\\path\\To\\Convert").fsPath);
		assert.strictEqual("/Some/path/To/Convert", obtain);
	});
});

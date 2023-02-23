import * as assert from 'assert';
import * as vscode from 'vscode';
import { list } from '../../command-list';

suite('Command-List Test Suite', () => {
	vscode.window.showInformationMessage('Start all list tests.');

	test('List test', async () => {
        let adrList = await list();
		assert.strictEqual(0, adrList.length);
	});
});

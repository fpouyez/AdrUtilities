import { Uri } from "vscode";

export const separator = '/';

export function convertSeparators(path :string):string {
    return path.replace('\\', '/');
}

export function convertSeparatorsOnUri(path :Uri):Uri {
    return Uri.file(path.fsPath.replace('\\', '/'));
}
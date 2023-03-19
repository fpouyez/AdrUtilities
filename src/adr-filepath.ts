import { Uri } from "vscode";

export const separator = '/';

export function convertSeparators(path :string):string {
    return path.replace(/\\/g, "/");
}

export function convertSeparatorsOnUri(path :Uri):Uri {
    return Uri.file(convertSeparators(path.fsPath));
}

export function findLastDirectoryName(segments: string[]) {
	let lastDirName;
	let lastSegment = segments.at(-1);

	if (!!lastSegment && lastSegment.indexOf(".") > 0) {
		segments.pop();
		lastDirName = segments.at(-1);
	} else {
		lastDirName = lastSegment;
	}
	return lastDirName;
}
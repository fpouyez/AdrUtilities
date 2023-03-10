import { Uri } from "vscode";

export function separator(): string {
    const os = require('os');
    console.log('Platform : '+os.platform());
    if(os.platform() === 'win32'){
        return '\\';
    }
    return '/';
}

export function convertSeparators(path :string):string {
    const sep = separator();
    return path.replace('/', sep).replace('\\', sep);
}

export function convertSeparatorsOnUri(path :Uri):Uri {
    const sep = separator();
    return Uri.parse(path.fsPath.replace('/', sep).replace('\\', sep));
}

export function buildUriToFetchFile(path : string): Uri {
    const os = require('os');
    if(os.platform() === 'win32'){
        return Uri.joinPath(Uri.parse('file:\\\\'), path);
    }
    return Uri.parse(path);
}
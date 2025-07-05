import { Uri } from "vscode";
import { SecurityValidator } from "./security-validator";

export const separator = '/';

/**
 * Convertit les séparateurs de chemin Windows vers Unix avec validation
 * @param path Le chemin à convertir
 * @returns Le chemin converti ou une chaîne vide si invalide
 */
export function convertSeparators(path: string): string {
    if (!path || typeof path !== 'string') {
        throw new Error('Chemin de fichier invalide ou en dehors de l\'espace de travail');
    }
    
    // Normalise d'abord le chemin en convertissant les backslashes
    const normalizedPath = path.replace(/\\/g, "/");
    
    // Valide le chemin normalisé
    if (!SecurityValidator.validateFilePath(normalizedPath)) {
        throw new Error('Chemin de fichier invalide ou en dehors de l\'espace de travail');
    }
    
    return normalizedPath;
}

/**
 * Convertit les séparateurs sur un URI avec validation
 * @param path L'URI à convertir
 * @returns L'URI converti
 */
export function convertSeparatorsOnUri(path: Uri): Uri {
    if (!path || !path.fsPath) {
        throw new Error('URI invalide');
    }
    
    const convertedPath = convertSeparators(path.fsPath);
    return Uri.file(convertedPath);
}

/**
 * Trouve le nom du dernier répertoire dans un tableau de segments
 * @param segments Le tableau de segments de chemin
 * @returns Le nom du dernier répertoire ou undefined
 */
export function findLastDirectoryName(segments: string[]): string | undefined {
    if (!segments || !Array.isArray(segments) || segments.length === 0) {
        return undefined;
    }
    
    let lastDirName: string | undefined;
    const lastSegment = segments.at(-1);

    if (!!lastSegment && lastSegment.indexOf(".") > 0) {
        segments.pop();
        lastDirName = segments.at(-1);
    } else {
        lastDirName = lastSegment;
    }
    
    // Validation du nom de répertoire
    if (lastDirName && !SecurityValidator.validateAdrDirectoryName(lastDirName)) {
        throw new Error('Nom de répertoire invalide');
    }
    
    return lastDirName;
}
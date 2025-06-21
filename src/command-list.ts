import {workspace, Uri} from "vscode";
import { separator, convertSeparators } from "./adr-filepath";
import { SecurityValidator } from "./security-validator";

export async function list (): Promise<Uri[]> {
    try {
        const prefix = workspace.getConfiguration("adrutilities").get("adrFilePrefix") as string;
        console.log('List - Prefix : '+prefix);
        
        // Validation du préfixe
        if (!SecurityValidator.validateAdrPrefix(prefix)) {
            console.warn('Préfixe ADR invalide, utilisation du préfixe par défaut');
            const safePrefix = "adr_";
            const pattern = '**'+separator+'*'+SecurityValidator.escapeRegex(safePrefix)+'*.md';
            console.log('List - GlobPattern : '+pattern);
            let adrs = await workspace.findFiles(pattern, '**/node_modules/**');
            
            // Limite le nombre de fichiers pour éviter les attaques par déni de service
            const maxFiles = 1000;
            if (adrs.length > maxFiles) {
                console.warn(`Nombre de fichiers limité à ${maxFiles} pour des raisons de sécurité`);
                adrs = adrs.slice(0, maxFiles);
            }
            
            return adrs.map(value => {
                console.log('List - ADR before convert : '+value.fsPath);
                console.log('List - ADR after convert : '+ convertSeparators(value.fsPath));
                return Uri.file(convertSeparators(value.fsPath));
            });
        }
        
        const escapedPrefix = SecurityValidator.escapeRegex(prefix);
        const pattern = '**'+separator+'*'+escapedPrefix+'*.md';
        console.log('List - GlobPattern : '+pattern);
        
        let adrs = await workspace.findFiles(pattern, '**/node_modules/**');
        
        // Limite le nombre de fichiers pour éviter les attaques par déni de service
        const maxFiles = 1000;
        if (adrs.length > maxFiles) {
            console.warn(`Nombre de fichiers limité à ${maxFiles} pour des raisons de sécurité`);
            adrs = adrs.slice(0, maxFiles);
        }
        
        return adrs.map(value => {
            try {
                console.log('List - ADR before convert : '+value.fsPath);
                const convertedPath = convertSeparators(value.fsPath);
                console.log('List - ADR after convert : '+ convertedPath);
                return Uri.file(convertedPath);
            } catch (error) {
                console.error('Erreur lors de la conversion du chemin:', error);
                return value; // Retourne l'URI original en cas d'erreur
            }
        });
    } catch (error) {
        console.error('Erreur lors du listing des ADR:', error);
        return [];
    }
}
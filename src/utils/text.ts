// Anciennes données : la fonction save-floating-ad enregistrait autrefois le texte
// « échappé » (d'est devenu d&#x27;) alors que React échappe déjà l'affichage.
// Ce décodage remet le texte d'origine pour les publicités déjà enregistrées.
export function decodeLegacyEntities(value: string): string {
  return value
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

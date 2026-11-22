// Informations de l'éditeur, à compléter avant la mise en service (le dépôt est public : n'y mettre que des
// coordonnées institutionnelles). Tant qu'une valeur commence par « [ », la page l'affiche surlignée.
export const LEGAL = {
  publisher: '[Nom de l’établissement ou de l’éditeur — à compléter]',
  publisherAddress: '[Adresse postale — à compléter]',
  director: '[Directeur ou directrice de la publication — à compléter]',
  contact: '[Adresse e-mail de contact (institutionnelle) — à compléter]',
  cndp: '[Numéro de récépissé de la déclaration à la CNDP — à compléter]',
  hostingRegion: '[Région d’hébergement des données — à compléter]',
  retention: '[Durée de conservation décidée par l’établissement, par exemple « jusqu’à la fin de l’année scolaire suivante » — à compléter]',
  updated: '21 novembre 2026',
};
export const isPlaceholder = (v: string) => v.startsWith('[');

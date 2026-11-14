export const FORMAT_GUIDE: Record<string, string> = {
  "TV 15 s": "Film TV 15 secondes : 3 à 5 plans, une seule idée, packshot et signature.",
  "TV 30 s": "Film TV 30 secondes : tableau image/son avec timecodes.",
  "TV 45 s": "Film TV 45 secondes : tableau image/son avec timecodes.",
  "TV 60 s": "Film TV 60 secondes : tableau image/son avec timecodes, vraie construction narrative.",
  "Film digital": "Film digital 60-120 s, accroche dans les 3 premières secondes, sous-titrable.",
  "Radio 30 s": "Spot radio 30 secondes : colonne visual = ambiance/bruitages/musique, colonne audio = voix et dialogues.",
  "Radio 60 s": "Spot radio 60 secondes : colonne visual = ambiance/bruitages/musique, colonne audio = voix et dialogues.",
  Affichage: "Affichage / print : rows = éléments (accroche, visuel, body copy, signature) ; timecode = nom de l'élément.",
  "Social vertical": "Vidéo verticale 9:16 de 15-20 s pour TikTok/Reels : accroche en 1 s, rythme rapide, texte à l'écran.",
};

export const FORMATS = Object.keys(FORMAT_GUIDE);

const wordLists = {
  english: [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
  ],
  spanish: [
    "de", "la", "que", "el", "en", "y", "a", "los", "se", "del",
    "las", "un", "por", "con", "no", "una", "su", "para", "es", "al",
    "lo", "como", "más", "o", "pero", "sus", "le", "ha", "me", "si",
    "sin", "sobre", "este", "ya", "entre", "cuando", "todo", "esta", "ser", "son",
    "dos", "también", "fue", "había", "era", "muy", "años", "hasta", "desde", "está",
    "mi", "porque", "qué", "sólo", "han", "yo", "hay", "vez", "puede", "todos",
    "así", "nos", "ni", "parte", "tiene", "él", "uno", "donde", "bien", "tiempo",
    "mismo", "ese", "ahora", "cada", "e", "vida", "otro", "después", "te", "otros",
    "aunque", "esa", "eso", "hace", "otra", "gobierno", "tan", "durante", "siempre", "día"
  ],
  french: [
    "le", "de", "un", "à", "être", "et", "en", "avoir", "que", "pour",
    "dans", "ce", "il", "qui", "ne", "sur", "se", "pas", "plus", "pouvoir",
    "par", "je", "avec", "tout", "faire", "son", "mettre", "autre", "on", "mais",
    "nous", "comme", "ou", "si", "leur", "y", "dire", "elle", "devoir", "avant",
    "deux", "même", "prendre", "où", "aussi", "celui", "donner", "bien", "où", "fois",
    "vous", "encore", "nouveau", "aller", "cela", "entre", "premier", "vouloir", "déjà", "grand",
    "mon", "me", "moins", "aucun", "lui", "temps", "très", "savoir", "falloir", "voir",
    "quelque", "sans", "raison", "notre", "dont", "non", "an", "monde", "jour", "monsieur",
    "demander", "alors", "après", "trouver", "personne", "rendre", "part", "dernier", "venir", "pendant"
  ],
  german: [
    "der", "die", "und", "in", "den", "von", "zu", "das", "mit", "sich",
    "des", "auf", "für", "ist", "im", "dem", "nicht", "ein", "eine", "als",
    "auch", "es", "an", "werden", "aus", "er", "hat", "dass", "sie", "nach",
    "wird", "bei", "einer", "um", "am", "sind", "noch", "wie", "einem", "über",
    "einen", "so", "zum", "war", "haben", "nur", "oder", "aber", "vor", "zur",
    "bis", "mehr", "durch", "man", "sein", "wurde", "sei", "prozent", "hatte", "kann",
    "gegen", "vom", "können", "schon", "wenn", "habe", "seine", "mark", "ihre", "dann",
    "unter", "wir", "soll", "ich", "eines", "jahr", "zwei", "jahren", "diese", "dieser",
    "wieder", "keine", "uhr", "seiner", "worden", "und", "will", "zwischen", "immer", "was"
  ]
};

export type Language = 'english' | 'spanish' | 'french' | 'german';

export function generatePracticeWords(count: number, weakChars: string[], language: Language = 'english'): string[] {
  const list = wordLists[language] || wordLists.english;
  
  // Find words that contain at least one of the weak characters
  const practicePool = list.filter(word => 
    weakChars.some(char => word.toLowerCase().includes(char.toLowerCase()))
  );
  
  // If we don't have enough words with these characters, fallback to the full list
  const poolToUse = practicePool.length > 5 ? practicePool : list;
  
  const words: string[] = [];
  let lastWord = '';

  for (let i = 0; i < count; i++) {
    let word;
    do {
      word = poolToUse[Math.floor(Math.random() * poolToUse.length)];
    } while (word === lastWord && poolToUse.length > 1);
    
    lastWord = word;
    words.push(word);
  }

  return words;
}

export function generateWords(count: number, language: Language = 'english', punctuation: boolean = false): string[] {
  const words: string[] = [];
  let lastWord = '';
  const list = wordLists[language] || wordLists.english;

  for (let i = 0; i < count; i++) {
    let word;
    do {
      word = list[Math.floor(Math.random() * list.length)];
    } while (word === lastWord);
    
    lastWord = word;

    if (punctuation && Math.random() > 0.8) {
      const punc = [',', '.', '?', '!', ';'][Math.floor(Math.random() * 5)];
      word += punc;
    }
    
    if (punctuation && Math.random() > 0.9) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    words.push(word);
  }

  return words;
}

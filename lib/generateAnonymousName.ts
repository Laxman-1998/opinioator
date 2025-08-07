const emotions = [
  'Happy', 'Hopeful', 'Curious', 'Brave', 'Calm', 'Eager', 'Fearless', 'Gentle',
  'Jolly', 'Kind', 'Lively', 'Proud', 'Silly', 'Witty', 'Pensive', 'Quiet'
];

const animals: { [key: string]: string } = {
  'Ape': '🦍', 'Bear': '🐻', 'Cat': '🐈', 'Dog': '🐕', 'Eagle': '🦅', 'Frog': '🐸',
  'Goat': '🐐', 'Hawk': 'Hawk', 'Ibex': '🐐', 'Jaguar': '🐆', 'Koala': '🐨', 'Lion': '🦁',
  'Mouse': '🐁', 'Newt': '🦎', 'Owl': '🦉', 'Panda': '🐼', 'Quail': '🐦', 'Rabbit': '🐇',
  'Snake': '🐍', 'Tiger': '🐅', 'Urchin': '🌊', 'Viper': '🐍', 'Wolf': '🐺', 'Yak': '🐃', 'Zebra': '🦓'
};

export function generateAnonymousName(): string {
  const animalKeys = Object.keys(animals);
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const randomAnimalName = animalKeys[Math.floor(Math.random() * animalKeys.length)];
  const animalEmoji = animals[randomAnimalName];
  const randomNumber = Math.floor(Math.random() * 900) + 100;

  // This is the single source of truth for the format
  return `✨ ${randomEmotion}${randomAnimalName}${randomNumber} ${animalEmoji}`;
}
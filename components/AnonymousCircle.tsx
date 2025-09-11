// Place this file in your components directory

const animalInitialColors: Record<string, string> = {
  D: '#3b82f6', // Dolphin, Dog
  C: '#ef4444', // Cat
  F: '#10b981', // Fox
  L: '#f59e0b', // Lion
  T: '#8b5cf6', // Tiger
  B: '#6366f1', // Bear
  O: '#eab308', // Owl
  // Add more initials/colors as needed
};

const animalEmojiMap: Record<string, string> = {
  Dolphin: '🐬',
  Dog: '🐶',
  Fox: '🦊',
  Cat: '🐱',
  Lion: '🦁',
  Tiger: '🐯',
  Bear: '🐻',
  Owl: '🦉',
  Penguin: '🐧',
  Rabbit: '🐇',
  Wolf: '🐺',
  // Add more as needed
};

function getCircleCode(anonymousName: string) {
  if (!anonymousName) return { initial: '?', num: '00', emoji: '', animal: '' };
  const parts = anonymousName.split('_');
  if (parts.length < 3) return { initial: '?', num: '00', emoji: '', animal: '' };
  const animal = parts[1];
  const initial = animal[0].toUpperCase();
  const number = parts[2];
  const numDigits = number.slice(0, 2).padEnd(2, "0"); // always two digits
  const emoji = animalEmojiMap[animal] || '';
  return { initial, num: numDigits, emoji, animal };
}

type AnonymousCircleProps = {
  anonymousName: string;
};

const AnonymousCircle = ({ anonymousName }: AnonymousCircleProps) => {
  const { initial, num, emoji } = getCircleCode(anonymousName);
  const bgColor = animalInitialColors[initial] || '#64748b'; // default slate
  return (
    <span className="flex items-center gap-2">
      <span
        className="flex items-center justify-center rounded-full font-bold shadow"
        style={{
          backgroundColor: bgColor,
          width: 44, height: 44,
          color: '#fff',
          fontSize: '1.1rem',
        }}
      >
        {initial}{num}
      </span>
      <span className="ml-2 text-slate-200 font-bold">{anonymousName}</span>
      {emoji && <span className="ml-2 text-xl">{emoji}</span>}
    </span>
  );
};

export default AnonymousCircle;

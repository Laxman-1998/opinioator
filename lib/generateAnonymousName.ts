// ===============================
// CONSTANTS
// ===============================

// Emotion categories — can easily expand or edit later
export const EMOTIONS = {
  positive: ["Hopeful", "Brave", "Radiant", "Grateful", "Inspired", "Resilient"],
  negative: ["Wistful", "Solemn", "Melancholy", "Lonely", "Anxious"],
  neutral: ["Curious", "Calm", "Observant", "Gentle", "Thoughtful", "Quiet"]
} as const;

// Animals and their paired emojis
export const ANIMALS = [
  { animal: "Fox", emoji: "🦊" },
  { animal: "Owl", emoji: "🦉" },
  { animal: "Panda", emoji: "🐼" },
  { animal: "Dolphin", emoji: "🐬" },
  { animal: "Turtle", emoji: "🐢" },
  { animal: "Elephant", emoji: "🐘" },
  { animal: "Butterfly", emoji: "🦋" },
  { animal: "Rabbit", emoji: "🐇" },
  { animal: "Koala", emoji: "🐨" },
  { animal: "Falcon", emoji: "🦅" },
  { animal: "Penguin", emoji: "🐧" },
  { animal: "Otter", emoji: "🦦" },
  { animal: "Bear", emoji: "🐻" }
] as const;

// ===============================
// FUNCTION
// ===============================

/**
 * Generates an anonymous display name in the format:
 * ✨ Emotion_Animal_UniqueNumber 🦦
 *
 * @param sentiment Optional category to guide emotion choice:
 *        "positive", "negative", "neutral" (future AI sentiment integration).
 *        If omitted, picks from all emotions randomly.
 */
export function generateAnonymousName(
  sentiment?: keyof typeof EMOTIONS
): string {
  // Select emotions from either all categories or a specific category
  const availableEmotions = sentiment
    ? EMOTIONS[sentiment]
    : [...EMOTIONS.positive, ...EMOTIONS.negative, ...EMOTIONS.neutral];

  const emotion =
    availableEmotions[Math.floor(Math.random() * availableEmotions.length)];

  // Pick a random animal
  const choice = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

  // Generate unique number (100–999)
  const uniqueNumber = Math.floor(100 + Math.random() * 900);

  // Return final formatted name
  return `✨ ${emotion}_${choice.animal}_${uniqueNumber} ${choice.emoji}`;
}

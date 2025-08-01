export function generateAnonymousName(): string {
  const options = [
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
  ];

  const emotions = [
    "Hopeful", "Curious", "Thoughtful", "Anxious", "Grateful", "Gentle",
    "Lonely", "Brave", "Wistful", "Calm", "Resilient", "Inspired", "Quiet"
  ];

  const emotion = emotions[Math.floor(Math.random() * emotions.length)];
  const choice = options[Math.floor(Math.random() * options.length)];

  return `${emotion} ${choice.animal} ${choice.emoji}`;
}

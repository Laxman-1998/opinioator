// lib/generateAnonymousName.ts
export default function generateAnonymousName() {
  const emotions = [
    "Hopeful", "Curious", "Thoughtful", "Anxious", "Grateful", "Gentle",
    "Lonely", "Brave", "Wistful", "Calm", "Resilient", "Inspired", "Quiet"
  ];
  const animals = [
    "🦊 Fox", "🦉 Owl", "🐼 Panda", "🐬 Dolphin", "🐢 Turtle", "🐘 Elephant", 
    "🦋 Butterfly", "🐰 Rabbit", "🐨 Koala", "🦅 Falcon", "🐧 Penguin", "🦦 Otter", "🐻 Bear"
  ];

  const emotions = [
    "Hopeful", "Curious", "Thoughtful", "Anxious", "Grateful", "Gentle",
    "Lonely", "Brave", "Wistful", "Calm", "Resilient", "Inspired", "Quiet"
  ];

  const emotion = emotions[Math.floor(Math.random() * emotions.length)];
  const choice = options[Math.floor(Math.random() * options.length)];

  return `${emotion} ${choice.animal} ${choice.emoji}`;
}

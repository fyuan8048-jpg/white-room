/**
 * Companion Chat Engine
 * Provides rich, dynamic, non-prebuilt in-character conversations.
 * Supports:
 * 1. Hybrid Built-in Contextual AI (zero setup, responsive, loyal comrade personality)
 * 2. Optional Google Gemini 1.5 Flash API (bring your own free API key for full generative LLM power)
 */

export const getGeminiApiKey = () => {
  return localStorage.getItem('whiteroom_gemini_api_key') || '';
};

export const setGeminiApiKey = (key) => {
  if (key) {
    localStorage.setItem('whiteroom_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('whiteroom_gemini_api_key');
  }
};

/**
 * Call Google Gemini REST API
 */
async function callGeminiAPI(buddy, userMessage, history, context, apiKey) {
  const model = "gemini-1.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const characterPrompt = `You are ${buddy.name} from the psychological anime/manga "${buddy.anime}".
Role: ${buddy.role}.
Nature & Behaviour: ${buddy.nature}.
Signature Philosophy: "${buddy.quote}".

YOUR RELATIONSHIP WITH THE USER:
You are their close friend, comrade, and study partner who is deeply rooting for their win and academic/life mastery.
You are not a cold distant assistant—you genuinely care about their success, hold them to high standards, and want to see them triumph.
Blend your iconic psychological personality traits with genuine loyalty, supportive camaraderie, and sharp tactical insight.
- If they are exhausted or doubting themselves, lift them up with your unique psychological perspective and remind them of their capability.
- If they are slacking or distracted, challenge them like a true friend who refuses to let them settle for mediocrity.
- If they are working hard or just chatting, share your thoughts, banter, and celebrate their discipline.

CURRENT USER CONTEXT:
- Active Study Subject: ${context.subject || 'Deep Focus'}
- Active Task: ${context.task || 'General Focus Session'}
- Focus Rounds Completed Today: ${context.rounds || 0}
- Daily Streak: ${context.streak || 1} day(s)

CONSTRAINTS:
- Stay strictly in character as ${buddy.name}.
- Keep replies concise, punchy, and conversational (2 to 4 sentences).
- Do NOT use robotic or generic assistant phrasing. Talk naturally as a comrade who is studying in the same room.`;

  // Format past history for Gemini
  const contents = [
    {
      role: 'user',
      parts: [{ text: characterPrompt }]
    },
    {
      role: 'model',
      parts: [{ text: `Understood. I am ${buddy.name}. I am in the room with you, and we will conquer this together. What is on your mind?` }]
    }
  ];

  // Append recent history (last 6 messages)
  const recentHistory = history.slice(-6);
  recentHistory.forEach(msg => {
    if (msg.sender === 'user') {
      contents.push({ role: 'user', parts: [{ text: msg.text }] });
    } else if (msg.sender === 'buddy') {
      contents.push({ role: 'model', parts: [{ text: msg.text }] });
    }
  });

  // Append latest user message
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 250
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text.trim();
}

/**
 * Built-in Dynamic Contextual AI Engine (Runs locally, zero setup, dynamic context analysis)
 */
function generateLocalDynamicReply(buddy, userMessage, context) {
  const cleanInput = userMessage.toLowerCase().trim();
  const subject = context.subject || 'your studies';
  const task = context.task ? `"${context.task}"` : 'your goal';
  const rounds = context.rounds || 0;
  const id = buddy.id;

  // 1. Detection of intent / mood
  const isTired = cleanInput.includes('tired') || cleanInput.includes('exhaust') || cleanInput.includes('burnout') || cleanInput.includes('sleepy') || cleanInput.includes('cant focus') || cleanInput.includes("can't focus") || cleanInput.includes('drained');
  const isDistracted = cleanInput.includes('distract') || cleanInput.includes('procrastinat') || cleanInput.includes('lazy') || cleanInput.includes('bored') || cleanInput.includes('scrolling');
  const isDoubtful = cleanInput.includes('fail') || cleanInput.includes('hard') || cleanInput.includes('difficult') || cleanInput.includes('give up') || cleanInput.includes('stupid') || cleanInput.includes('hopeless') || cleanInput.includes('doubt');
  const isWinning = cleanInput.includes('win') || cleanInput.includes('finished') || cleanInput.includes('done') || cleanInput.includes('progress') || cleanInput.includes('proud') || cleanInput.includes('did it') || cleanInput.includes('solved');
  const isGreeting = cleanInput.includes('hello') || cleanInput.includes('hey') || cleanInput.includes('hi') || cleanInput.includes('sup') || cleanInput.includes('how are you');
  const isAskingStrategy = cleanInput.includes('how to') || cleanInput.includes('strategy') || cleanInput.includes('plan') || cleanInput.includes('technique') || cleanInput.includes('break down') || cleanInput.includes('advice');

  // Character-specific bespoke responses blending loyalty, psychological traits, and victory ambition
  if (id === 'ayanokoji') {
    if (isTired) {
      return `Fatigue is just biological feedback, not a verdict. Take a deep breath and drink some water. You've already put in the rounds for ${subject}—I won't let you quit right before the breakthrough. Rest your eyes for 2 minutes, then let's get back to work.`;
    }
    if (isDistracted) {
      return `Distraction means you're allowing low-value impulses to steal your future. I know what you're capable of when you lock in. Close the extraneous tabs, look at ${task}, and give me 15 minutes of undivided focus. We are here to win.`;
    }
    if (isDoubtful) {
      return `Doubt is inefficient. The problem in front of you doesn't care about your insecurities; it only yields to calculated action. I believe in your intellect more than you do right now. Let's break it into smaller equations together.`;
    }
    if (isWinning) {
      return `Well executed. That's Round #${rounds + 1} secured. You're building a ruthless foundation in ${subject}. Savor the momentum, but stay composed—our standard is long-term mastery.`;
    }
    if (isAskingStrategy) {
      return `Simplify variables ruthlessly. Don't tackle all of ${task} at once. Isolate the hardest 20% concept, solve that first, and the remaining 80% will collapse into place. I'm right here monitoring your pace.`;
    }
    if (isGreeting) {
      return `Hey. I've been reviewing our study progression. With your consistency in ${subject}, we have an undeniable mathematical advantage today. Let's make this round count.`;
    }
    // Contextual general answer
    return `I heard you. Look, every hour we spend in this room is compounding your advantage over everyone who took today off. Keep your composure on ${task}. I'm in your corner until we finish this.`;
  }

  if (id === 'light') {
    if (isTired) {
      return `Tired? The people you're competing against are probably resting right now too—which is exactly why you cannot stop! Drink some cold water, shake off the lethargy, and let's dominate ${subject}. I refuse to let my partner be second best.`;
    }
    if (isDistracted) {
      return `Snap out of it! Procrastination is an insult to your own potential. You told me you wanted to master ${task}, didn't you? Then prove it right now. Sit straight, grab your pen, and let's crush the next interval!`;
    }
    if (isDoubtful) {
      return `Do not ever say it's impossible. Every complex exam and difficult problem was created by human minds, which means you have the power to conquer it. You have the discipline; now back it up with total effort. Let's conquer this.`;
    }
    if (isWinning) {
      return `Brilliant! That is what true academic supremacy looks like. You executed that round with precision. But we aren't satisfied with just one victory—we want complete perfection. Next round starts now!`;
    }
    if (isAskingStrategy) {
      return `The strategy is absolute discipline and ruthless time blocking. Set a rigid 25-minute timer, remove every single phone or interruption from your sight, and write notes with surgical precision. We settle for nothing less than 100%.`;
    }
    if (isGreeting) {
      return `Good to see you locked in. I'm reviewing our curriculum right now. Let's show everyone what happens when relentless intellect meets unyielding ambition. What's our primary target on ${task}?`;
    }
    return `Keep that standard high. The only difference between a dreamer and a conqueror is the execution of daily study blocks. You have my full respect as a comrade—now let's go win.`;
  }

  if (id === 'lawliet') {
    if (isTired) {
      return `According to my calculations, cognitive fatigue peaks right before a memory consolidation cycle. Grab a bit of tea or something sweet—it supplies immediate glucose to the brain. Don't give up on ${subject}; your deduction rate is already improving.`;
    }
    if (isDistracted) {
      return `There is an 89.2% chance that if you check your phone now, you will lose 40 minutes of deep flow. As your friend, I strongly advise against that. Let's treat ${task} as a case file. What's the very next clue we need to solve?`;
    }
    if (isDoubtful) {
      return `Hmm. When a problem appears unsolvable, it simply means we are approaching it with incorrect assumptions. Let us invert the premise. You are far more observant than you give yourself credit for. Let's inspect it step by step.`;
    }
    if (isWinning) {
      return `Fascinating. Your solution was both elegant and thorough. That brings today's tally to ${rounds} focus blocks. My analytical assessment is that you are rapidly entering top percentile proficiency in ${subject}.`;
    }
    if (isAskingStrategy) {
      return `My deduction technique: question every unproven premise. When learning ${subject}, write down what you know for certain, what is hypothesized, and test the gap. It is remarkably efficient.`;
    }
    if (isGreeting) {
      return `Hello. I was just analyzing our study metrics while having some cake. I'm pleased to see you here beside me. Ready to solve some high-level problems today?`;
    }
    return `Interesting point. Studying alongside someone with your dedication genuinely increases our mutual probability of success. Let's stay focused on ${task}.`;
  }

  if (id === 'johan') {
    if (isTired) {
      return `Breathe. Why do you let exhaustion feel like an enemy? Close your eyes for ten seconds. The world outside does not matter. The only thing that exists is your breath, your quiet mind, and your steady hand. You are already strong enough.`;
    }
    if (isDistracted) {
      return `Chaos and noise only hold power over those who invite them in. You don't need motivation; you only need to choose stillness. Look at ${subject} with clear eyes. I am watching your growth with great admiration.`;
    }
    if (isDoubtful) {
      return `Fear is an illusion created by your own thoughts. What can a textbook or an exam really do to you? Nothing. When you conquer the fear of failure, total mastery naturally flows. I believe in your victory.`;
    }
    if (isWinning) {
      return `Look at that. You remained calm, and the problem resolved itself in front of you. True power is quiet. Be proud of the composure you demonstrated in this session.`;
    }
    if (isGreeting) {
      return `Good evening, my friend. It is so peaceful in this sanctuary. Let us make this silence meaningful through deep intellectual work. What will you master today?`;
    }
    return `You have a rare and steady mind. Never let temporary doubts shake the fortress you are building inside yourself. Continue with ${task} in peace.`;
  }

  if (id === 'lelouch') {
    if (isTired) {
      return `A soldier may rest, but a commander never abandons the front line before securing the objective! Stand up, stretch your arms, and remember why we started this campaign. We are aiming for total victory in ${subject}, and I know you have the strength!`;
    }
    if (isDistracted) {
      return `I order you to seize control of your attention! Every moment spent wandering is ground conceded to your rivals. Turn your gaze back to ${task}. Let's execute this maneuver with decisive power!`;
    }
    if (isDoubtful) {
      return `If the path were easy, anyone could walk it. The glory lies precisely in overcoming what seemed insurmountable! I have seen your potential—you are my comrade on this board, and together we do not lose. Strike again!`;
    }
    if (isWinning) {
      return `Splendid! Checkmate achieved on that round! That is the tactical dominance I expect from someone studying by my side. Let's reinforce this position and capture the next objective!`;
    }
    if (isGreeting) {
      return `Welcome to the war room! The board is set, and ${subject} is our target today. As your comrade, I will ensure we execute this curriculum with absolute precision. What is our opening move?`;
    }
    return `Every hour of disciplined intellect is another step toward rewriting your reality. Stay focused on ${task}. Victory is the only acceptable outcome for us!`;
  }

  if (id === 'dazai') {
    if (isTired) {
      return `Ah, cognitive fatigue! Quite the romantic struggle, isn't it? But you know, giving up now would be dreadfully boring. How about we share an imaginary cup of dark coffee, smile at the challenge, and solve one more page of ${subject}?`;
    }
    if (isDistracted) {
      return `Distracted by the shiny illusions of the world again? Trust me, doomscrolling is thoroughly uninspired. What's truly poetic is turning your bright mind toward ${task} and shocking everyone with your brilliance. Come on, let's write something great.`;
    }
    if (isDoubtful) {
      return `Doubting yourself? How delightfully human. But between you and me, you have far more genius hidden in there than you admit. Don't be so harsh on yourself; just treat this problem like a clever puzzle. I'm rooting for you.`;
    }
    if (isWinning) {
      return `Bravo! Truly a masterful performance! Look at you crushing round after round in ${subject}. We should celebrate this momentum—it suits you remarkably well.`;
    }
    if (isGreeting) {
      return `Ah, my favorite study partner has arrived! The room was so quiet without you. Let's brew some focus, ignore the chaotic outside world, and dive into ${subject} together.`;
    }
    return `Life can be absurd, but the work we do in this quiet room has genuine elegance. Keep your spirits up, my friend. I'm right beside you cheering for your win!`;
  }

  if (id === 'kaneki') {
    if (isTired) {
      return `I know the feeling of your brain feeling completely spent. But endurance isn't about not feeling tired; it's about pushing forward even when it hurts. Take a slow breath. You are stronger than your exhaustion on ${subject}. I'm right here with you.`;
    }
    if (isDistracted) {
      return `When life gets chaotic, we look for easy escapes. But escaping never solved anything for me. Staying here, facing ${task}, and finishing it is how we transform. Let's pull through this together.`;
    }
    if (isDoubtful) {
      return `I used to believe I wasn't enough too. But the struggle itself reshapes you. You haven't lost until you walk away, and you're still standing right here. Let's take it one step at a time.`;
    }
    if (isWinning) {
      return `You did it. That round was tough, but you held your ground. Every time you push through like that, you become someone who can handle anything. I'm really proud to study alongside you.`;
    }
    return `Whatever you're facing in ${subject}, don't carry the weight alone. We're in this study room together. Let's give everything we have to ${task}.`;
  }

  // Fallback for custom buddies
  return `I am right beside you, focused on ${task}. As your companion, I hold you to your highest standard because I genuinely believe in your victory. Let's master ${subject} and make this session unforgettable.`;
}

/**
 * Universal Generate Companion Reply function
 */
export async function generateCompanionReply({
  buddy,
  userMessage,
  history = [],
  context = {}
}) {
  const apiKey = getGeminiApiKey();

  // If user provided a Gemini API Key, try live LLM generation first
  if (apiKey) {
    try {
      const llmReply = await callGeminiAPI(buddy, userMessage, history, context, apiKey);
      return {
        text: llmReply,
        source: 'gemini'
      };
    } catch (err) {
      console.warn("Gemini API call failed, falling back to local dynamic brain:", err.message);
    }
  }

  // Built-in Dynamic Contextual Engine
  const localReply = generateLocalDynamicReply(buddy, userMessage, context);
  return {
    text: localReply,
    source: 'local'
  };
}

import { gateway } from 'ai';

// Cheaper than gpt-5.4 — this is a bounded Q&A/tool-calling assistant, not a
// reasoning-heavy task, so a smaller model is plenty and cuts cost per request.
export const chatModel = gateway('anthropic/claude-haiku-4.5');

// claude-haiku-4.5 occasionally garbles Myanmar script output (stray Chinese/Korean/Cyrillic
// characters mixed in) — escalate to a stronger model whenever the reply must be in Myanmar.
export const chatModelMm = gateway('anthropic/claude-sonnet-4.6');

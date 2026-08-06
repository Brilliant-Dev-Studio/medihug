interface ChatMessage { role: 'user' | 'assistant'; content: string; }

// Chat threads grow unbounded on the client (full history resent every turn).
// Cap how much of it we actually forward to the model — old turns rarely
// matter for a stateless Q&A/lookup assistant, and this is the single
// biggest lever on input-token cost since it scales with every message sent.
const MAX_MESSAGES = 8;
export const MAX_INPUT_CHARS = 500;

export function trimMessages(messages: ChatMessage[]): ChatMessage[] {
  const capped = messages.map(m =>
    m.role === 'user' ? { ...m, content: m.content.slice(0, MAX_INPUT_CHARS) } : m
  );
  if (capped.length <= MAX_MESSAGES) return capped;
  return capped.slice(-MAX_MESSAGES);
}

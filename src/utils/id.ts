/** Lightweight unique id generator — avoids pulling in a uuid + polyfill dependency. */
export function generateId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${random}`;
}

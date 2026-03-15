export function calculateWPM(correctChars: number, elapsedMs: number) {
  if (elapsedMs === 0) return 0;
  const minutes = elapsedMs / 60000;
  return Math.round((correctChars / 5) / minutes);
}

export function calculateRawWPM(totalChars: number, elapsedMs: number) {
  if (elapsedMs === 0) return 0;
  const minutes = elapsedMs / 60000;
  return Math.round((totalChars / 5) / minutes);
}

export function calculateAccuracy(errors: number, totalChars: number) {
  if (totalChars === 0) return 100;
  const acc = Math.round(((totalChars - errors) / totalChars) * 100);
  return Math.max(0, Math.min(100, acc));
}

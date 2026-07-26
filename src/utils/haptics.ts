import * as Haptics from 'expo-haptics';

/**
 * Fires haptic feedback for a habit completion toggle. Never throws --
 * haptics are a nice-to-have and must never break the toggle itself.
 */
export function triggerCompletionHaptic(completed: boolean): void {
  try {
    const promise = completed
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.selectionAsync();
    void promise.catch(() => undefined);
  } catch {
    // Best-effort: haptics failures must never break the toggle.
  }
}

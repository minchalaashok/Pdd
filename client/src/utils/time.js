/**
 * Safely format timestamp strings from database / API to local user time (e.g. IST).
 * Correctly treats server timestamps without timezone designator as UTC.
 */
export const formatChatTime = (dateInput) => {
  if (!dateInput) return 'Just now';
  try {
    let d = dateInput;
    if (typeof d === 'string') {
      const normalized = d.trim().replace(' ', 'T');
      // If no timezone offset is present, treat as UTC so browser converts to local time correctly
      if (!normalized.endsWith('Z') && !/[+-]\d{2}(:?\d{2})?$/.test(normalized)) {
        d = normalized + 'Z';
      } else {
        d = normalized;
      }
    }
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'Just now';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return 'Just now';
  }
};

export const formatNotificationTime = (dateInput) => {
  return formatChatTime(dateInput);
};

/**
 * This function detects if an email address is potentially a shared inbox
 * based on patterns in the local part (before @).
 *
 * Valid patterns (likely personal emails):
 * - firstname.lastname@...
 * - firstname.last-name@... (one dot and one hyphen)
 *
 * Flagged patterns (likely shared inboxes):
 * - Multiple dots (>1): department.team.function@...
 * - Multiple hyphens (>2): team-sub-team-function@...
 * - Any underscores: team_function@...
 * - Single word with no separators (>3 chars): admin@..., info@...
 * - Mostly acronyms: Short segments (≤4 chars each) like ngn-rpg@...
 *
 * @param email The email address to check
 * @returns {boolean} True if the email appears to be a shared inbox
 */
export const isPotentialSharedInbox = (email: string): boolean => {
  // Extract the local part (before @)
  const localPart = email.split("@")[0];

  if (!localPart) return false;

  // Count separator types
  const dotCount = (localPart.match(/\./g) || []).length;
  const hyphenCount = (localPart.match(/-/g) || []).length;
  const underscoreCount = (localPart.match(/_/g) || []).length;

  // Flag if any underscores present
  if (underscoreCount > 0) return true;

  // Flag if multiple dots (>1)
  if (dotCount > 1) return true;

  // Flag if multiple hyphens (>2)
  if (hyphenCount > 2) return true;

  // Flag if single word (no separators at all)
  // Catches: ve@, admin@, info@, support@, webmaster@, etc.
  if (dotCount === 0 && hyphenCount === 0) return true;

  // Valid pattern check: exactly 1 dot and 0-1 hyphens
  // firstname.lastname or firstname.last-name
  // This must come BEFORE acronym check to allow valid names like a.b@
  if (dotCount === 1 && hyphenCount <= 1) {
    return false;
  }

  // Very long emails may be suspicious if they don't follow the explicitly valid pattern above
  if (localPart.length > 35) return true;

  // Flag emails with hyphens but no dots (e.g., word-word@, word-word-word@)
  // Valid personal emails should have at least one dot
  // This catches: defizeronet-netzerochallenge@, surveycentrercmp-centresondagegrc@
  if (dotCount === 0 && hyphenCount > 0) {
    return true;
  }

  // Check if the local part consists mostly of acronyms (short segments)
  // Split by separators and check if most segments are ≤4 characters
  // This catches patterns like: ngn-rpg, apm-gpa, defizeronet-netzerochallenge
  const segments = localPart.split(/[.-]/);
  if (segments.length >= 2) {
    const shortSegments = segments.filter((seg) => seg.length > 0 && seg.length <= 4);
    // If more than 60% of segments are short (≤4 chars), likely acronyms/shared inbox
    if (shortSegments.length / segments.length > 0.6 && shortSegments.length >= 2) {
      return true;
    }
  }

  return false;
};

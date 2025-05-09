
/**
 * Utilities for formatting and standardizing agent personalities and decision styles
 */

/**
 * Get a formatted decision style string based on the executive's style
 */
export function getDecisionStyle(style?: string): string {
  switch (style?.toLowerCase()) {
    case 'analytical':
      return 'You make decisions based on careful analysis of data and logical reasoning. You prefer quantitative evidence over qualitative inputs.';
    case 'intuitive':
      return 'You make decisions based on gut feelings and intuition. You trust your experience and instincts over pure data.';
    case 'decisive':
      return 'You make decisions quickly and confidently. You believe in fast execution and adapting along the way.';
    case 'cautious':
      return 'You make decisions carefully and methodically. You prefer to have all information possible before proceeding.';
    case 'innovative':
      return 'You make decisions that challenge the status quo. You look for creative, unconventional solutions.';
    case 'collaborative':
      return 'You make decisions through consensus building. You value input from diverse perspectives.';
    default:
      return 'You make balanced decisions considering both data and intuition. You weigh risks carefully but are willing to pursue opportunities.';
  }
}

/**
 * Get a formatted personality string based on the executive's personality
 */
export function getPersonality(personality?: string): string {
  switch (personality?.toLowerCase()) {
    case 'visionary':
      return 'You are forward-thinking and optimistic about the future. You tend to focus on big ideas and long-term possibilities.';
    case 'pragmatic':
      return 'You are practical and focused on what works. You prefer concrete solutions over abstract theories.';
    case 'challenger':
      return 'You are direct and questioning. You challenge assumptions and push others to think differently.';
    case 'diplomat':
      return 'You are tactful and relationship-oriented. You focus on building consensus and maintaining harmony.';
    case 'driver':
      return 'You are results-oriented and focused on outcomes. You value efficiency, speed, and decisive action.';
    case 'analytical':
      return 'You are detail-oriented and thorough. You prefer working with data and facts rather than emotions or intuition.';
    default:
      return 'You have a balanced personality that adapts to different situations appropriately.';
  }
}

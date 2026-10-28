// Utility functions for formatting relative timestamps, member since dates, and standardizing US City & State database locations

export const POPULAR_US_CITIES = [
  'Costa Mesa, CA',
  'Huntington Beach, CA',
  'Newport Beach, CA',
  'Irvine, CA',
  'Long Beach, CA',
  'Los Angeles, CA',
  'San Diego, CA',
  'San Francisco, CA',
  'Scottsdale, AZ',
  'Phoenix, AZ',
  'Las Vegas, NV',
  'Reno, NV',
  'Austin, TX',
  'Dallas, TX',
  'Houston, TX',
  'San Antonio, TX',
  'Denver, CO',
  'Boulder, CO',
  'Salt Lake City, UT',
  'Moab, UT',
  'Seattle, WA',
  'Portland, OR',
  'Boise, ID',
  'Nashville, TN',
  'Knoxville, TN',
  'Atlanta, GA',
  'Savannah, GA',
  'Charlotte, NC',
  'Raleigh, NC',
  'Miami, FL',
  'Orlando, FL',
  'Tampa, FL',
  'Chicago, IL',
  'Detroit, MI',
  'Indianapolis, IN',
  'Columbus, OH',
  'Philadelphia, PA',
  'Pittsburgh, PA',
  'New York, NY',
  'Boston, MA',
];

export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia'
};

const STATE_NAME_TO_ABBR: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH',
  oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
  ca: 'CA', az: 'AZ', nv: 'NV', tx: 'TX', co: 'CO', ut: 'UT', wa: 'WA', or: 'OR',
  fl: 'FL', ga: 'GA', nc: 'NC', tn: 'TN', il: 'IL', mi: 'MI', oh: 'OH', pa: 'PA', ny: 'NY'
};

/**
 * Extracts the full US State name from any location string (e.g., "Pensacola, Florida, United State" -> "Florida", "Costa Mesa, CA" -> "California", "Austin, TX" -> "Texas").
 */
export function extractStateName(location?: string): string {
  if (!location) return 'California';
  const trimmed = location.trim();
  if (!trimmed) return 'California';

  // 1. Check for multi-word or single-word state names explicitly (e.g., Florida, North Carolina, West Virginia)
  const lower = trimmed.toLowerCase();
  for (const [, fullName] of Object.entries(STATE_NAMES)) {
    const fullNameLower = fullName.toLowerCase();
    const regex = new RegExp(`\\b${fullNameLower}\\b`, 'i');
    if (regex.test(lower)) {
      return fullName;
    }
  }

  // 2. Check for 2-letter state abbreviations (e.g. CA, FL, OH, WV, TX)
  const tokens = trimmed.replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/).filter(Boolean);
  for (let i = tokens.length - 1; i >= 0; i--) {
    const tokenUpper = tokens[i].toUpperCase();
    if (STATE_NAMES[tokenUpper]) {
      return STATE_NAMES[tokenUpper];
    }
  }

  return 'California';
}

/**
 * Standardize any location input to proper "City, ST" format.
 * Examples:
 *   "costa mesa ca" -> "Costa Mesa, CA"
 *   "Austin, Texas" -> "Austin, TX"
 *   "scottsdale, az" -> "Scottsdale, AZ"
 */
export function normalizeCityState(input?: string): string {
  if (!input) return 'Costa Mesa, CA';
  const trimmed = input.trim();
  if (!trimmed) return 'Costa Mesa, CA';

  // Check if comma separated
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim());
    const cityRaw = parts[0];
    const stateRaw = parts[1] || '';

    const cityCapitalized = cityRaw
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    const stateClean = stateRaw.toLowerCase().replace(/[^a-z ]/g, '').trim();
    const stateAbbr = STATE_NAME_TO_ABBR[stateClean] || stateRaw.toUpperCase().slice(0, 2);

    return stateAbbr ? `${cityCapitalized}, ${stateAbbr}` : cityCapitalized;
  }

  // If no comma, check if last word is a state
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    const lastWord = words[words.length - 1].toLowerCase();
    if (STATE_NAME_TO_ABBR[lastWord]) {
      const cityWords = words.slice(0, -1);
      const cityCapitalized = cityWords
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      return `${cityCapitalized}, ${STATE_NAME_TO_ABBR[lastWord]}`;
    }
  }

  // Default: capitalize words
  return trimmed
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Calculates human elapsed time since item was posted (e.g. "2 Minutes Ago", "3 Hours Ago", "Yesterday")
 */
export function formatTimeAgo(dateStrOrTimestamp?: string | number): string {
  if (!dateStrOrTimestamp) return 'Just Now';

  let timestamp: number;
  if (typeof dateStrOrTimestamp === 'number') {
    timestamp = dateStrOrTimestamp;
  } else {
    // If it's a string, attempt parse
    const parsed = Date.parse(dateStrOrTimestamp);
    if (!isNaN(parsed)) {
      timestamp = parsed;
    } else {
      // Check for dateStr containing relative hints or month strings
      const m = Date.parse(`1 ${dateStrOrTimestamp}`);
      timestamp = !isNaN(m) ? m : Date.now() - 3600000;
    }
  }

  const now = Date.now();
  let diffSec = Math.floor((now - timestamp) / 1000);

  // If in future or negative due to clock skew, treat as just now
  if (diffSec < 0) {
    diffSec = 30;
  }

  if (diffSec < 60) {
    return 'Just Now';
  }

  const diffMins = Math.floor(diffSec / 60);
  if (diffMins === 1) return '1 Minute Ago';
  if (diffMins < 60) return `${diffMins} Minutes Ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 Hour Ago';
  if (diffHours < 24) return `${diffHours} Hours Ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} Days Ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '1 Week Ago';
  if (diffWeeks < 4) return `${diffWeeks} Weeks Ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 Month Ago';
  if (diffMonths < 12) return `${diffMonths} Months Ago`;

  const diffYears = Math.floor(diffDays / 365);
  if (diffYears <= 1) return '1 Year Ago';
  return `${diffYears} Years Ago`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Formats date into "[Month - Wrote out & Year]", e.g. "January 2020", "October 2026"
 */
export function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return 'January 2020';

  // If already formatted like "January 2020"
  for (const m of MONTH_NAMES) {
    if (dateStr.toLowerCase().includes(m.toLowerCase())) {
      const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        return `${m} ${yearMatch[0]}`;
      }
    }
  }

  // Attempt parse standard ISO / date string
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const month = MONTH_NAMES[parsed.getMonth()];
    const year = parsed.getFullYear();
    return `${month} ${year}`;
  }

  return dateStr;
}

import { Linking } from 'react-native';

export type Degree = 0 | 1 | 2 | 3;

export type ContactChannel = 'whatsapp' | 'linkedin' | 'email' | 'imessage' | 'discord' | 'mycircle';

export type Person = {
  id: string;
  name: string;
  firstName: string;
  profession: string;
  location: string;
  interests: string[];
  bio: string;
  degree: Degree;
  via?: string;
  viaId?: string;
  verified?: boolean;
  color: string;
  initials: string;
  photo: string;
  category?: SavedCategory;
  /** How they prefer intro messages to arrive */
  contactChannel?: ContactChannel;
  contactHandle?: string;
  /** Who can discover them */
  discoverable?: 'direct' | 'extended' | 'hidden';
  showProfession?: boolean;
  showLocation?: boolean;
  /**
   * Ghost to 2nd: friends-of-friends see “Confidential” instead of name/profession.
   * Controlled later via Privacy settings.
   */
  ghostToSecond?: boolean;
  /** Identity hidden. Profession stays visible. */
  confidential?: boolean;
};

/** Stable portrait URLs (no API key). */
export function portrait(kind: 'men' | 'women', n: number) {
  return `https://randomuser.me/api/portraits/${kind}/${n}.jpg`;
}

/** Auto-generated default avatar from a name/seed (no API key). */
export function defaultAvatar(seed: string) {
  const s = encodeURIComponent((seed || 'circle').trim() || 'circle');
  return `https://api.dicebear.com/9.x/glass/png?seed=${s}&size=256`;
}

export function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'YO';
}

export type SavedCategory =
  | 'Automotive'
  | 'Home Services'
  | 'Hair & Beauty'
  | 'Professional'
  | 'Restaurants & Bars'
  | 'Sports & Hobbies'
  | 'Other';

export type IntroRequest = {
  id: string;
  type: 'received' | 'sent';
  fromName: string;
  toName: string;
  toId: string;
  reason: string;
  mutual: string;
  status: 'pending' | 'accepted' | 'declined';
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  personId?: string;
  unread: boolean;
  action?: 'connect';
  askId?: string;
};

export const ME: Person = {
  id: 'me',
  name: 'You',
  firstName: 'You',
  profession: 'Member',
  location: '',
  interests: [],
  bio: 'Building meaningful connections in the real world. Your circle is your world.',
  degree: 0,
  color: '#FFFFFF',
  initials: 'YO',
  photo: defaultAvatar('circle-member'),
};

/** Everyone’s first connection — the Founder of the app. */
export const FOUNDER: Person = {
  id: 'founder',
  name: 'Founder of the app',
  firstName: 'Founder',
  profession: 'Founder of Circle',
  location: 'New York',
  interests: ['Circle', 'Intros', 'Community'],
  bio: 'Built Circle so warm intros beat cold DMs. You’re in the first 10k.',
  degree: 1,
  color: '#A78BFA',
  initials: 'FA',
  photo: defaultAvatar('founder-of-circle'),
  verified: true,
};

/** Live circle for a signed-in member (orbit + list). */
export const MY_CIRCLE: Person[] = [FOUNDER];

const PHANTOM = (
  profession: string,
  id: string,
  color: string
): Person => ({
  id,
  name: 'Confidential',
  firstName: 'Confidential',
  profession,
  location: '',
  interests: [],
  bio: 'Identity withheld. Profession is visible because they sit in the Founder’s circle.',
  degree: 2,
  via: 'Founder of the app',
  viaId: 'founder',
  color,
  initials: '·',
  photo: '',
  confidential: true,
  showProfession: true,
  showLocation: false,
});

/** Founder’s circle. Names stay confidential. Professions are public. */
export const FOUNDER_CONTACTS: Person[] = [
  PHANTOM('Wealth Manager', 'ph-wealth', '#FDE68A'),
  PHANTOM('Banker', 'ph-banker', '#67E8F9'),
  PHANTOM('Sales and Trading Analyst', 'ph-st', '#A78BFA'),
  PHANTOM('Software Engineer', 'ph-swe', '#34D399'),
  PHANTOM('Forward Deployment Analyst', 'ph-fda', '#F9A8D4'),
  PHANTOM('General Counsel', 'ph-counsel', '#FDBA74'),
  PHANTOM('Venture Investor', 'ph-vc', '#C4B5FD'),
  PHANTOM('Operator', 'ph-operator', '#93C5FD'),
];

export const PEOPLE: Person[] = [
  FOUNDER,
  ...FOUNDER_CONTACTS,
  {
    id: 'misha',
    name: 'Misha Volkov',
    firstName: 'Misha',
    profession: 'Product Designer',
    location: 'Brooklyn, NYC',
    interests: ['Design', 'Coffee', 'Film'],
    bio: 'Designs products people feel before they understand.',
    degree: 1,
    color: '#A78BFA',
    initials: 'MV',
    photo: portrait('women', 44),
    verified: true,
  },
  {
    id: 'james',
    name: 'James Chen',
    firstName: 'James',
    profession: 'Venture Capital',
    location: 'Manhattan, NYC',
    interests: ['Startups', 'Markets', 'Running'],
    bio: 'Investing in founders who care about craft.',
    degree: 1,
    color: '#818CF8',
    initials: 'JC',
    photo: portrait('men', 11),
    verified: true,
  },
  {
    id: 'alex',
    name: 'Alex Rivera',
    firstName: 'Alex',
    profession: 'Software Engineer',
    location: 'Brooklyn, NYC',
    interests: ['Climbing', 'Jazz', 'AI'],
    bio: 'Builds systems that stay out of the way.',
    degree: 1,
    color: '#C4B5FD',
    initials: 'AR',
    photo: portrait('men', 22),
  },
  {
    id: 'michael',
    name: 'Michael Torres',
    firstName: 'Michael',
    profession: 'Bartender',
    location: 'Brooklyn, NYC',
    interests: ['Cocktails', 'Music', 'Nightlife'],
    bio: 'Knows every great bar stool conversation in Brooklyn.',
    degree: 1,
    via: 'Alex',
    viaId: 'alex',
    color: '#67E8F9',
    initials: 'MT',
    photo: portrait('men', 36),
    category: 'Restaurants & Bars',
  },
  {
    id: 'daniel',
    name: 'Daniel Roberts',
    firstName: 'Daniel',
    profession: 'Investment Banking',
    location: 'NYC',
    interests: ['Markets', 'Soccer', 'Wine'],
    bio: 'Numbers by day, Real Madrid by night.',
    degree: 1,
    color: '#A5B4FC',
    initials: 'DR',
    photo: portrait('men', 52),
    verified: true,
    category: 'Professional',
  },
  {
    id: 'sarah',
    name: 'Sarah Kim',
    firstName: 'Sarah',
    profession: 'Brand Strategist',
    location: 'Manhattan, NYC',
    interests: ['Branding', 'Travel', 'Art'],
    bio: 'Helps brands sound like people again.',
    degree: 1,
    color: '#DDD6FE',
    initials: 'SK',
    photo: portrait('women', 65),
  },
  {
    id: 'emily',
    name: 'Emily Park',
    firstName: 'Emily',
    profession: 'Physician',
    location: 'Upper East Side',
    interests: ['Medicine', 'Yoga', 'Cooking'],
    bio: 'Evidence-based care with a human touch.',
    degree: 1,
    color: '#93C5FD',
    initials: 'EP',
    photo: portrait('women', 28),
    verified: true,
  },
  {
    id: 'rahul',
    name: 'Rahul Mehta',
    firstName: 'Rahul',
    profession: 'Entrepreneur',
    location: 'Queens, NYC',
    interests: ['Startups', 'Cars', 'Cricket'],
    bio: 'Serial builder with a soft spot for classic cars.',
    degree: 1,
    color: '#F0ABFC',
    initials: 'RM',
    photo: portrait('men', 75),
  },
  {
    id: 'lena',
    name: 'Lena Ortiz',
    firstName: 'Lena',
    profession: 'Lawyer',
    location: 'New York',
    interests: ['Law', 'Startups', 'Contracts'],
    bio: 'Counsel for early companies. Reach her through a mutual — not a cold email.',
    degree: 2,
    via: 'A mutual',
    viaId: 'demo-mutual',
    color: '#FDE68A',
    initials: 'LO',
    photo: defaultAvatar('lena-ortiz-lawyer'),
    verified: true,
    category: 'Professional',
  },
  {
    id: 'david',
    name: 'David Patel',
    firstName: 'David',
    profession: 'Automotive Specialist',
    location: 'NYC',
    interests: ['Cars', 'Motorsport', 'Coffee'],
    bio: 'Makes machines feel new again.',
    degree: 2,
    via: 'Rahul',
    viaId: 'rahul',
    color: '#22D3EE',
    initials: 'DP',
    photo: portrait('men', 41),
    verified: true,
    category: 'Automotive',
  },
  {
    id: 'sophie',
    name: 'Sophie Chen',
    firstName: 'Sophie',
    profession: 'Photographer',
    location: 'NYC',
    interests: ['Photography', 'Travel', 'Film'],
    bio: 'Captures the quiet moments between people.',
    degree: 2,
    via: 'Misha',
    viaId: 'misha',
    color: '#67E8F9',
    initials: 'SC',
    photo: portrait('women', 33),
    category: 'Other',
  },
  {
    id: 'chris',
    name: 'Chris Nguyen',
    firstName: 'Chris',
    profession: 'Chef',
    location: 'Lower East Side',
    interests: ['Food', 'Wine', 'Markets'],
    bio: 'Seasonal cooking with neighborhood energy.',
    degree: 2,
    via: 'Michael',
    viaId: 'michael',
    color: '#5EEAD4',
    initials: 'CN',
    photo: portrait('men', 18),
    category: 'Restaurants & Bars',
  },
  {
    id: 'jessica',
    name: 'Jessica Lee',
    firstName: 'Jessica',
    profession: 'UX Researcher',
    location: 'Manhattan, NYC',
    interests: ['Research', 'Books', 'Hiking'],
    bio: 'Turns human stories into product decisions.',
    degree: 2,
    via: 'Alex',
    viaId: 'alex',
    color: '#7DD3FC',
    initials: 'JL',
    photo: portrait('women', 47),
  },
  {
    id: 'andrew',
    name: 'Andrew Blake',
    firstName: 'Andrew',
    profession: 'Architect',
    location: 'Brooklyn, NYC',
    interests: ['Architecture', 'Design', 'Cycling'],
    bio: 'Spaces that invite people to stay.',
    degree: 2,
    via: 'Sarah',
    viaId: 'sarah',
    color: '#A5F3FC',
    initials: 'AB',
    photo: portrait('men', 29),
  },
  {
    id: 'olivia',
    name: 'Olivia Martin',
    firstName: 'Olivia',
    profession: 'Real Estate Agent',
    location: 'Manhattan',
    interests: ['Real Estate', 'Interiors', 'Art'],
    bio: 'Helps people find a place that feels like theirs.',
    degree: 2,
    via: 'James',
    viaId: 'james',
    color: '#99F6E4',
    initials: 'OM',
    photo: portrait('women', 12),
    verified: true,
    category: 'Professional',
  },
  {
    id: 'ryan',
    name: 'Ryan Cooper',
    firstName: 'Ryan',
    profession: 'Fitness Coach',
    location: 'Williamsburg',
    interests: ['Fitness', 'Nutrition', 'Soccer'],
    bio: 'Training that fits a real life.',
    degree: 2,
    via: 'Daniel',
    viaId: 'daniel',
    color: '#67E8F9',
    initials: 'RC',
    photo: portrait('men', 60),
    category: 'Sports & Hobbies',
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    firstName: 'Priya',
    profession: 'Data Scientist',
    location: 'Jersey City',
    interests: ['AI', 'Travel', 'Cooking'],
    bio: 'Finds signal in noisy systems.',
    degree: 2,
    via: 'Rahul',
    viaId: 'rahul',
    color: '#C4B5FD',
    initials: 'PS',
    photo: portrait('women', 21),
    verified: true,
  },
  {
    id: 'alex-morgan',
    name: 'Alex Morgan',
    firstName: 'Alex',
    profession: 'Hairstylist',
    location: 'Manhattan, NYC',
    interests: ['Beauty', 'Madrid', 'Music'],
    bio: 'Precision cuts with downtown energy.',
    degree: 2,
    via: 'Misha',
    viaId: 'misha',
    color: '#F9A8D4',
    initials: 'AM',
    photo: portrait('women', 68),
    verified: true,
    category: 'Hair & Beauty',
  },
];

/** Sample circle shown before someone creates an account. */
export const DEMO_CIRCLE: Person[] = PEOPLE.filter((p) => p.degree === 1);

let circleMode: 'member' | 'demo' = 'member';

export function setCircleMode(mode: 'member' | 'demo') {
  circleMode = mode;
}

export function activeCircle(): Person[] {
  return circleMode === 'demo' ? DEMO_CIRCLE : MY_CIRCLE;
}

export const DISCOVER_IDS = [
  'alex-morgan',
  'daniel',
  'michael',
  'sophie',
  'david',
  'olivia',
];

export const DISCOVER_CATEGORIES = [
  'All',
  'Professionals',
  'Business',
  'Social',
  'Sports',
  'Food & Drink',
  'Creative',
  'Lifestyle',
] as const;

export const CATEGORY_MAP: Record<string, string[]> = {
  Professionals: ['daniel', 'olivia', 'priya', 'emily', 'james'],
  Business: ['james', 'daniel', 'rahul', 'olivia'],
  Social: ['misha', 'sarah', 'michael', 'alex-morgan'],
  Sports: ['ryan', 'daniel', 'rahul'],
  'Food & Drink': ['michael', 'chris'],
  Creative: ['sophie', 'misha', 'andrew', 'sarah'],
  Lifestyle: ['emily', 'olivia', 'alex-morgan'],
};

export const INITIAL_INTROS: IntroRequest[] = [
  {
    id: 'intro-1',
    type: 'received',
    fromName: 'James',
    toName: 'Alex Morgan',
    toId: 'alex-morgan',
    reason:
      'Both of you are Real Madrid supporters in NYC. Would love to watch a game together.',
    mutual: 'You',
    status: 'pending',
  },
  {
    id: 'intro-2',
    type: 'received',
    fromName: 'Sarah',
    toName: 'David Patel',
    toId: 'david',
    reason: 'Looking for a reliable automotive specialist.',
    mutual: 'You',
    status: 'pending',
  },
  {
    id: 'intro-3',
    type: 'sent',
    fromName: 'You',
    toName: 'Sophie Chen',
    toId: 'sophie',
    reason: 'Would love an intro for a portrait session.',
    mutual: 'Misha',
    status: 'pending',
  },
  {
    id: 'intro-4',
    type: 'sent',
    fromName: 'You',
    toName: 'Olivia Martin',
    toId: 'olivia',
    reason: 'Looking for a trusted realtor in Manhattan.',
    mutual: 'James',
    status: 'accepted',
  },
  {
    id: 'intro-5',
    type: 'sent',
    fromName: 'You',
    toName: 'Chris Nguyen',
    toId: 'chris',
    reason: 'Curious about private dining experiences.',
    mutual: 'Michael',
    status: 'declined',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'New professional in your circle',
    body: 'A member just connected with an Automotive Specialist in NYC.',
    time: '2h ago',
    personId: 'david',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Circle update',
    body: 'Michael added a new Hairstylist to his circle.',
    time: '5h ago',
    personId: 'alex-morgan',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Shared interest',
    body: 'Someone in your extended circle is a Real Madrid supporter.',
    time: 'Yesterday',
    personId: 'alex-morgan',
    unread: true,
  },
  {
    id: 'n4',
    title: 'Verification update',
    body: 'Alex Morgan, connected through Misha, is now professionally verified.',
    time: '2d ago',
    personId: 'alex-morgan',
    unread: false,
  },
  {
    id: 'n5',
    title: 'Local discovery',
    body: 'A photographer two connections away just joined nearby.',
    time: '3d ago',
    personId: 'sophie',
    unread: false,
  },
];

export const NEARBY_PEOPLE = [
  { id: 'alex-morgan', name: 'Alex Morgan', distance: '2 feet away', note: 'Ready to connect' },
  { id: 'jessica', name: 'Jessica Lee', distance: '4 feet away', note: 'Nearby now' },
];

export const MOCK_KEYWORDS = ['MADRID42', 'BROOKLYN15'];

export const SAVED_CATEGORIES: SavedCategory[] = [
  'Automotive',
  'Home Services',
  'Hair & Beauty',
  'Professional',
  'Restaurants & Bars',
  'Sports & Hobbies',
  'Other',
];

export const NETWORK_STATS = {
  direct: MY_CIRCLE.length,
  extended: 0,
};

/** Per-person contact / privacy overlays for the prototype */
const PROFILE_EXTRAS: Record<
  string,
  Partial<
    Pick<
      Person,
      | 'contactChannel'
      | 'contactHandle'
      | 'discoverable'
      | 'showProfession'
      | 'showLocation'
      | 'ghostToSecond'
    >
  >
> = {
  misha: { contactChannel: 'whatsapp', contactHandle: '+15551230001', discoverable: 'extended' },
  james: { contactChannel: 'linkedin', contactHandle: 'jameschen-vc', discoverable: 'extended' },
  daniel: { contactChannel: 'linkedin', contactHandle: 'daniel-roberts-ib', discoverable: 'direct' },
  'alex-morgan': { contactChannel: 'whatsapp', contactHandle: '+15551230088', discoverable: 'extended' },
  david: { contactChannel: 'imessage', contactHandle: '+15551230111', discoverable: 'extended', ghostToSecond: true },
  olivia: {
    contactChannel: 'email',
    contactHandle: 'olivia@martinrealty.nyc',
    discoverable: 'extended',
    ghostToSecond: true,
  },
  sophie: { contactChannel: 'imessage', contactHandle: '+15551230222', discoverable: 'extended', ghostToSecond: true },
  michael: { contactChannel: 'whatsapp', contactHandle: '+15551230444', discoverable: 'direct' },
  priya: { contactChannel: 'linkedin', contactHandle: 'priya-sharma-ds', discoverable: 'hidden', showProfession: true },
  rahul: { contactChannel: 'whatsapp', contactHandle: '+15551230555', discoverable: 'extended' },
};

export function enrichPerson(p: Person): Person {
  const extra = PROFILE_EXTRAS[p.id] || {};
  return {
    ...p,
    contactChannel: extra.contactChannel || p.contactChannel || 'mycircle',
    contactHandle: extra.contactHandle || p.contactHandle || p.firstName.toLowerCase(),
    discoverable: extra.discoverable || p.discoverable || (p.degree === 1 ? 'extended' : 'extended'),
    showProfession: extra.showProfession ?? p.showProfession ?? true,
    showLocation: extra.showLocation ?? p.showLocation ?? true,
    ghostToSecond: extra.ghostToSecond ?? p.ghostToSecond ?? false,
  };
}

/** True when this person should appear as Confidential to a 2nd-degree viewer. */
export function isGhostToSecond(p: Person): boolean {
  return p.degree === 2 && !!p.ghostToSecond && !p.confidential;
}

export function isConfidential(p: Person): boolean {
  return !!p.confidential;
}

export function getPerson(id: string): Person | undefined {
  if (id === 'me') return enrichPerson(ME);
  const p = PEOPLE.find((x) => x.id === id);
  return p ? enrichPerson(p) : undefined;
}

export function channelLabel(ch: ContactChannel): string {
  switch (ch) {
    case 'whatsapp':
      return 'WhatsApp';
    case 'linkedin':
      return 'LinkedIn';
    case 'email':
      return 'Email';
    case 'imessage':
      return 'iMessage';
    case 'discord':
      return 'Discord';
    default:
      return 'Circle';
  }
}

/** Warm note the bridge sends to the target after approving (opens in their preferred app). */
export function buildBridgeIntroMessage(
  bridgeName: string,
  requesterName: string,
  target: Person,
  reason?: string
) {
  const why = reason?.trim()
    ? `\n\nWhy: ${reason.trim()}`
    : '';
  return (
    `Hi ${target.firstName},\n\nI'd love to introduce you to ${requesterName} from my MyCircle.` +
    why +
    `\n\nHappy to connect you two if you're open to it.\n\n— ${bridgeName}`
  );
}

export function buildIntroMessage(from: string, mutual: string, target: Person, reason?: string) {
  return (
    reason?.trim() ||
    `Hi ${mutual.split(' ')[0]},\n\nWould you mind introducing me to ${target.name}? ` +
      `I found them through your circle on MyCircle` +
      (target.showProfession !== false ? ` — they're a ${target.profession}` : '') +
      (target.showLocation !== false ? ` in ${target.location}` : '') +
      `.\n\nThanks!\n${from}`
  );
}

/**
 * Opens the person's preferred third-party channel (WhatsApp, LinkedIn, email, iMessage).
 * MyCircle itself never hosts chat — it only hands off to their chosen app.
 */
export async function openPreferredChannel(
  person: Person,
  message: string,
  opts?: { subject?: string }
): Promise<'opened' | 'unavailable' | 'mycircle'> {
  const channel = person.contactChannel || 'mycircle';
  const handle = person.contactHandle || '';

  const tryOpen = async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      /* fall through */
    }
    return false;
  };

  if (channel === 'whatsapp') {
    const phone = handle.replace(/[^\d]/g, '') || '15551230000';
    const ok = await tryOpen(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
    return ok ? 'opened' : 'unavailable';
  }

  if (channel === 'linkedin') {
    const slug = handle.replace(/^@/, '') || person.firstName.toLowerCase();
    const ok = await tryOpen(`https://www.linkedin.com/in/${slug}`);
    return ok ? 'opened' : 'unavailable';
  }

  if (channel === 'email') {
    const subject = encodeURIComponent(opts?.subject || `Introduction — ${person.name}`);
    const ok = await tryOpen(
      `mailto:${handle}?subject=${subject}&body=${encodeURIComponent(message)}`
    );
    return ok ? 'opened' : 'unavailable';
  }

  if (channel === 'imessage') {
    const phone = handle.replace(/[^\d+]/g, '') || handle;
    // sms: works for Messages / iMessage handoff on device
    const ok = await tryOpen(`sms:${phone}&body=${encodeURIComponent(message)}`);
    return ok ? 'opened' : 'unavailable';
  }

  return 'mycircle';
}

export function degreeLabel(degree: Degree): string {
  if (degree === 0) return 'You';
  if (degree === 1) return 'Your connections';
  if (degree === 2) return 'Through your circle';
  return 'Further out';
}

/** Undirected adjacency for the prototype graph. */
export function getNeighbors(personId: string): Person[] {
  if (personId === 'me') {
    // New members start with the Founder only — other seats are + invites.
    return activeCircle().map(enrichPerson);
  }

  const person = getPerson(personId);
  if (!person) return [];

  const neighbors: Person[] = [];
  const seen = new Set<string>();

  const add = (p: Person | undefined) => {
    if (!p || p.id === personId || seen.has(p.id)) return;
    seen.add(p.id);
    neighbors.push(p);
  };

  // Connected to you if they're a direct friend
  if (person.degree === 1) add(ME);

  // People who list this person as the mutual / via
  PEOPLE.filter((p) => p.viaId === personId).forEach(add);

  // If this person is 2nd degree, their via is a neighbor
  if (person.viaId) add(getPerson(person.viaId));

  // Other direct friends of yours who "share" the same circle (light prototype links)
  if (person.degree === 1) {
    // Pair a few direct friends as knowing each other for richer ego graphs
    const peerLinks: Record<string, string[]> = {
      misha: ['alex', 'sarah'],
      james: ['daniel', 'rahul'],
      alex: ['misha', 'michael'],
      michael: ['alex'],
      daniel: ['james'],
      sarah: ['misha', 'emily'],
      emily: ['sarah'],
      rahul: ['james'],
    };
    (peerLinks[personId] || []).forEach((id) => add(getPerson(id)));
  }

  return neighbors;
}

/** Ego network around a focus person. */
export function getEgoNetwork(
  focusId: string,
  maxDegree: Degree
): { first: Person[]; second: Person[] } {
  const first = getNeighbors(focusId);
  if (maxDegree < 2) return { first, second: [] };

  const firstIds = new Set(first.map((p) => p.id));
  firstIds.add(focusId);

  const secondMap = new Map<string, Person>();
  first.forEach((friend) => {
    getNeighbors(friend.id).forEach((p) => {
      if (firstIds.has(p.id) || p.id === focusId) return;
      // Only include people who share a path through this focus circle
      secondMap.set(p.id, p);
    });
  });

  return { first, second: Array.from(secondMap.values()) };
}

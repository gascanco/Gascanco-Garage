export type VehicleCategory = 
  | 'All'
  | 'Tuner & JDM'
  | 'Overland & 4x4'
  | 'Euro & Track'
  | 'Muscle & Rat Rod'
  | 'Daily Drivers & Keis'
  | 'Moto & Haulers'
  | 'Powersports & SXS'
  | 'Commercial & Heavy Duty'
  | string;

export type ModificationCategory = 
  | 'Engine & Performance'
  | 'Exhaust'
  | 'Suspension & Chassis'
  | 'Wheels & Tires'
  | 'Brakes'
  | 'Exterior & Aero'
  | 'Interior'
  | 'Electronics & Audio'
  | 'Other & Custom';

export interface Modification {
  id: string;
  category: ModificationCategory;
  partName: string;
  brand: string;
  description?: string;
  installedDate?: string;
  photoUrl?: string;
}

export interface BuildUpdate {
  id: string;
  vehicleId: string;
  title: string;
  date: string;
  content: string;
  images: string[];
  likesCount: number;
}

export interface Owner {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverPhoto?: string;
  location: string; // U.S. State based e.g. "Costa Mesa, CA"
  bio: string;
  memberSince: string;
  shopifyCustomerId?: string;
  email?: string;
  role?: 'admin' | 'member';
  isAdmin?: boolean;
  instagram?: string;
  isFollowing?: boolean;
}

export const HARD_ADMIN_EMAIL = 'Gascanco@gmail.com';

/**
 * Validates whether a user is the Hard Super Admin account linked to Gascanco@gmail.com
 */
export const isHardAdmin = (owner?: Partial<Owner> | null): boolean => {
  if (!owner) return false;
  if (owner.email && owner.email.toLowerCase() === HARD_ADMIN_EMAIL.toLowerCase()) return true;
  if (owner.id === 'user-gascanco-admin') return true;
  if (owner.isAdmin === true || owner.role === 'admin') return true;
  return false;
};

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  chassis?: string;
  nickname?: string;
  color: string;
  engine: string;
  transmission: string;
  drivetrain: 'RWD' | 'AWD' | 'FWD' | '4WD' | '6x4' | '6x6' | 'Chain/Belt' | string;
  horsepower?: string;
  primaryImage: string;
  galleryImages: string[];
  owner: Owner;
  category?: VehicleCategory;
  modifications?: Modification[];
  buildUpdates?: BuildUpdate[];
  featured?: boolean;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  visibility: 'public' | 'private';
  buildStatus: string;
}

export interface GarageFilter {
  search: string;
  make: string;
  model?: string;
  location?: string;
  sort: 'featured' | 'recent_updates' | 'latest' | 'most_mods';
}

export type ActiveView = 
  | { type: 'activity-feed' }
  | { type: 'community-builds' }
  | { type: 'events' }
  | { type: 'saved-builds' }
  | { type: 'discover' }
  | { type: 'vehicle-detail'; vehicleId: string }
  | { type: 'my-garage' }
  | { type: 'user-profile'; ownerId: string };

export interface EventUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  tag?: string;
  authorName?: string;
}

export interface GarageEvent {
  id: string;
  title: string;
  eventType: 'Car Meet' | 'Track Day' | 'Canyon Cruise' | 'Cars & Coffee' | 'Drag Night' | 'Overland Trek' | 'Dyno Day';
  date: string;
  time: string;
  location: string;
  description: string;
  coverImage: string;
  organizer: Owner;
  attendeesCount: number;
  isAttending?: boolean;
  createdAt: string;
  updates?: EventUpdate[];
}

export interface CommunityPost {
  id: string;
  title?: string;
  content: string;
  category?: 'General Discussion' | 'Question / Advice' | 'Spotted' | 'Shop Talk' | 'Track Report' | string;
  author: Owner;
  dateStr: string;
  imageUrl?: string;
  images?: string[];
  linkPreview?: {
    url: string;
    type: 'youtube' | 'website';
    youtubeId?: string;
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
  };
  vehicleId?: string;
  vehicleName?: string;
  likesCount: number;
  commentsCount?: number;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;           // Target post, build update, or activity id
  parentId?: string | null; // For threaded replies
  replyToHandle?: string;   // Optional handle reference
  author: Owner;
  content: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt?: string;
  likesCount?: number;
  dislikesCount?: number;
}

export type ActivityType = 'build_update' | 'modification' | 'event' | 'post';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  dateStr: string;
  timestamp: number;
  vehicleId?: string;
  vehicleName?: string;
  vehicleImage?: string;
  vehicleCategory?: VehicleCategory;
  owner: Owner;
  title: string;
  description: string;
  badge?: string;
  photoUrl?: string;
  images?: string[];
  linkPreview?: CommunityPost['linkPreview'];
  likesCount?: number;
  eventData?: GarageEvent;
  postCategory?: string;
  postId?: string;
}


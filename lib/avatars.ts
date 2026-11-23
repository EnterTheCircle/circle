import { ImageSourcePropType } from 'react-native';

const SET = [
  require('../assets/images/avatars/avatar-01.jpg'),
  require('../assets/images/avatars/avatar-02.jpg'),
  require('../assets/images/avatars/avatar-03.jpg'),
  require('../assets/images/avatars/avatar-04.jpg'),
  require('../assets/images/avatars/avatar-05.jpg'),
  require('../assets/images/avatars/avatar-06.jpg'),
  require('../assets/images/avatars/avatar-07.jpg'),
  require('../assets/images/avatars/avatar-08.jpg'),
];

const FOUNDER = require('../assets/images/avatars/founder.jpg');

export const FOUNDER_PHOTO = 'local:founder';

function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Stable pick from the built-in portrait set. */
export function defaultAvatar(seed: string) {
  return `local:${(hash(seed || 'circle') % SET.length) + 1}`;
}

export function isGeneratedPhoto(photo?: string) {
  return !photo || photo.startsWith('local:') || photo.includes('dicebear.com');
}

export function avatarSource(photo?: string): ImageSourcePropType {
  if (!photo || photo.includes('dicebear.com')) {
    return SET[hash(photo || 'circle') % SET.length];
  }
  if (photo === FOUNDER_PHOTO) return FOUNDER;
  if (photo.startsWith('local:')) {
    const n = Number(photo.slice(6));
    if (n >= 1 && n <= SET.length) return SET[n - 1];
  }
  return { uri: photo };
}

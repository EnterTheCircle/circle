import { Platform, useWindowDimensions } from 'react-native';

/** Desktop sidebar breakpoint for authenticated web shell. */
export const WEB_SIDEBAR_MIN = 900;

/** True on web when the viewport is too narrow for the 260px sidebar + desktop panes. */
export function useIsNarrowWeb() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width < WEB_SIDEBAR_MIN;
}

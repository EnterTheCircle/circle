import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export type GlyphName =
  | 'planet'
  | 'compass'
  | 'network'
  | 'person'
  | 'plus'
  | 'minus'
  | 'logout'
  | 'bell'
  | 'home'
  | 'locate'
  | 'chevron'
  | 'search'
  | 'bookmark'
  | 'close'
  | 'camera'
  | 'edit'
  | 'shield'
  | 'chart';

/** Drawn icons — no icon font, so they never render as empty squares. */
export function Glyph({
  name,
  size = 18,
  color = '#fff',
}: {
  name: GlyphName;
  size?: number;
  color?: string;
}) {
  const props = { width: size, height: size, viewBox: '0 0 24 24' };
  const stroke = { stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };

  switch (name) {
    case 'plus':
      return (
        <Svg {...props}>
          <Path d="M12 5v14M5 12h14" {...stroke} />
        </Svg>
      );
    case 'minus':
      return (
        <Svg {...props}>
          <Path d="M5 12h14" {...stroke} />
        </Svg>
      );
    case 'planet':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="4" {...stroke} />
          <Path d="M5 9.5c2.2-3 11.8-3 14 0M5 14.5c2.2 3 11.8 3 14 0" {...stroke} />
        </Svg>
      );
    case 'compass':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="8" {...stroke} />
          <Path d="M14.8 9.2 13.2 13.2 9.2 14.8 10.8 10.8Z" fill={color} stroke={color} strokeWidth={1} />
        </Svg>
      );
    case 'network':
      return (
        <Svg {...props}>
          <Circle cx="6" cy="7" r="2" {...stroke} />
          <Circle cx="18" cy="7" r="2" {...stroke} />
          <Circle cx="12" cy="17" r="2" {...stroke} />
          <Path d="M8 8.2 10.4 15.2M16 8.2 13.6 15.2M8 7h8" {...stroke} />
        </Svg>
      );
    case 'person':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="8" r="3" {...stroke} />
          <Path d="M6.5 18.5c1.2-2.6 3.1-3.8 5.5-3.8s4.3 1.2 5.5 3.8" {...stroke} />
        </Svg>
      );
    case 'bell':
      return (
        <Svg {...props}>
          <Path d="M6 16h12l-1.2-2.1V11a4.8 4.8 0 0 0-9.6 0v2.9L6 16Z" {...stroke} />
          <Path d="M10 16.5a2 2 0 0 0 4 0" {...stroke} />
        </Svg>
      );
    case 'home':
      return (
        <Svg {...props}>
          <Path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1v-7.5Z" {...stroke} />
        </Svg>
      );
    case 'locate':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="3" {...stroke} />
          <Path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" {...stroke} />
        </Svg>
      );
    case 'logout':
      return (
        <Svg {...props}>
          <Path d="M10 7V5h8v14h-8v-2" {...stroke} />
          <Path d="M4 12h10M11 9l3 3-3 3" {...stroke} />
        </Svg>
      );
    case 'chevron':
      return (
        <Svg {...props}>
          <Path d="M14 6 8 12l6 6" {...stroke} />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...props}>
          <Circle cx="11" cy="11" r="6" {...stroke} />
          <Path d="M15.5 15.5 20 20" {...stroke} />
        </Svg>
      );
    case 'bookmark':
      return (
        <Svg {...props}>
          <Path d="M7 4.5h10v15l-5-3-5 3v-15Z" {...stroke} />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...props}>
          <Path d="M7 7l10 10M17 7 7 17" {...stroke} />
        </Svg>
      );
    case 'camera':
      return (
        <Svg {...props}>
          <Path d="M8 8 9.5 5.5h5L16 8h2.5v10.5h-13V8H8Z" {...stroke} />
          <Circle cx="12" cy="13" r="2.6" {...stroke} />
        </Svg>
      );
    case 'edit':
      return (
        <Svg {...props}>
          <Path d="M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5Z" {...stroke} />
          <Path d="M13 7.5 16.5 11" {...stroke} />
        </Svg>
      );
    case 'shield':
      return (
        <Svg {...props}>
          <Path d="M12 3.5 19 6.5v5.2c0 4.2-2.8 7.2-7 8.8-4.2-1.6-7-4.6-7-8.8V6.5L12 3.5Z" {...stroke} />
        </Svg>
      );
    case 'chart':
      return (
        <Svg {...props}>
          <Path d="M4 19h16" {...stroke} />
          <Path d="M7 16V11" {...stroke} />
          <Path d="M12 16V7" {...stroke} />
          <Path d="M17 16v-4" {...stroke} />
        </Svg>
      );
    default:
      return null;
  }
}

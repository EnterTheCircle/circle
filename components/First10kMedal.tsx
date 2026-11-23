import React from 'react';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

/** Small medal that sits next to a name. */
export function First10kMedal({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d="M11 3h4l1.2 6H12.2L11 3Z" fill="#7C3AED" />
      <Path d="M17 3h4l-1.2 6h-4L17 3Z" fill="#5B21B6" />
      <Circle cx="16" cy="18" r="9" fill="#F6D37A" />
      <Circle cx="16" cy="18" r="7" fill="#E8B84A" />
      <Circle cx="16" cy="18" r="5.2" fill="#F8E7A8" />
      <SvgText
        x="16"
        y="20.2"
        textAnchor="middle"
        fontSize="5.2"
        fontWeight="700"
        fill="#6B3A08"
      >
        10k
      </SvgText>
    </Svg>
  );
}

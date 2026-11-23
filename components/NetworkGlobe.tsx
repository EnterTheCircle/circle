import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import { Glyph } from '@/components/Glyph';
import {
  ME,
  Person,
  Degree,
  getEgoNetwork,
  getPerson,
  isGhostToSecond,
} from '@/constants/mockData';
import { Colors } from '@/constants/theme';
import { avatarSource } from '@/lib/avatars';
import { First10kMedal } from '@/components/First10kMedal';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
/** Default canvas size (mobile / when no size prop). */
export const DEFAULT_GLOBE_SIZE = Math.min(SCREEN_W + 8, Math.max(400, SCREEN_H * 0.58));
const FOV = 500;

export type DegreeFilter = 1 | 2 | 3 | 'all';

export const ZOOM_FOR_DEGREE: Record<1 | 2 | 3, number> = {
  1: 1.42,
  2: 1.1,
  3: 0.82,
};

/** Wider default framing on web so orbits fill the pane. */
export const WEB_ZOOM_FOR_DEGREE: Record<1 | 2 | 3, number> = {
  1: 1.12,
  2: 0.92,
  3: 0.74,
};

export function degreeFromZoom(zoom: number): Degree {
  if (zoom >= 1.26) return 1;
  if (zoom >= 0.96) return 2;
  return 3;
}

export function filterToMaxDegree(f: DegreeFilter): Degree {
  return f === 'all' ? 3 : f;
}

type Vec3 = { x: number; y: number; z: number };

type GlobeNode = {
  person: Person;
  ring: 1 | 2 | 3;
  radius: number;
  baseAngle: number;
  orbitSpeed: number;
  tilt: Vec3; // rx, ry, rz stored as x,y,z
  baseSize: number;
  anonymous?: boolean;
  /** Empty seat — show + invite affordance so orbits never look bare. */
  emptySlot?: boolean;
  viaId?: string;
  phase: number;
};

type Props = {
  maxDegree: Degree;
  zoom: number;
  onZoomChange: (z: number) => void;
  focusId: string;
  highlightId?: string | null;
  onFocusPerson: (p: Person) => void;
  onOpenProfile: (p: Person) => void;
  onResetView?: () => void;
  /** Hide overlay Reset / zoom so the parent can own the toolbar (web). */
  hideChrome?: boolean;
  /** Pixel size of the square globe canvas. */
  size?: number;
  /** Called when user taps an empty + seat. */
  onInvite?: () => void;
  /** Live signed-in user for the center nucleus (name + photo). */
  mePerson?: Person;
  /** Show First 10k badge under the center label. */
  showFirst10k?: boolean;
};

function rotX(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}
function rotY(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}
function rotZ(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
}

function orbitPoint(angle: number, radius: number, tilt: Vec3): Vec3 {
  let v: Vec3 = { x: Math.cos(angle) * radius, y: 0, z: Math.sin(angle) * radius };
  v = rotX(v, tilt.x);
  v = rotY(v, tilt.y);
  v = rotZ(v, tilt.z);
  return v;
}

function camRotate(v: Vec3, yaw: number, pitch: number): Vec3 {
  return rotX(rotY(v, yaw), pitch);
}

function project(v: Vec3, zoom: number, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = FOV / (FOV / zoom + v.z + size * 0.28);
  return {
    x: cx + v.x * scale,
    y: cy + v.y * scale,
    scale,
    depth: v.z,
  };
}

function stableSort(people: Person[]) {
  return [...people].sort((a, b) => a.id.localeCompare(b.id));
}

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function emptyPerson(id: string, degree: Degree): Person {
  return {
    id,
    name: 'Invite',
    firstName: 'Invite',
    profession: 'Open seat',
    location: '',
    interests: [],
    bio: '',
    degree,
    color: '#64748B',
    initials: '+',
    photo: '',
  };
}

function pushEmptySlots(
  nodes: GlobeNode[],
  ring: 1 | 2 | 3,
  count: number,
  startIndex: number,
  totalSeats: number,
  radius: number,
  tilt: Vec3,
  baseSize: number,
  orbitSpeed: number,
  angleOffset: number
) {
  for (let i = 0; i < count; i++) {
    const seat = startIndex + i;
    nodes.push({
      person: emptyPerson(`empty-${ring}-${seat}`, ring),
      ring,
      radius,
      baseAngle: (seat / totalSeats) * Math.PI * 2 + angleOffset,
      orbitSpeed,
      tilt,
      baseSize,
      emptySlot: true,
      anonymous: true,
      phase: seat * 0.37,
    });
  }
}

function buildNodes(focusId: string, size: number): GlobeNode[] {
  const { first, second } = getEgoNetwork(focusId, 3);
  const a = stableSort(first);
  const b = stableSort(second);
  const nodes: GlobeNode[] = [];
  const isWeb = Platform.OS === 'web';
  const nodeScale = isWeb ? Math.max(0.95, size / 480) : 1;

  // Web: wider rings to fill the desktop pane. Phone: original compact orbits.
  const r1 = size * (isWeb ? 0.4 : 0.34);
  const r2 = size * (isWeb ? 0.545 : 0.46);
  const r3 = size * (isWeb ? 0.68 : 0.56);

  const tilt1 = { x: 0.42, y: 0.18, z: 0.08 };
  const tilt2 = { x: -0.55, y: 0.72, z: -0.2 };
  const tilt3 = { x: 0.25, y: -0.85, z: 0.35 };

  const seats1 = Math.max(isWeb ? 8 : Math.max(a.length, 1), a.length);
  a.forEach((p, i) => {
    nodes.push({
      person: p,
      ring: 1,
      radius: r1,
      baseAngle: (i / seats1) * Math.PI * 2 + 0.2,
      orbitSpeed: 0.1 + (hash(p.id) % 5) * 0.006,
      tilt: tilt1,
      baseSize: (isWeb ? 34 : 34) * nodeScale,
      phase: hash(p.id) * 0.01,
      viaId: undefined,
    });
  });
  pushEmptySlots(
    nodes,
    1,
    seats1 - a.length,
    a.length,
    seats1,
    r1,
    tilt1,
    (isWeb ? 28 : 26) * nodeScale,
    0.08,
    0.2
  );

  const seats2 = Math.max(isWeb ? 12 : Math.max(b.length, 1), b.length);
  b.forEach((p, i) => {
    nodes.push({
      person: p,
      ring: 2,
      radius: r2,
      baseAngle: (i / seats2) * Math.PI * 2 + 0.55,
      orbitSpeed: -0.07 - (hash(p.id) % 4) * 0.005,
      tilt: tilt2,
      baseSize: (isWeb ? 22 : 22) * nodeScale,
      phase: hash(p.id) * 0.01,
      viaId: p.viaId,
    });
  });
  pushEmptySlots(
    nodes,
    2,
    seats2 - b.length,
    b.length,
    seats2,
    r2,
    tilt2,
    (isWeb ? 20 : 18) * nodeScale,
    -0.05,
    0.55
  );

  // Outer ring: + invite seats so sparse circles don’t look empty
  const seats3 = isWeb ? 10 : 8;
  for (let i = 0; i < seats3; i++) {
    nodes.push({
      person: emptyPerson(`empty-3-${i}`, 3),
      ring: 3,
      radius: r3,
      baseAngle: (i / seats3) * Math.PI * 2 + 0.9,
      orbitSpeed: 0.04 + (i % 3) * 0.008,
      tilt: tilt3,
      baseSize: (isWeb ? 16 : 12) * nodeScale,
      emptySlot: true,
      anonymous: true,
      phase: i * 0.4,
    });
  }
  return nodes;
}

function clampZoom(z: number) {
  return Math.max(0.7, Math.min(1.65, z));
}

function quadPath(x1: number, y1: number, x2: number, y2: number, bend: number) {
  const mx = (x1 + x2) / 2 + (y2 - y1) * bend;
  const my = (y1 + y2) / 2 - (x2 - x1) * bend;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

export function NetworkGlobe({
  maxDegree,
  zoom,
  onZoomChange,
  focusId,
  highlightId,
  onFocusPerson,
  onOpenProfile,
  onResetView,
  hideChrome,
  size: sizeProp,
  onInvite,
  mePerson,
  showFirst10k,
}: Props) {
  const size = sizeProp ?? DEFAULT_GLOBE_SIZE;
  const [tick, setTick] = useState(0);
  const yaw = useRef(0.55);
  const pitch = useRef(0.38);
  const auto = useRef(true);
  const slowed = useRef(false);
  const drag = useRef({ x: 0, y: 0 });
  const pinch0 = useRef<number | null>(null);
  const pinchZ = useRef(zoom);
  const zoomRef = useRef(zoom);
  const tRef = useRef(0);
  const mode = useRef<'none' | 'pan' | 'pinch'>('none');
  zoomRef.current = zoom;

  const focus =
    focusId === 'me' && mePerson
      ? mePerson
      : getPerson(focusId) || mePerson || ME;
  const baseNodes = useMemo(() => buildNodes(focusId, size), [focusId, size]);

  useEffect(() => {
    slowed.current = !!highlightId;
  }, [highlightId]);

  useEffect(() => {
    const id = setInterval(() => {
      const spd = slowed.current ? 0.25 : 1;
      tRef.current += 0.016 * spd;
      if (auto.current && !slowed.current) yaw.current += 0.0015;
      setTick((x) => x + 1);
    }, 40);
    return () => clearInterval(id);
  }, []);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
        onPanResponderGrant: (e) => {
          auto.current = false;
          if (e.nativeEvent.touches.length >= 2) {
            mode.current = 'pinch';
            const [a, b] = e.nativeEvent.touches;
            pinch0.current = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
            pinchZ.current = zoomRef.current;
          } else {
            mode.current = 'pan';
            pinch0.current = null;
          }
        },
        onPanResponderMove: (e, g) => {
          const touches = e.nativeEvent.touches;
          if (touches.length >= 2) {
            mode.current = 'pinch';
            const [a, b] = touches;
            const d = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
            if (!pinch0.current || pinch0.current < 8) {
              pinch0.current = d;
              pinchZ.current = zoomRef.current;
            } else onZoomChange(clampZoom(pinchZ.current * (d / pinch0.current)));
            return;
          }
          if (mode.current === 'pinch') return;
          yaw.current += (g.dx - drag.current.x) * 0.0055;
          pitch.current = Math.max(
            -0.7,
            Math.min(0.85, pitch.current + (g.dy - drag.current.y) * 0.0045)
          );
          drag.current = { x: g.dx, y: g.dy };
          setTick((x) => x + 1);
        },
        onPanResponderRelease: () => {
          drag.current = { x: 0, y: 0 };
          pinch0.current = null;
          mode.current = 'none';
          setTimeout(() => {
            if (!slowed.current) auto.current = true;
          }, 1100);
        },
      }),
    [onZoomChange]
  );

  void tick;
  const t = tRef.current;
  const floatX = Math.sin(t * 0.12) * 2.5;
  const floatY = Math.cos(t * 0.1) * 2;
  const cx = size / 2 + floatX;
  const cy = size / 2 + floatY;
  const breath = 1 + Math.sin(t * 0.95) * 0.028;
  const coreSize = (48 + zoom * 14) * Math.max(0.9, size / 420) * breath;
  const pulse = (Math.sin(t * 1.15) + 1) / 2;
  const exclusion = coreSize * 0.7;

  // Path highlight set
  const pathIds = useMemo(() => {
    const s = new Set<string>([focusId]);
    if (!highlightId || highlightId === focusId) return s;
    s.add(highlightId);
    const p = getPerson(highlightId);
    if (p?.viaId) s.add(p.viaId);
    // if focused not me, still show via relative to graph
    if (focusId === 'me' && p?.degree === 1) s.add('me');
    if (focusId !== 'me') s.add(focusId);
    return s;
  }, [highlightId, focusId]);

  const projected = baseNodes.map((n) => {
    const angle = n.baseAngle + t * n.orbitSpeed;
    const local = orbitPoint(angle, n.radius, n.tilt);
    // micro float
    local.x += Math.sin(t * 0.3 + n.phase) * 1.4;
    local.y += Math.cos(t * 0.25 + n.phase) * 1.2;
    const world = camRotate(local, yaw.current, pitch.current);
    const p = project(world, zoom, size);
    const x = p.x + floatX;
    const y = p.y + floatY;
    const visible =
      n.ring === 1 ||
      (n.ring === 2 && maxDegree >= 2) ||
      (n.ring === 3 && maxDegree >= 3);

    const depthNorm = Math.max(-1, Math.min(1, -world.z / (size * 0.42)));
    const depthScale = 0.58 + ((depthNorm + 1) / 2) * 0.72;
    let nodeSize = Math.max(10, n.baseSize * p.scale * depthScale);
    if (highlightId === n.person.id) nodeSize *= 1.12;

    const dist = Math.hypot(x - cx, y - cy);
    const occlude = Math.min(1, Math.max(0, 1 - dist / (exclusion + nodeSize * 0.5)) * 1.35);
    nodeSize *= 1 - occlude * 0.48;

    const onPath = pathIds.has(n.person.id);
    const dim = highlightId && !onPath && n.person.id !== focusId;

    return {
      ...n,
      x,
      y,
      world,
      depth: world.z,
      size: Math.max(9, nodeSize),
      front: world.z < 12,
      visible,
      occlude: 1 - occlude * 0.9,
      depthOpacity: 0.32 + ((depthNorm + 1) / 2) * 0.68,
      onPath,
      dim: !!dim,
      zIndex: Math.round(30 - world.z),
    };
  });

  const byId = Object.fromEntries(projected.map((n) => [n.person.id, n]));

  type Edge = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    ring: number;
    hot: boolean;
    dim: boolean;
    o: number;
    bend: number;
  };
  const edges: Edge[] = [];

  projected.forEach((n) => {
    if (!n.visible || n.occlude < 0.12) return;
    if (n.ring === 1) {
      const hot = !!(highlightId && n.onPath);
      edges.push({
        x1: cx,
        y1: cy,
        x2: n.x,
        y2: n.y,
        ring: 1,
        hot,
        dim: n.dim,
        o: (n.dim ? 0.04 : 0.16 + n.depthOpacity * 0.18) * n.occlude,
        bend: 0.12,
      });
    }
    if (n.ring === 2) {
      const via =
        (n.viaId && byId[n.viaId]) ||
        projected.find((p) => p.ring === 1 && p.visible && p.front) ||
        projected.find((p) => p.ring === 1 && p.visible);
      if (via?.visible) {
        const hot = !!(highlightId && n.onPath && via.onPath);
        edges.push({
          x1: via.x,
          y1: via.y,
          x2: n.x,
          y2: n.y,
          ring: 2,
          hot,
          dim: n.dim,
          o: (n.dim ? 0.03 : 0.1) * n.occlude * n.depthOpacity,
          bend: 0.18,
        });
      }
    }
  });

  // Particle along highlighted path
  const particles: { x: number; y: number; o: number }[] = [];
  if (highlightId) {
    edges
      .filter((e) => e.hot)
      .forEach((e, ei) => {
        for (let k = 0; k < 3; k++) {
          const u = ((t * 0.35 + k * 0.33 + ei * 0.1) % 1);
          const mx = (e.x1 + e.x2) / 2 + (e.y2 - e.y1) * e.bend;
          const my = (e.y1 + e.y2) / 2 - (e.x2 - e.x1) * e.bend;
          // quadratic bezier
          const ox = (1 - u) * (1 - u) * e.x1 + 2 * (1 - u) * u * mx + u * u * e.x2;
          const oy = (1 - u) * (1 - u) * e.y1 + 2 * (1 - u) * u * my + u * u * e.y2;
          particles.push({ x: ox, y: oy, o: 0.55 });
        }
      });
  }

  const sorted = [...projected].sort((a, b) => b.depth - a.depth);

  // Orbit guide ellipses (sampled)
  const ringScale = Platform.OS === 'web' ? { a: 0.4, b: 0.545, c: 0.68 } : { a: 0.34, b: 0.46, c: 0.56 };
  const guides = (
    [
      { r: size * ringScale.a, tilt: { x: 0.42, y: 0.18, z: 0.08 }, show: true, color: 'rgba(167,139,250,0.4)' },
      {
        r: size * ringScale.b,
        tilt: { x: -0.55, y: 0.72, z: -0.2 },
        show: maxDegree >= 2,
        color: 'rgba(34,211,238,0.28)',
      },
      {
        r: size * ringScale.c,
        tilt: { x: 0.25, y: -0.85, z: 0.35 },
        show: maxDegree >= 3,
        color: 'rgba(148,163,184,0.22)',
      },
    ] as const
  ).map((g) => {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (let i = 0; i < 28; i++) {
      const local = orbitPoint((i / 28) * Math.PI * 2, g.r, g.tilt);
      const w = camRotate(local, yaw.current, pitch.current);
      const pr = project(w, zoom, size);
      minX = Math.min(minX, pr.x);
      maxX = Math.max(maxX, pr.x);
      minY = Math.min(minY, pr.y);
      maxY = Math.max(maxY, pr.y);
    }
    return {
      ...g,
      ecx: (minX + maxX) / 2 + floatX,
      ecy: (minY + maxY) / 2 + floatY,
      rx: Math.max(6, (maxX - minX) / 2),
      ry: Math.max(5, (maxY - minY) / 2),
    };
  });

  const press = (person: Person) => {
    if (person.id === focusId) onOpenProfile(person);
    else onFocusPerson(person);
  };

  const reset = () => {
    yaw.current = 0.55;
    pitch.current = 0.38;
    auto.current = true;
    onResetView?.();
    setTick((x) => x + 1);
  };

  return (
    <View style={[styles.wrap, { width: size, height: size }]} {...pan.panHandlers}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="void" cx="50%" cy="45%" r="55%">
            <Stop offset="0%" stopColor="#7C3AED" stopOpacity="0.22" />
            <Stop offset="40%" stopColor="#0891B2" stopOpacity="0.07" />
            <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="core" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <Stop offset="45%" stopColor="#22D3EE" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Circle cx={cx} cy={cy} r={size * 0.48} fill="url(#void)" />

        {/* starfield */}
        {Array.from({ length: 22 }).map((_, i) => {
          const a = t * 0.08 + i * 0.9;
          const rr = size * (0.12 + (i % 5) * 0.07);
          return (
            <Circle
              key={`s-${i}`}
              cx={cx + Math.cos(a) * rr}
              cy={cy + Math.sin(a * 0.75) * rr * 0.62}
              r={0.8 + (i % 3) * 0.4}
              fill={i % 2 ? '#67E8F9' : '#C4B5FD'}
              opacity={0.1 + (i % 4) * 0.04}
            />
          );
        })}

        {guides.map((g, i) =>
          g.show ? (
            <Ellipse
              key={`g-${i}`}
              cx={g.ecx}
              cy={g.ecy}
              rx={g.rx}
              ry={g.ry}
              stroke={g.color}
              strokeWidth={i === 0 ? 1.35 : 1.1}
              fill="none"
              opacity={highlightId ? 0.35 : 0.9}
            />
          ) : null
        )}

        {edges.map((e, i) => (
          <Path
            key={`e-${i}`}
            d={quadPath(e.x1, e.y1, e.x2, e.y2, e.bend)}
            stroke={e.hot ? '#22D3EE' : e.ring === 1 ? '#A78BFA' : '#64748B'}
            strokeWidth={e.hot ? 2.2 : e.ring === 1 ? 1.15 : 0.75}
            fill="none"
            opacity={e.hot ? 0.95 : e.o}
            strokeLinecap="round"
          />
        ))}

        {particles.map((p, i) => (
          <Circle key={`pt-${i}`} cx={p.x} cy={p.y} r={2.2} fill="#67E8F9" opacity={p.o} />
        ))}

        <Circle
          cx={cx}
          cy={cy}
          r={coreSize * (0.92 + pulse * 0.28)}
          stroke="#22D3EE"
          strokeWidth={1.5}
          fill="none"
          opacity={0.4 - pulse * 0.2}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={coreSize * (1.15 + pulse * 0.4)}
          stroke="#A78BFA"
          strokeWidth={1}
          fill="none"
          opacity={0.22 - pulse * 0.1}
        />
        <Circle cx={cx} cy={cy} r={coreSize * 0.82} fill="url(#core)" opacity={0.5 + pulse * 0.1} />
      </Svg>

      {sorted.map((n) => {
        if (!n.visible || n.occlude < 0.1) return null;
        const isEmpty = !!n.emptySlot;
        const confidential = !!n.person.confidential;
        const opacity = confidential
          ? 1
          : isEmpty
            ? (0.5 + n.depthOpacity * 0.35) * n.occlude * (n.dim ? 0.25 : 1)
            : (n.anonymous ? 0.28 : 0.45) * n.depthOpacity * n.occlude * (n.dim ? 0.22 : 1) +
              (n.front && !n.anonymous && !n.dim ? 0.28 : 0);
        const hot = !isEmpty && highlightId === n.person.id;
        const showLabel =
          !isEmpty &&
          (confidential
            ? n.occlude > 0.35
            : !n.anonymous && (hot || (n.ring === 1 && n.front && !highlightId && n.occlude > 0.75)));
        const draw = confidential ? Math.max(n.size, 44) : n.size;

        return (
          <View
            key={n.person.id}
            style={{
              position: 'absolute',
              left: n.x - draw / 2,
              top: n.y - draw / 2,
              width: confidential ? 120 : n.size,
              zIndex: Math.min(90, Math.max(1, n.zIndex)),
              alignItems: 'center',
              opacity,
            }}
          >
            <Pressable
              onPress={() => {
                if (isEmpty) onInvite?.();
                else if (!n.anonymous) press(n.person);
              }}
              style={[
                styles.node,
                isEmpty && styles.emptyNode,
                {
                  width: draw,
                  height: draw,
                  borderRadius: draw / 2,
                  borderColor: isEmpty
                    ? 'rgba(167,139,250,0.55)'
                    : confidential
                      ? 'rgba(226,232,240,0.7)'
                    : hot
                      ? '#22D3EE'
                      : n.onPath && highlightId
                        ? '#A78BFA'
                        : n.person.color,
                  borderWidth: isEmpty ? 1.5 : confidential ? 2 : hot ? 2.6 : n.ring === 1 ? 2 : 1.2,
                  // dashed can be flaky on some native builds — keep solid on phone
                  ...(Platform.OS === 'web' && isEmpty ? { borderStyle: 'dashed' as const } : null),
                  backgroundColor: confidential || isGhostToSecond(n.person) ? '#2A2A38' : '#0B1020',
                  shadowColor: hot ? '#22D3EE' : n.person.color,
                  shadowOpacity: isEmpty ? 0 : hot ? 0.8 : n.front ? 0.35 : 0.08,
                  shadowRadius: hot ? 14 : 8,
                },
              ]}
            >
              {isEmpty ? (
                <Text
                  style={{
                    color: '#C4B5FD',
                    fontSize: Math.max(14, n.size * 0.55),
                    fontWeight: '500',
                    lineHeight: Math.max(16, n.size * 0.6),
                  }}
                >
                  +
                </Text>
              ) : isGhostToSecond(n.person) || n.person.confidential ? (
                <Text style={{ color: '#F8FAFC', fontSize: Math.max(16, draw * 0.42), fontWeight: '700' }}>
                  ?
                </Text>
              ) : (
                <Image source={avatarSource(n.person.photo)} style={styles.photo} />
              )}
            </Pressable>
            {showLabel ? (
              <Text style={[styles.nodeName, confidential && styles.nodeNameConfidential]} numberOfLines={2}>
                {n.person.confidential
                  ? n.person.profession
                  : isGhostToSecond(n.person)
                    ? 'Confidential'
                    : n.person.firstName}
              </Text>
            ) : null}
          </View>
        );
      })}

      <Pressable
        onPress={() => press(focus)}
        style={[
          styles.node,
          styles.core,
          {
            left: cx - coreSize / 2,
            top: cy - coreSize / 2,
            width: coreSize,
            height: coreSize,
            borderRadius: coreSize / 2,
            zIndex: 200,
            shadowOpacity: 0.55 + pulse * 0.25,
            shadowRadius: 20 + pulse * 8,
          },
        ]}
      >
        <Image source={avatarSource(focus.photo)} style={styles.photo} />
      </Pressable>

      <View style={[styles.centerLabel, { top: cy + coreSize / 2 + 8 }]} pointerEvents="none">
        <View style={styles.nameRow}>
          <Text style={styles.centerName}>{focus.firstName}</Text>
          {focusId === 'me' && showFirst10k ? <First10kMedal size={18} /> : null}
        </View>
        <Text style={styles.centerSub}>
          {focusId === 'me' ? 'Your connections' : 'Tap again for profile'}
        </Text>
      </View>

      {hideChrome ? null : (
        <>
          <View style={styles.topControls}>
            {focusId !== 'me' ? (
              <Pressable style={styles.chipBtn} onPress={() => onFocusPerson(ME)}>
                <Glyph name="home" size={13} color={Colors.accent} />
                <Text style={styles.chipTxt}>My circle</Text>
              </Pressable>
            ) : (
              <View />
            )}
            <Pressable style={styles.chipBtn} onPress={reset}>
              <Glyph name="locate" size={13} color={Colors.cyan} />
              <Text style={[styles.chipTxt, { color: Colors.cyan }]}>Reset</Text>
            </Pressable>
          </View>

          <View style={styles.zoomControls}>
            <Pressable style={styles.zoomBtn} onPress={() => onZoomChange(clampZoom(zoom + 0.1))}>
              <Glyph name="plus" size={18} color="#fff" />
            </Pressable>
            <Pressable style={styles.zoomBtn} onPress={() => onZoomChange(clampZoom(zoom - 0.1))}>
              <Glyph name="minus" size={18} color="#fff" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center' },
  node: { overflow: 'hidden', backgroundColor: '#0B1020', alignItems: 'center', justifyContent: 'center' },
  emptyNode: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  core: {
    position: 'absolute',
    borderColor: '#22D3EE',
    borderWidth: 3,
    shadowColor: '#22D3EE',
  },
  photo: { width: '100%', height: '100%', borderRadius: 999 },
  nodeName: {
    marginTop: 3,
    color: '#E5E7EB',
    fontSize: 10,
    fontWeight: '700',
    width: 88,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  nodeNameConfidential: {
    color: '#F8FAFC',
    fontSize: 11,
    width: 108,
    lineHeight: 13,
  },
  centerLabel: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 220 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  centerName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  centerSub: { color: '#94A3B8', fontSize: 11, marginTop: 3 },
  first10kBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(167,139,250,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.55)',
  },
  first10kText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  topControls: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    zIndex: 90,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(8,12,24,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  chipTxt: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  zoomControls: { position: 'absolute', right: 8, bottom: 12, gap: 8, zIndex: 80 },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(8,12,24,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

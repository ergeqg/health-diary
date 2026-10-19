import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors, space } from '../theme';

type Point = { label: string; value: number | null };

/** 날짜별 값 추이를 보여주는 꺾은선 그래프 */
export function LineChart({
  data,
  height = 160,
  width,
  color = colors.primary,
  goal,
}: {
  data: Point[];
  height?: number;
  width: number;
  color?: string;
  goal?: number;
}) {
  const w = Math.max(width, 80);
  const padL = 34;
  const padR = 12;
  const padT = 12;
  const padB = 22;
  const innerW = Math.max(w - padL - padR, 10);
  const innerH = Math.max(height - padT - padB, 10);

  const values = data
    .map((d) => d.value)
    .filter((v): v is number => v !== null);
  const candidates = goal !== undefined ? [...values, goal] : values;
  if (candidates.length === 0) {
    return (
      <View style={[st.placeholder, { height }]}>
        <Text style={st.placeholderText}>기록이 쌓이면 그래프가 그려집니다</Text>
      </View>
    );
  }

  let min = Math.min(...candidates);
  let max = Math.max(...candidates);
  if (max - min < 1) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.15;
  min -= pad;
  max += pad;

  const x = (i: number) =>
    padL + (data.length <= 1 ? innerW / 2 : (innerW * i) / (data.length - 1));
  const y = (v: number) => padT + innerH - ((v - min) / (max - min)) * innerH;

  // 값이 없는 날은 건너뛰고 선을 이어 그린다
  const filled = data
    .map((d, i) => ({ ...d, i }))
    .filter((d): d is Point & { value: number; i: number } => d.value !== null);

  const linePath = filled
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${x(p.i)},${y(p.value)}`)
    .join(' ');

  const areaPath =
    filled.length > 1
      ? `${linePath} L${x(filled[filled.length - 1].i)},${padT + innerH} L${x(
          filled[0].i
        )},${padT + innerH} Z`
      : '';

  const ticks = [max, (max + min) / 2, min];

  return (
    <Svg width={w} height={height}>
      <Defs>
        <LinearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.22" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {ticks.map((t, i) => (
        <React.Fragment key={i}>
          <Line
            x1={padL}
            y1={y(t)}
            x2={w - padR}
            y2={y(t)}
            stroke={colors.line}
            strokeWidth={1}
          />
          <SvgLabel x={4} y={y(t) + 4} text={t.toFixed(1)} />
        </React.Fragment>
      ))}

      {goal !== undefined ? (
        <Line
          x1={padL}
          y1={y(goal)}
          x2={w - padR}
          y2={y(goal)}
          stroke={colors.workout}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
      ) : null}

      {areaPath ? <Path d={areaPath} fill="url(#lineFill)" /> : null}
      {filled.length > 1 ? (
        <Path
          d={linePath}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}

      {filled.map((p) => (
        <Circle
          key={p.i}
          cx={x(p.i)}
          cy={y(p.value)}
          r={3.5}
          fill="#fff"
          stroke={color}
          strokeWidth={2}
        />
      ))}

      {data.map((d, i) => {
        // 라벨이 겹치지 않도록 일정 간격으로만 찍고, 마지막 날짜는 항상 보여 준다
        const step = Math.max(Math.ceil(data.length / 5), 1);
        const isLast = i === data.length - 1;
        const onStep = i % step === 0 && data.length - 1 - i >= step;
        if (!onStep && !isLast) return null;
        return (
          <SvgLabel
            key={`l${i}`}
            x={Math.min(x(i) - 10, w - padR - 22)}
            y={height - 6}
            text={d.label}
          />
        );
      })}
    </Svg>
  );
}

/** 날짜별 합계를 보여주는 막대 그래프 */
export function BarChart({
  data,
  width,
  height = 140,
  color = colors.meal,
  goal,
}: {
  data: { label: string; value: number }[];
  width: number;
  height?: number;
  color?: string;
  goal?: number;
}) {
  const w = Math.max(width, 80);
  const padT = 10;
  const padB = 20;
  const innerH = Math.max(height - padT - padB, 10);
  const max = Math.max(...data.map((d) => d.value), goal ?? 0, 1);
  const slot = w / Math.max(data.length, 1);
  const barW = Math.min(slot * 0.52, 26);

  return (
    <Svg width={w} height={height}>
      {goal ? (
        <Line
          x1={0}
          y1={padT + innerH - (goal / max) * innerH}
          x2={w}
          y2={padT + innerH - (goal / max) * innerH}
          stroke={colors.workout}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
      ) : null}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        return (
          <React.Fragment key={i}>
            <Rect
              x={i * slot + (slot - barW) / 2}
              y={padT + innerH - h}
              width={barW}
              height={Math.max(h, d.value > 0 ? 3 : 0)}
              rx={4}
              fill={color}
              opacity={d.value > 0 ? 1 : 0.15}
            />
            <SvgLabel
              x={i * slot + slot / 2 - 8}
              y={height - 5}
              text={d.label}
            />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

/** 목표 달성률 원형 게이지 */
export function Ring({
  progress,
  size = 104,
  stroke = 10,
  color = colors.primary,
  children,
}: {
  progress: number; // 0~1 이상
  size?: number;
  stroke?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(progress, 1));
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.line}
          strokeWidth={stroke}
          fill="none"
        />
        {p > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${c * p} ${c}`}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      <View style={[st.ringCenter, { width: size, height: size }]}>
        {children}
      </View>
    </View>
  );
}

/** 탄·단·지 비율 막대 */
export function MacroBar({
  carbs,
  protein,
  fat,
  width,
}: {
  carbs: number;
  protein: number;
  fat: number;
  width: number;
}) {
  const total = carbs + protein + fat;
  const w = Math.max(width, 0);
  if (total <= 0 || w <= 0) return null;
  const parts = [
    { v: carbs, c: '#3B82F6' },
    { v: protein, c: '#1F9D63' },
    { v: fat, c: '#F08A24' },
  ];
  let x = 0;
  return (
    <Svg width={w} height={10}>
      {parts.map((p, i) => {
        const seg = (p.v / total) * w;
        const rect = (
          <Rect key={i} x={x} y={0} width={seg} height={10} rx={5} fill={p.c} />
        );
        x += seg;
        return rect;
      })}
    </Svg>
  );
}

function SvgLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <SvgText x={x} y={y} fill={colors.sub} fontSize={10}>
      {text}
    </SvgText>
  );
}

const st = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space(4),
  },
  placeholderText: { color: colors.sub, fontSize: 13 },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

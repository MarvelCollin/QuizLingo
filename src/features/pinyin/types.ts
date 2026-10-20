export type PinyinChart = {
  initials: string[];
  finals: string[];
  cells: Map<string, string>;
  tones: Map<string, Set<number>>;
};

export type ChartGridProps = {
  chart: PinyinChart;
  tone: number;
  found: string | null;
  playing: string | null;
  onPlay: (base: string) => void;
};

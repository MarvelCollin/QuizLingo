export type PinyinChart = {
  initials: string[];
  finals: string[];
  // Syllable spelling for each initial and final pair, such as 'zhang'
  cells: Map<string, string>;
  // Tones that have a recording for each syllable
  tones: Map<string, Set<number>>;
};

export type ChartGridProps = {
  chart: PinyinChart;
  tone: number;
  found: string | null;
  playing: string | null;
  onPlay: (base: string) => void;
};

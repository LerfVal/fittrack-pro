export interface Workout {
  id: number;
  title: string;
  date: string;
  duration: string;
  exercises: number;
  volume: string;
  tag: string;
  tagColor: string;
}

export interface PR {
  exercise: string;
  weight: string;
  date: string;
}

export interface Stat {
  label: string;
  value: string;
  sub: string;
  up: boolean;
}

export interface VolumeDataPoint {
  day: string;
  volume: number;
}

export interface ProgressDataPoint {
  date: string;
  weight: number;
}

export interface TooltipPayloadItem {
  value: number;
  name: string;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

import { VolumeDataPoint, ProgressDataPoint, Workout, PR, Stat } from "@/app/types";

export const weeklyVolume: VolumeDataPoint[] = [
  { day: "Mon", volume: 12400 },
  { day: "Tue", volume: 0 },
  { day: "Wed", volume: 18750 },
  { day: "Thu", volume: 9200 },
  { day: "Fri", volume: 21300 },
  { day: "Sat", volume: 15600 },
  { day: "Sun", volume: 0 },
];

export const benchProgress: ProgressDataPoint[] = [
  { date: "Jan 1", weight: 135 },
  { date: "Jan 15", weight: 145 },
  { date: "Feb 1", weight: 150 },
  { date: "Feb 15", weight: 155 },
  { date: "Mar 1", weight: 165 },
  { date: "Mar 15", weight: 170 },
  { date: "Apr 1", weight: 185 },
];

export const recentWorkouts: Workout[] = [
  {
    id: 1,
    title: "Upper Body Strength",
    date: "Today, 7:30 AM",
    duration: "52 min",
    exercises: 6,
    volume: "21,300 lbs",
    tag: "Strength",
    tagColor: "bg-orange-500",
  },
  {
    id: 2,
    title: "Leg Day",
    date: "Yesterday, 6:15 AM",
    duration: "61 min",
    exercises: 7,
    volume: "15,600 lbs",
    tag: "Hypertrophy",
    tagColor: "bg-blue-500",
  },
  {
    id: 3,
    title: "Push Session",
    date: "Mar 7, 8:00 AM",
    duration: "48 min",
    exercises: 5,
    volume: "18,750 lbs",
    tag: "Strength",
    tagColor: "bg-orange-500",
  },
  {
    id: 4,
    title: "Pull Session",
    date: "Mar 5, 7:45 AM",
    duration: "55 min",
    exercises: 6,
    volume: "12,400 lbs",
    tag: "Hypertrophy",
    tagColor: "bg-blue-500",
  },
];

export const prs: PR[] = [
  { exercise: "Bench Press", weight: "185 lbs", date: "Apr 1" },
  { exercise: "Back Squat", weight: "275 lbs", date: "Mar 28" },
  { exercise: "Deadlift", weight: "315 lbs", date: "Mar 20" },
  { exercise: "Overhead Press", weight: "115 lbs", date: "Mar 15" },
];

export const stats: Stat[] = [
  { label: "Workouts This Month", value: "14", sub: "+3 vs last month", up: true },
  { label: "Total Volume", value: "187K", sub: "lbs lifted this month", up: true },
  { label: "Current Streak", value: "6", sub: "days in a row", up: true },
  { label: "Avg Duration", value: "54", sub: "minutes per session", up: false },
];

export const navItems: string[] = [
  "Dashboard",
  "Workouts",
  "Exercises",
  "Progress",
  "Settings",
];

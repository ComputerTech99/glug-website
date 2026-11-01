import { parse } from 'yaml';
import resourcesRaw from '../data/resources.yaml?raw';
import timelineRaw from '../data/timeline.yaml?raw';

export type Level = 'beginner' | 'intermediate' | 'advanced';
export interface ResourceTopic { topic: string; links: { title: string; url: string; level: Level; note?: string }[] }
export interface TimelineItem { year: number; text: string }

export const resources = parse(resourcesRaw) as ResourceTopic[];
export const timeline = parse(timelineRaw) as TimelineItem[];

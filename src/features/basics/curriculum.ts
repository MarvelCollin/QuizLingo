import { FINALS_STAGE } from './content/finals';
import { INITIALS_STAGE } from './content/initials';
import { RULES_STAGE } from './content/rules';
import { SENTENCES_STAGE } from './content/sentences';
import { START_STAGE } from './content/start';
import { TONES_STAGE } from './content/tones';
import { WORDS_STAGE } from './content/words';
import { WRITING_STAGE } from './content/writing';
import type { Lesson, Stage } from './types';

export const STAGES: readonly Stage[] = [
  START_STAGE,
  TONES_STAGE,
  INITIALS_STAGE,
  FINALS_STAGE,
  RULES_STAGE,
  WRITING_STAGE,
  WORDS_STAGE,
  SENTENCES_STAGE,
];

export const ALL_LESSONS: readonly Lesson[] = STAGES.flatMap((stage) => stage.lessons);

const lessonIndex = new Map(ALL_LESSONS.map((lesson) => [lesson.id, lesson]));
const stageIndex = new Map(STAGES.flatMap((stage) => stage.lessons.map((lesson) => [lesson.id, stage] as const)));

export const lessonById = (id: string) => lessonIndex.get(id);

export const stageOfLesson = (id: string) => stageIndex.get(id);

export const isCheckpoint = (lesson: Lesson) => lesson.source.kind === 'checkpoint';

export const checkpointOf = (stage: Stage) => stage.lessons[stage.lessons.length - 1];

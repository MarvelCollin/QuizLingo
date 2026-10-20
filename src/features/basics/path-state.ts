import { checkpointOf, isCheckpoint, STAGES } from './curriculum';
import type { LessonProgress, LessonState, LessonStatus, StageState } from './types';

export type PathState = {
  stages: StageState[];
  next: LessonState | null;
  lessonsDone: number;
  lessonsTotal: number;
  stagesDone: number;
  percent: number;
};

export const buildPath = (progress: LessonProgress[]): PathState => {
  const byLesson = new Map(progress.map((p) => [p.lesson, p]));
  const isPassed = (id: string) => byLesson.get(id)?.completedAt != null;

  let previousStagePassed = true;
  const stages: StageState[] = STAGES.map((stage) => {
    const isStageLocked = !previousStagePassed;
    const isStageDone = isPassed(checkpointOf(stage).id);

    const lessons = stage.lessons.map((lesson, index): LessonState => {
      const row = byLesson.get(lesson.id);
      const isCheck = isCheckpoint(lesson);
      const isUnlocked =
        !isStageLocked && (isStageDone || isCheck || index === 0 || isPassed(stage.lessons[index - 1].id));
      let status: LessonStatus = 'open';
      if (isPassed(lesson.id)) status = 'done';
      else if (!isUnlocked) status = 'locked';
      else if (row && row.attempts > 0) status = 'tried';
      return { lesson, stage, status, best: row?.best ?? 0, isCheckpoint: isCheck };
    });

    previousStagePassed = isStageDone;
    return {
      stage,
      lessons,
      doneCount: lessons.filter((l) => l.status === 'done').length,
      isDone: isStageDone,
      isLocked: isStageLocked,
    };
  });

  const current = stages.find((s) => !s.isDone);
  const next = current?.lessons.find((l) => l.status !== 'done' && l.status !== 'locked') ?? null;

  const lessonsTotal = stages.reduce((sum, s) => sum + s.lessons.length, 0);
  const lessonsDone = stages.reduce((sum, s) => sum + (s.isDone ? s.lessons.length : s.doneCount), 0);
  return {
    stages,
    next,
    lessonsDone,
    lessonsTotal,
    stagesDone: stages.filter((s) => s.isDone).length,
    percent: Math.round((lessonsDone / lessonsTotal) * 100),
  };
};

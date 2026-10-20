import type { MockAnswer, MockItem, MockPaper, SectionResult } from './mock-types';

export const isRight = (item: MockItem, answer: MockAnswer) =>
  item.kind === 'choice'
    ? answer === item.answer
    : Array.isArray(answer) && answer.map((i) => item.pieces[i]).join('') === item.target;

export const isAnswered = (answer: MockAnswer) => (Array.isArray(answer) ? answer.length > 0 : answer !== null);

export const scoreSections = (paper: MockPaper, answers: MockAnswer[][]): SectionResult[] =>
  paper.sections.map((section, s) => {
    const correct = section.items.filter((item, i) => isRight(item, answers[s][i])).length;
    const total = section.items.length;
    return { key: section.key, label: section.label, correct, total, points: total === 0 ? 0 : Math.round((correct / total) * 100) };
  });

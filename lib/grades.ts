export const PASSING_SCORE = 70;

export function calculateFinalScore(assignmentScore: number, midtermScore: number, finalExamScore: number) {
  return (assignmentScore * 0.3) + (midtermScore * 0.3) + (finalExamScore * 0.4);
}

export function getLetterGrade(score: number) {
  if (score >= 85) return "A";
  if (score >= PASSING_SCORE) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "E";
}

export function isPassing(score: number) {
  return score >= PASSING_SCORE;
}

export function isValidScore(score: number) {
  return Number.isFinite(score) && score >= 0 && score <= 100;
}

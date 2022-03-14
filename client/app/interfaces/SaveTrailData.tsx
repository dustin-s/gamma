export interface SaveTrailData {
  name: string;
  description: string;
  difficulty: "easy" | "moderate" | "hard";
  isClosed: boolean;
  cancel: boolean;
}

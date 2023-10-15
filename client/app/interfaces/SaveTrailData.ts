export interface SaveTrailData {
  name: string;
  description: string;
  difficulty: "easy" | "moderate" | "hard";
  isClosed: boolean;
}

export type SubmitTrailData = SaveTrailData | "Cancel" | "Closed" | null;

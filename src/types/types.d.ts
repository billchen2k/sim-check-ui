export type SimilarityLevel = 'plagiarism' | 'suspicious' | 'original' | 'unknown';

export interface ISimResultItem {
  hash: number;
  source: string;
  source_content: string;
  source_submitter: string;
  target: string;
  target_content: string;
  target_submitter: string;
  similarity: number;
  plagiarism_nodes: number;
  total_nodes: number;
  conclusion?: {
    level: SimilarityLevel;
    comments?: string;
  }
}

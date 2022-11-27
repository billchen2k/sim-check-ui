import {ISimResultItem, SimilarityLevel} from '../types/types';

export class SimManager {
  public simResults: ISimResultItem[] = [];
  public hashMap: { [key: string]: ISimResultItem } = {};
  public loaded: boolean = false;

  constructor() {

  }

  private getLocalStorageKey(hash: string | number): string {
    return `CONCL_${hash}`;
  }

  public loadSimResultsFromJson(json: string) {
    this.simResults = JSON.parse(json);
    if (!this.simResults.length) {
      throw new Error('No results found in JSON');
    }
    this.simResults.forEach((simResult) => {
      ['hash', 'source', 'source_content', 'target', 'target_content', 'source_submitter', 'target_submitter'].forEach((key) => {
        if (!simResult.hasOwnProperty(key)) {
          throw new Error(`Invalid report json. Sim result missing key: ${key}`);
        }
      });
      const storedConclusion = localStorage.getItem(this.getLocalStorageKey(String(simResult.hash)));
      if (storedConclusion) {
        try {
          simResult.conclusion = JSON.parse(storedConclusion);
        } catch (e) {
          console.warn(`Error parsing stored conclusion for ${simResult.hash}: ${e}`);
        }
      }
      this.hashMap[simResult.hash] = simResult;
    });
    this.loaded = true;
  }

  public setConclusion(hash: string, level?: SimilarityLevel, comments?: string) {
    const simResult = this.hashMap[hash];
    simResult.conclusion = {
      level: level || 'unknown', comments: comments || '',
    };
    localStorage.setItem(this.getLocalStorageKey(hash), JSON.stringify(simResult.conclusion));
  }

  public reselect() {
    this.loaded = false;
    this.simResults = [];
    this.hashMap = {};
  }

  public resetAll() {
    this.simResults.forEach((one) => {
      one.conclusion = {
        level: 'unknown',
        comments: '',
      };
      localStorage.removeItem(this.getLocalStorageKey(one.hash));
    });
  }

  public hashExists(hash: string): boolean {
    return Boolean(this.hashMap.hasOwnProperty(hash));
  }

  public exportResults() {
    let outputStr = 'submitter,plagiarism_count,suspicious_count\n';
    const results: Record<string, Partial<Record<SimilarityLevel, number>>> = {};
    this.simResults.forEach((one) => {
      if (['suspicious', 'plagiarism'].includes(one.conclusion?.level || 'unknown')) {
        const level = one.conclusion?.level || 'unknown';
        if (!results[one.source_submitter]) {
          results[one.source_submitter] = {
            plagiarism: 0,
            suspicious: 0,
          };
        }
        if (!results[one.target_submitter]) {
          results[one.target_submitter] = {
            plagiarism: 0,
            suspicious: 0,
          };
        }
        results[one.source_submitter][level] = (results[one.source_submitter][level] || 0) + 1;
        results[one.target_submitter][level] = (results[one.target_submitter][level] || 0) + 1;
      }
    });
    Object.keys(results).forEach((submitter) => {
      outputStr += `${submitter},${results[submitter].plagiarism},${results[submitter].suspicious}\n`;
    });
    // Export csv file
    const fileName = 'similarity_results.csv';
    const blob = new Blob([outputStr], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

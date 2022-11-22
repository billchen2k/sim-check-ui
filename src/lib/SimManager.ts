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

  }
}

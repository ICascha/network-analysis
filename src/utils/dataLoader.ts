import type { ModelResults, JobNameLookup, ModelResult, TransformedResult } from '../types/results';
import { inflate } from 'pako';

export class DataLoader {
  private static instance: DataLoader;
  private jobNameLookup: JobNameLookup = {};
  private results: ModelResults = {};
  private initialized = false;

  private constructor() {}

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  private async fetchAndDecompress(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    try {
      // Attempt to decompress as gzip
      const decompressed = inflate(uint8Array, { to: 'string' });
      return JSON.parse(decompressed);
    } catch (error) {
      // If decompression fails, assume it's not compressed
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(uint8Array);
      return JSON.parse(text);
    }
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const basePath = import.meta.env.BASE_URL;
      
      // Try gzipped files first
      try {
        const [results, lookup] = await Promise.all([
          this.fetchAndDecompress(`${basePath}data/model-results.json.gz`),
          this.fetchAndDecompress(`${basePath}data/job-names.json.gz`)
        ]);

        this.results = results;
        this.jobNameLookup = lookup;
        this.initialized = true;
        return;
      } catch (error) {
        console.warn('Gzipped files not available or failed to decompress, falling back to uncompressed', error);
      }

      // Fallback to uncompressed files
      const [results, lookup] = await Promise.all([
        this.fetchAndDecompress(`${basePath}data/model-results.json`),
        this.fetchAndDecompress(`${basePath}data/job-names.json`)
      ]);

      this.results = results;
      this.jobNameLookup = lookup;
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load data:', error);
      throw error;
    }
  }

  getResultForSettings(settingsKey: string): ModelResult | null {
    if (!this.initialized) {
      throw new Error('DataLoader not initialized');
    }
    return this.results[settingsKey] || null;
  }

  transformResult(result: ModelResult): TransformedResult {
    return {
      remainingShortages: result.remainingShortages.map(shortage => ({
        jobName: this.jobNameLookup[shortage.jobId],
        shortage: shortage.shortage
      })),
      topTransitions: result.topTransitions.map(transition => ({
        sourceJob: this.jobNameLookup[transition.sourceJobId],
        targetJob: this.jobNameLookup[transition.targetJobId],
        amount: transition.amount
      })),
      workforceChanges: Object.entries(result.workforceChanges).reduce(
        (acc, [jobId, metrics]) => ({
          ...acc,
          [this.jobNameLookup[Number(jobId)]]: metrics
        }),
        {}
      ),
      addedValueChangePercent: result.addedValueChangePercent
    };
  }
}
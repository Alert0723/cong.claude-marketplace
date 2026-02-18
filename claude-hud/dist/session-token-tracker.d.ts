import type { StdinData } from './types.js';
export type SessionTokenTrackerDeps = {
    homeDir: () => string;
    now: () => number;
};
export interface SessionTokenDeltas {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    cacheTotalTokens: number;
    cacheHitRate: number | null;
    isNewSession: boolean;
}
export declare function getSessionTokenDeltas(stdin: StdinData, overrides?: Partial<SessionTokenTrackerDeps>): SessionTokenDeltas | null;
//# sourceMappingURL=session-token-tracker.d.ts.map
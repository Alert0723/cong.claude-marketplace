import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const defaultDeps = {
    homeDir: () => os.homedir(),
    now: () => Date.now(),
};
function getCachePath(homeDir) {
    return path.join(homeDir, '.claude', 'plugins', 'claude-hud', '.session-tokens.json');
}
function readCache(homeDir) {
    try {
        const cachePath = getCachePath(homeDir);
        if (!fs.existsSync(cachePath))
            return null;
        const content = fs.readFileSync(cachePath, 'utf8');
        const parsed = JSON.parse(content);
        if (typeof parsed.inputTokens !== 'number' ||
            typeof parsed.outputTokens !== 'number' ||
            typeof parsed.cacheCreationTokens !== 'number' ||
            typeof parsed.cacheReadTokens !== 'number' ||
            typeof parsed.timestamp !== 'number' ||
            typeof parsed.sessionStartTime !== 'number') {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
function writeCache(homeDir, cache) {
    try {
        const cachePath = getCachePath(homeDir);
        const cacheDir = path.dirname(cachePath);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        fs.writeFileSync(cachePath, JSON.stringify(cache), 'utf8');
    }
    catch {
        // Ignore cache write failures
    }
}
export function getSessionTokenDeltas(stdin, overrides = {}) {
    const usage = stdin.context_window?.current_usage;
    if (!usage) {
        return null;
    }
    const currentInputTokens = usage.input_tokens ?? 0;
    const currentOutputTokens = usage.output_tokens ?? 0;
    const currentCacheCreationTokens = usage.cache_creation_input_tokens ?? 0;
    const currentCacheReadTokens = usage.cache_read_input_tokens ?? 0;
    const deps = { ...defaultDeps, ...overrides };
    const now = deps.now();
    const homeDir = deps.homeDir();
    const previous = readCache(homeDir);
    let isNewSession = false;
    let baseline;
    if (!previous) {
        // First time, start new session
        isNewSession = true;
        baseline = {
            inputTokens: currentInputTokens,
            outputTokens: currentOutputTokens,
            cacheCreationTokens: currentCacheCreationTokens,
            cacheReadTokens: currentCacheReadTokens,
            timestamp: now,
            sessionStartTime: now,
        };
    }
    else {
        // Check if session expired (too old)
        const timeSinceLastUpdate = now - previous.timestamp;
        if (timeSinceLastUpdate > SESSION_TIMEOUT_MS) {
            // Session expired, start new session
            isNewSession = true;
            baseline = {
                inputTokens: currentInputTokens,
                outputTokens: currentOutputTokens,
                cacheCreationTokens: currentCacheCreationTokens,
                cacheReadTokens: currentCacheReadTokens,
                timestamp: now,
                sessionStartTime: now,
            };
        }
        else {
            // Check if token counts decreased (likely a new session/reset)
            const tokensDecreased = currentInputTokens < previous.inputTokens ||
                currentOutputTokens < previous.outputTokens ||
                currentCacheCreationTokens < previous.cacheCreationTokens ||
                currentCacheReadTokens < previous.cacheReadTokens;
            if (tokensDecreased) {
                // Token counts decreased, start new session
                isNewSession = true;
                baseline = {
                    inputTokens: currentInputTokens,
                    outputTokens: currentOutputTokens,
                    cacheCreationTokens: currentCacheCreationTokens,
                    cacheReadTokens: currentCacheReadTokens,
                    timestamp: now,
                    sessionStartTime: now,
                };
            }
            else {
                // Continue existing session
                baseline = {
                    ...previous,
                    timestamp: now,
                };
            }
        }
    }
    // Write updated cache
    writeCache(homeDir, baseline);
    // Calculate deltas
    const inputDelta = currentInputTokens - baseline.inputTokens;
    const outputDelta = currentOutputTokens - baseline.outputTokens;
    const cacheCreationDelta = currentCacheCreationTokens - baseline.cacheCreationTokens;
    const cacheReadDelta = currentCacheReadTokens - baseline.cacheReadTokens;
    const cacheTotalDelta = cacheCreationDelta + cacheReadDelta;
    // Calculate cache hit rate for the session
    let cacheHitRate = null;
    if (cacheTotalDelta > 0) {
        cacheHitRate = Math.round((cacheReadDelta / cacheTotalDelta) * 100);
    }
    return {
        inputTokens: inputDelta,
        outputTokens: outputDelta,
        cacheCreationTokens: cacheCreationDelta,
        cacheReadTokens: cacheReadDelta,
        cacheTotalTokens: cacheTotalDelta,
        cacheHitRate,
        isNewSession,
    };
}
//# sourceMappingURL=session-token-tracker.js.map
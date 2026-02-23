import { dim } from '../colors.js';
export function renderTokenDetailsLine(ctx) {
    const display = ctx.config?.display;
    if (display?.showTokenDetails !== true) {
        return null;
    }
    const usage = ctx.stdin.context_window?.current_usage;
    if (!usage) {
        return null;
    }
    const inputTokens = usage.input_tokens ?? 0;
    const outputTokens = usage.output_tokens ?? 0;
    const cacheCreationTokens = usage.cache_creation_input_tokens ?? 0;
    const cacheReadTokens = usage.cache_read_input_tokens ?? 0;
    const cacheTotalTokens = cacheCreationTokens + cacheReadTokens;
    // Calculate cache hit rate if there are cache tokens
    let cacheHitRate = null;
    if (cacheTotalTokens > 0) {
        cacheHitRate = Math.round((cacheReadTokens / cacheTotalTokens) * 100);
    }
    const label = dim('Tokens');
    const parts = [];
    if (inputTokens > 0) {
        parts.push(`in: ${formatTokens(inputTokens)}`);
    }
    if (outputTokens > 0) {
        parts.push(`out: ${formatTokens(outputTokens)}`);
    }
    if (cacheTotalTokens > 0) {
        parts.push(`cache: ${formatTokens(cacheTotalTokens)}`);
        if (cacheHitRate !== null) {
            parts.push(`hit: ${cacheHitRate}%`);
        }
    }
    if (parts.length === 0) {
        return null;
    }
    return `${label} ${parts.join(', ')}`;
}
function formatTokens(n) {
    if (n >= 1000000) {
        return `${(n / 1000000).toFixed(1)}M`;
    }
    if (n >= 1000) {
        return `${(n / 1000).toFixed(0)}k`;
    }
    return n.toString();
}
//# sourceMappingURL=token-details.js.map
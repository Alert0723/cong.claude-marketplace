import { dim } from '../colors.js';
import { getSessionTokenDeltas } from '../../session-token-tracker.js';
export function renderTokenDetailsLine(ctx) {
    const display = ctx.config?.display;
    if (display?.showTokenDetails !== true) {
        return null;
    }
    const deltas = getSessionTokenDeltas(ctx.stdin);
    if (!deltas) {
        return null;
    }
    const { inputTokens, outputTokens, cacheTotalTokens, cacheHitRate } = deltas;
    const label = dim('Session tokens');
    const parts = [];
    if (inputTokens > 0) {
        parts.push(`in: +${formatTokens(inputTokens)}`);
    }
    if (outputTokens > 0) {
        parts.push(`out: +${formatTokens(outputTokens)}`);
    }
    if (cacheTotalTokens > 0) {
        parts.push(`cache: +${formatTokens(cacheTotalTokens)}`);
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
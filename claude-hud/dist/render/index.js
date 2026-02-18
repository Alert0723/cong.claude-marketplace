import { renderSessionLine } from './session-line.js';
import { renderToolsLine } from './tools-line.js';
import { renderAgentsLine } from './agents-line.js';
import { renderTodosLine } from './todos-line.js';
import { renderIdentityLine, renderProjectLine, renderEnvironmentLine, renderUsageLine, renderTokenDetailsLine, } from './lines/index.js';
import { dim, RESET } from './colors.js';
function stripAnsi(str) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}
function visualLength(str) {
    return stripAnsi(str).length;
}
function makeSeparator(length) {
    return dim('─'.repeat(Math.max(length, 20)));
}
function collectActivityLines(ctx) {
    const activityLines = [];
    const display = ctx.config?.display;
    if (display?.showTools !== false) {
        const toolsLine = renderToolsLine(ctx);
        if (toolsLine) {
            activityLines.push(toolsLine);
        }
    }
    if (display?.showAgents !== false) {
        const agentsLine = renderAgentsLine(ctx);
        if (agentsLine) {
            activityLines.push(agentsLine);
        }
    }
    if (display?.showTodos !== false) {
        const todosLine = renderTodosLine(ctx);
        if (todosLine) {
            activityLines.push(todosLine);
        }
    }
    return activityLines;
}
function renderCompact(ctx) {
    const lines = [];
    const sessionLine = renderSessionLine(ctx);
    if (sessionLine) {
        lines.push(sessionLine);
    }
    return lines;
}
function renderExpanded(ctx) {
    const lines = [];
    const projectLine = renderProjectLine(ctx);
    if (projectLine) {
        lines.push(projectLine);
    }
    const identityLine = renderIdentityLine(ctx);
    const usageLine = renderUsageLine(ctx);
    if (identityLine && usageLine) {
        lines.push(`${identityLine} \u2502 ${usageLine}`);
    }
    else if (identityLine) {
        lines.push(identityLine);
    }
    const tokenDetailsLine = renderTokenDetailsLine(ctx);
    if (tokenDetailsLine) {
        lines.push(tokenDetailsLine);
    }
    const environmentLine = renderEnvironmentLine(ctx);
    if (environmentLine) {
        lines.push(environmentLine);
    }
    return lines;
}
export function render(ctx) {
    const lineLayout = ctx.config?.lineLayout ?? 'expanded';
    const showSeparators = ctx.config?.showSeparators ?? false;
    const headerLines = lineLayout === 'expanded'
        ? renderExpanded(ctx)
        : renderCompact(ctx);
    const activityLines = collectActivityLines(ctx);
    const lines = [...headerLines];
    if (showSeparators && activityLines.length > 0) {
        const maxWidth = Math.max(...headerLines.map(visualLength), 20);
        lines.push(makeSeparator(maxWidth));
    }
    lines.push(...activityLines);
    // 调试输出
    if (process.env.DEBUG?.includes('claude-hud')) {
        console.error('[claude-hud:render] lines:', JSON.stringify(lines));
        console.error('[claude-hud:render] headerLines:', JSON.stringify(headerLines));
        console.error('[claude-hud:render] activityLines:', JSON.stringify(activityLines));
    }
    for (const line of lines) {
        // Skip lines that are effectively empty or single characters
        if (visualLength(line) < 2) {
            continue;
        }
        // Use normal space on Windows to avoid display issues
        const spaceChar = process.platform === 'win32' ? ' ' : '\u00A0';
        const outputLine = `${RESET}${line.replace(/ /g, spaceChar)}`;
        console.log(outputLine);
    }
}
//# sourceMappingURL=index.js.map
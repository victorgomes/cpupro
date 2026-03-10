/* eslint-env node */
module.exports = {
    defaultFilename,
    parsePartialJson
};

function defaultFilename(ext) {
    const name = new Date().toISOString()
        .replace(/\..+$/, '')
        .replace(/[^\dT ]/g, '')
        .replace(/\D/g, '-');

    return `cpupro-${name}.${ext}`;
}

function parsePartialJson(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        // Fallback for incomplete JSON
    }

    let isString = false;
    let isEscape = false;
    const stack = [];
    let lastValidSplit = -1;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (isString) {
            if (isEscape) {
                isEscape = false;
            } else if (char === '\\') {
                isEscape = true;
            } else if (char === '"') {
                isString = false;
            }
        } else {
            if (char === '"') {
                isString = true;
            } else if (char === '{' || char === '[') {
                stack.push({ char: char === '{' ? '}' : ']', index: i });
                lastValidSplit = i;
            } else if (char === '}' || char === ']') {
                if (stack.length === 0 || stack[stack.length - 1].char !== char) {
                    break;
                }
                stack.pop();
                lastValidSplit = i;
            } else if (char === ',') {
                lastValidSplit = i;
            }
        }
    }

    if (lastValidSplit === -1) {
        throw new Error('Cannot parse partial JSON');
    }

    let partial = str.slice(0, lastValidSplit + 1);
    
    // Trim trailing comma
    partial = partial.replace(/,$/, '');
    
    // Add missing closing brackets
    const closingBrackets = stack
        .filter(s => s.index <= lastValidSplit)
        .map(s => s.char)
        .reverse()
        .join('');

    return JSON.parse(partial + closingBrackets);
}

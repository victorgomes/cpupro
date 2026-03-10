function findNewline(str: string, offset: number) {
    for (; offset < str.length; offset++) {
        const code = str.charCodeAt(offset);
        if (code === 10 /* \n */ || code === 13 /* \r */) {
            return offset;
        }
    }

    return -1;
}

export async function* consumeV8logStream(iterator: AsyncIterableIterator<Uint8Array> | AsyncIterableIterator<string>) {
    const textDecoder = new TextDecoder();
    let tail = '';
    let lineStartOffset = 0;
    let lineEndOffset = -1;
    // In fact, V8 always writes the V8 log with `\n` newlines, even on Windows.
    // This logic to handle `\r\n` (and `\r`) newlines is implemented as an extra safeguard
    // to ensure everything works. Falling back to slow newline search makes parsing
    // about 1.5x slower. However, this may never happen. Detection for `\r`-like newlines
    // is implemented at a very low-impact level. So let’s give it a try. It probably should be
    // removed in the future as redundant. Let’s see.
    let slowNewlineSearch = false;
    let maybeCR = true;
    let skipUntilNewline = false;
    const MAX_LINE_LENGTH = 16 * 1024 * 1024; // 16 MB max line length to avoid RangeError JS string limits

    for await (const chunk of iterator) {
        const lines: string[] = [];
        const chunkText = typeof chunk === 'string' ? chunk : textDecoder.decode(chunk, {stream: true});

        lineStartOffset = 0;

        if (maybeCR && !slowNewlineSearch) {
            slowNewlineSearch = typeof chunk === 'string' ? chunk.includes('\r') : chunk.includes(13);
        }

        do {
            lineEndOffset = slowNewlineSearch
                ? findNewline(chunkText, lineStartOffset)
                : chunkText.indexOf('\n', lineStartOffset);

            if (lineEndOffset === -1) {
                break;
            }

            if (skipUntilNewline) {
                lines.push(tail);
                tail = '';
                skipUntilNewline = false;
            } else if (tail !== '') {
                const restOfLine = chunkText.slice(lineStartOffset, lineEndOffset);
                if (tail.length + restOfLine.length > MAX_LINE_LENGTH) {
                    lines.push(
                        tail + restOfLine.slice(0, Math.max(0, MAX_LINE_LENGTH - tail.length)) + '...[TRUNCATED]'
                    );
                } else {
                    lines.push(tail + restOfLine);
                }
                tail = '';
            } else if (lineStartOffset < lineEndOffset) {
                const slice = chunkText.slice(lineStartOffset, lineEndOffset);
                if (slice.length > MAX_LINE_LENGTH) {
                    lines.push(slice.slice(0, MAX_LINE_LENGTH) + '...[TRUNCATED]');
                } else {
                    lines.push(slice);
                }
            }

            lineStartOffset = lineEndOffset + 1;
            maybeCR = false;
        } while (true);

        const partialLine = chunkText.slice(lineStartOffset);
        if (!skipUntilNewline) {
            if (tail.length + partialLine.length > MAX_LINE_LENGTH) {
                tail += partialLine.slice(0, Math.max(0, MAX_LINE_LENGTH - tail.length)) + '...[TRUNCATED]';
                skipUntilNewline = true;
            } else {
                tail += partialLine;
            }
        }
        yield lines;
    }

    // process last line
    if (tail !== '') {
        yield [tail];
        tail = '';
    }
}

export async function* consumeV8logStreamLineByLine(
    iterator: AsyncIterableIterator<Uint8Array> | AsyncIterableIterator<string>
) {
    for await (const lines of consumeV8logStream(iterator)) {
        for (const line of lines) {
            yield line;
        }
    }
}

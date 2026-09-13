export interface WordToken {
    type: 'added' | 'removed' | 'unchanged';
    text: string;
}

// Word-level LCS diff algorithm for inline highlighting
export function computeWordTokens(oldText: string, newText: string): WordToken[] {
    const oldWords = oldText.match(/\S+|\s+/g) || [];
    const newWords = newText.match(/\S+|\s+/g) || [];

    const n = oldWords.length;
    const m = newWords.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (oldWords[i - 1] === newWords[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const tokens: WordToken[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
            tokens.unshift({ type: 'unchanged', text: newWords[j - 1] });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            tokens.unshift({ type: 'added', text: newWords[j - 1] });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            tokens.unshift({ type: 'removed', text: oldWords[i - 1] });
            i--;
        }
    }

    return tokens;
}

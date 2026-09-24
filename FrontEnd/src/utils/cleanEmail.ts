export function cleanEmail(email?: string | null): string {
    if (!email) return '';
    return email
        .replace(/^archived_\d*_?/i, '')
        .replace(/\.202\d(\.\d+)?(?=@)/gi, '')
        .replace(/\.(past|archived)(?=@)/gi, '');
}

export default cleanEmail;

export function formatName(name: string) {
    const [firstName, ...lastName] = name.split(' ');

    return `${firstName[0]}. ${lastName.join(' ')}`;
}

export default formatName;
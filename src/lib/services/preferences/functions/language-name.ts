export function languageName(language: string): string {
    try {
        const name = new Intl.DisplayNames([language], { type: 'language' }).of(language);

        return name ? `${name.charAt(0).toLocaleUpperCase(language)}${name.slice(1)}` : language;
    } catch {
        return language;
    }
}

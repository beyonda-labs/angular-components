import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DateFormatService {
    static readonly DEFAULT_FORMAT = 'YYYY-MM-DD';

    private readonly dateFormatTokenPattern = /(YYYY|MM|DD)/gu;

    formatDate(value: Date | null, format = DateFormatService.DEFAULT_FORMAT): string | null {
        if (!value) {
            return null;
        }

        const replacements: Record<string, string> = {
            YYYY: `${value.getFullYear()}`,
            MM: `${value.getMonth() + 1}`.padStart(2, '0'),
            DD: `${value.getDate()}`.padStart(2, '0')
        };

        return format.replaceAll(this.dateFormatTokenPattern, token => replacements[token] ?? token);
    }

    parseDate(value?: string | null, format = DateFormatService.DEFAULT_FORMAT): Date | null {
        if (!value) {
            return null;
        }

        const tokens = [...format.matchAll(this.dateFormatTokenPattern)];

        if (tokens.length === 0) {
            return null;
        }

        let lastIndex = 0;
        let pattern = '^';

        for (const match of tokens) {
            const token = match[0];
            const index = match.index ?? 0;

            pattern += this.escapeRegExp(format.slice(lastIndex, index));
            pattern += token === 'YYYY' ? '(\\d{4})' : '(\\d{2})';
            lastIndex = index + token.length;
        }

        pattern += `${this.escapeRegExp(format.slice(lastIndex))}$`;

        const matcher = new RegExp(pattern, 'u');
        const matches = matcher.exec(value);

        if (!matches) {
            return null;
        }

        let year = 0;
        let month = 0;
        let day = 0;

        tokens.forEach((tokenMatch, index) => {
            const token = tokenMatch[0];
            const numericValue = Number(matches[index + 1]);

            if (token === 'YYYY') {
                year = numericValue;
            }

            if (token === 'MM') {
                month = numericValue;
            }

            if (token === 'DD') {
                day = numericValue;
            }
        });

        if (!year || !month || !day) {
            return null;
        }

        const parsedDate = new Date(year, month - 1, day);

        if (parsedDate.getFullYear() !== year || parsedDate.getMonth() !== month - 1 || parsedDate.getDate() !== day) {
            return null;
        }

        return parsedDate;
    }

    private escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
    }
}

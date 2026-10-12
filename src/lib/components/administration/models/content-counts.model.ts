export type ContentTranslate = (key: string, parameters?: Record<string, unknown>) => string;

export interface ContentCountOptions {
    contentLabels: Readonly<Record<string, string>>;
    countKey: string;
}

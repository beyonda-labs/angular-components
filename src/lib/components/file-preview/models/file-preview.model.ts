export enum FilePreviewType {
    Image = 'image',
    Pdf = 'pdf'
}

export type FilePreviewContent = Blob | string;

export class FilePreviewConfig {
    content: FilePreviewContent;
    title: string;
    type: FilePreviewType;

    alt?: string;
    fileName?: string;

    constructor({ alt, content, fileName, title, type }: FilePreviewConfigParameters) {
        this.alt = alt;
        this.content = content;
        this.fileName = fileName;
        this.title = title;
        this.type = type;
    }
}

export interface FilePreviewConfigParameters {
    content: FilePreviewContent;
    title: string;
    type: FilePreviewType;

    alt?: string;
    fileName?: string;
}

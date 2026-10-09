export interface AccountPasswordUpdate {
    currentPassword: string;
    password: string;
    password2: string;
}

export interface AccountProfile {
    email: string;
    hasPassword: boolean;
    id: string;
    roles: string[];

    language?: string;
    name?: string;
    surname?: string;
    theme?: string;
}

export interface AccountProfileUpdate {
    language?: string;
    name?: string;
    surname?: string;
    theme?: string;
}

export interface AccountSession {
    accessToken: string;
}

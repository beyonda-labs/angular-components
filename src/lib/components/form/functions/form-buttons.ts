import { ButtonType } from '../../../internal/button/models/button-config.model';
import { FormButton } from '../models/form.model';

export function noop(): void {}

export function submitType({ isDanger }: Pick<FormButton, 'isDanger'>): ButtonType {
    return isDanger ? ButtonType.Danger : ButtonType.Primary;
}

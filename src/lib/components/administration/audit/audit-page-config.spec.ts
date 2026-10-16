import { signal } from '@angular/core';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';

import { PageActionScope, PageActionZone } from '../../page/models/page-action.model';
import { PageColumnContext } from '../../page/models/page-table.model';
import { SearchField, SearchFieldOptionsResult, SearchFieldType } from '../../search/models/search.model';
import { buildAuditPageConfig } from './audit-page-config';
import { AuditConfig, AuditEventRow, AuditPageConfigOptions } from './models/audit.model';

const BROWSING: PageColumnContext = { isSearching: false };

describe('buildAuditPageConfig', () => {
    const organizations = [
        { id: 'o1', name: 'Acme' },
        { id: 'o2', name: 'Globex' }
    ];
    const event: AuditEventRow = {
        action: 'sign-in',
        actions: ['view'],
        entity: 'auth',
        entityId: null,
        entityName: null,
        id: 'e1',
        ip: null,
        occurredAt: 0,
        organizationId: null,
        requestId: null,
        userEmail: null,
        userId: null,
        userName: null
    };

    function build(overrides: Partial<AuditPageConfigOptions> = {}): ReturnType<typeof buildAuditPageConfig> {
        return buildAuditPageConfig({
            config: new AuditConfig({
                actionLabels: { publish: 'my-app.audit.verbs.publish' },
                baseUrl: '/logs',
                entityLabels: { templates: 'my-app.audit.entities.templates' },
                prefix: 'my-app.logs',
                storageKey: 'logs'
            }),
            hasSeveralOrganizations: signal(false),
            isOrganizationShown: false,
            loadRow: () => [],
            onDataLoaded: jest.fn(),
            onExport: jest.fn(),
            onReady: jest.fn(),
            onView: jest.fn(),
            organizations: [],
            searchUsers: jest.fn(() => of<SearchFieldOptionsResult>({ hasMore: false, options: [] })),
            ...overrides
        });
    }

    function shownKeys(config: ReturnType<typeof buildAuditPageConfig>): string[] {
        const { columns = [], isColumnShown } = config.tableConfig ?? {};

        return columns.filter(column => isColumnShown?.(column, BROWSING) ?? true).map(({ key }) => key);
    }

    function searchFields(config = build()): SearchField[] {
        return config.tableConfig?.search?.fields ?? [];
    }

    it('lists the events of the address of the config, newest first, remembering the hidden columns', () => {
        const config = build();

        expect(config.baseUrl).toBe('/logs');
        expect(config.prefix).toBe('my-app.logs');
        expect(config.headerConfig?.title).toBe('my-app.logs.title');
        expect(config.tableConfig?.order).toEqual({ direction: 'desc', field: 'occurredAt' });
        expect(config.tableConfig?.storageKey).toBe('logs');
        expect(config.tableConfig?.height).toBeUndefined();
    });

    it('gives the table the height of the config, when it has one', () => {
        const config = build({ config: new AuditConfig({ height: '24rem' }) });

        expect(config.tableConfig?.height).toBe('24rem');
    });

    it('declares the time, the user, the action, the row and the IP, sortable as the server sorts them', () => {
        const columns = build().tableConfig?.columns ?? [];

        expect(
            columns.map(({ isHideable, isSortable, key, sortField }) => [key, sortField, isSortable, isHideable])
        ).toEqual([
            ['occurredAt', 'occurredAt', true, false],
            ['user', 'userName', true, true],
            ['action', 'action', false, true],
            ['entityName', 'entityName', true, true],
            ['ip', 'ip', true, true]
        ]);
    });

    it('adds the organization last when it is shown, sorted by its name', () => {
        const columns = build({ isOrganizationShown: true }).tableConfig?.columns ?? [];

        expect(columns.at(-1)).toMatchObject({ isSortable: true, key: 'organization', sortField: 'organizationName' });
    });

    it('shows the organization only while the events listed span several organizations', () => {
        const hasSeveralOrganizations = signal(false);
        const config = build({ hasSeveralOrganizations, isOrganizationShown: true });

        expect(shownKeys(config)).not.toContain('organization');

        hasSeveralOrganizations.set(true);

        expect(shownKeys(config)).toEqual(['occurredAt', 'user', 'action', 'entityName', 'ip', 'organization']);
    });

    it('hands what each load answers to the page', () => {
        const onDataLoaded = jest.fn();
        const response = { globalActions: [], results: [event] };

        build({ onDataLoaded }).onDataLoaded?.(response);

        expect(onDataLoaded).toHaveBeenCalledWith(response);
    });

    it('views the selected event from the header with the tooltip of the page', () => {
        const onView = jest.fn();
        const [view] = build({ onView }).headerConfig?.actions ?? [];

        view.action?.([event]);

        expect(view.key).toBe('view');
        expect(view.scope).toBe(PageActionScope.Single);
        expect(view.tooltip).toBe('my-app.logs.actions.view.tooltip');
        expect(onView).toHaveBeenCalledWith(event);
    });

    it('offers to export from the right of the header, as a global action the backend lists', () => {
        const onExport = jest.fn();
        const actions = build({ onExport }).headerConfig?.actions ?? [];
        const exporting = actions[1];

        exporting.action?.([]);

        expect(actions.map(({ key }) => key)).toEqual(['view', 'export']);
        expect(exporting).toMatchObject({
            icon: faDownload,
            scope: PageActionScope.Global,
            zone: PageActionZone.Right
        });
        expect(onExport).toHaveBeenCalled();
    });

    it('searches the text of the events and filters them by date, user, entity and action', () => {
        const search = build().tableConfig?.search;

        expect(search?.mainField).toBe('text');
        expect(search?.textField).toBe('text');
        expect(searchFields().map(({ key, operators, type }) => [key, type, operators])).toEqual([
            ['text', SearchFieldType.Text, undefined],
            ['from', SearchFieldType.Date, ['greaterThanOrEquals']],
            ['to', SearchFieldType.Date, ['lessThanOrEquals']],
            ['userId', SearchFieldType.Autocomplete, ['equals']],
            ['entity', SearchFieldType.Select, ['equals']],
            ['action', SearchFieldType.Select, ['equals']]
        ]);
    });

    it('suggests the users the server finds for the text typed', () => {
        const searchUsers = jest.fn(() => of<SearchFieldOptionsResult>({ hasMore: false, options: [] }));
        const user = searchFields(build({ searchUsers })).find(({ key }) => key === 'userId');

        user?.searchOptions?.('ada').subscribe();

        expect(searchUsers).toHaveBeenCalledWith('ada');
    });

    it('offers the entities and the verbs of the app among those of the library', () => {
        const [entity, action] = ['entity', 'action'].map(key => searchFields().find(field => field.key === key));

        expect(entity?.options?.[0]).toEqual({ label: 'my-app.audit.entities.templates', value: 'templates' });
        expect(entity?.options?.map(({ value }) => value)).toContain('users');
        expect(action?.options?.at(-1)).toEqual({ label: 'my-app.audit.verbs.publish', value: 'publish' });
        expect(action?.options?.map(({ value }) => value)).toContain('sign-in');
    });

    it('filters by organization, with equals, when there are two organizations or more', () => {
        const organization = searchFields(build({ organizations })).at(-1);

        expect(organization).toMatchObject({
            key: 'organizationId',
            operators: ['equals'],
            options: [
                { label: 'Acme', value: 'o1' },
                { label: 'Globex', value: 'o2' }
            ]
        });
        expect(searchFields(build({ organizations: [organizations[0]] })).map(({ key }) => key)).not.toContain(
            'organizationId'
        );
    });
});

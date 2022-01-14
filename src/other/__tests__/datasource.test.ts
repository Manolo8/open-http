import { InMemoryDatasourceProvider } from '../in-memory-datasource-provider';
import { Datasource } from '../datasource';

const source = new InMemoryDatasourceProvider([
    { id: 1, userName: 'Elfo' },
    { id: 2, userName: 'Fernando' },
    { id: 3, userName: 'Chato' },
    { id: 4, userName: 'Gisele' },
    { id: 5, userName: 'Amanda' },
    { id: 6, userName: 'Beatriz' },
    { id: 7, userName: 'Daniela' },
    { id: 8, userName: 'Helena' },
]);

const provider = source.toProvider();

const datasource = new Datasource(provider);

it('should bring correclty result', async () => {
    datasource.setSize(4);
    datasource.setPage(1);

    datasource.refresh();

    await datasource.refreshDone();

    const items = datasource.items.current();

    expect(items.length).toBe(4);
    expect(items[0].id).toBe(1);
    expect(items[3].id).toBe(4);
});

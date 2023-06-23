import { Datasource } from '../datasource';
import { InMemoryDatasourceProvider } from '../in-memory-datasource-provider';

function createDatasource() {
    const source = new InMemoryDatasourceProvider([
        { id: 1, userName: 'Elfo', male: true },
        { id: 2, userName: 'Fernando', male: true },
        { id: 3, userName: 'Chato', male: true },
        { id: 4, userName: 'Gisele', male: false },
        { id: 5, userName: 'Amanda', male: false },
        { id: 6, userName: 'Beatriz', male: false },
        { id: 7, userName: 'Daniela', male: false },
        { id: 8, userName: 'Helena', male: false },
    ]);

    const provider = source.toProvider();

    return new Datasource(provider);
}

it('should bring correctly result', async () => {
    const datasource = createDatasource();

    datasource.setSize(4);
    datasource.setPage(1);

    datasource.refresh();

    await datasource.refreshDone();

    const items = datasource.items.current();

    expect(items.length).toBe(4);
    expect(items[0].id).toBe(1);
    expect(items[3].id).toBe(4);
});

it('should sort correctly number asc', async () => {
    const datasource = createDatasource();

    datasource.setSort([['id', 'ASC']]);

    datasource.refresh();

    await datasource.refreshDone();

    const items = datasource.items.current();

    expect(items[0].id).toBe(1);
    expect(items[1].id).toBe(2);
    expect(items[2].id).toBe(3);
});

it('should sort correctly number desc', async () => {
    const datasource = createDatasource();

    datasource.setSort([['id', 'DESC']]);

    datasource.refresh();

    await datasource.refreshDone();

    const items = datasource.items.current();

    expect(items[0].id).toBe(8);
    expect(items[1].id).toBe(7);
    expect(items[2].id).toBe(6);
});

it('shoult sort correclty string asc', async () => {
    const datasource = createDatasource();

    datasource.setSort([['userName', 'ASC']]);

    datasource.refresh();

    await datasource.refreshDone();

    const items = datasource.items.current();

    expect(items[0].userName).toBe('Amanda');
    expect(items[1].userName).toBe('Beatriz');
    expect(items[2].userName).toBe('Chato');
});

it('should sort correctly desc asc', async () => {
    const datasource = createDatasource();

    datasource.setSort([['userName', 'DESC']]);

    datasource.refresh();

    await datasource.refreshDone();

    const items = datasource.items.current();

    expect(items[0].userName).toBe('Helena');
    expect(items[1].userName).toBe('Gisele');
    expect(items[2].userName).toBe('Fernando');
});

it('should sort correclty boolean asc', async () => {
    const datasource = createDatasource();

    datasource.setSort([['male', 'ASC']]);

    datasource.refresh();

    await datasource.refreshDone();

    const items = datasource.items.current();

    expect(items[0].male).toBe(false);
    expect(items[1].male).toBe(false);
    expect(items[2].male).toBe(false);
    expect(items[3].male).toBe(false);
    expect(items[4].male).toBe(false);
    expect(items[5].male).toBe(true);
});

it('shoult sort correctly boolean desc', async () => {
    const datasource = createDatasource();

    datasource.setSort([['male', 'DESC']]);

    datasource.refresh();

    await datasource.refreshDone();

    const items = datasource.items.current();

    expect(items[0].male).toBe(true);
    expect(items[1].male).toBe(true);
    expect(items[2].male).toBe(true);
    expect(items[3].male).toBe(false);
    expect(items[4].male).toBe(false);
    expect(items[5].male).toBe(false);
});

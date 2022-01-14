import { InMemoryDatasourceProvider } from '../in-memory-datasource-provider';

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

it('should sort 4 items ASC', async () => {
    const result = await Promise.resolve(provider({ page: 1, size: 4, sort: [['userName', 'ASC']] }));

    expect(result.items.length).toBe(4);

    expect(result.items[0].userName).toBe('Amanda');
    expect(result.items[1].userName).toBe('Beatriz');
    expect(result.items[2].userName).toBe('Chato');
    expect(result.items[3].userName).toBe('Daniela');
});

it('should sort 4 items DESC', async () => {
    const result = await Promise.resolve(provider({ page: 1, size: 4, sort: [['userName', 'DESC']] }));

    expect(result.items.length).toBe(4);

    expect(result.items[0].userName).toBe('Helena');
    expect(result.items[1].userName).toBe('Gisele');
    expect(result.items[2].userName).toBe('Fernando');
    expect(result.items[3].userName).toBe('Elfo');
});

it('should bring 4 items', async () => {
    const result = await Promise.resolve(provider({ page: 1, size: 4, sort: [] }));

    expect(result.items.length).toBe(4);
    expect(result.total).toBe(8);
    expect(result.items[0].id).toBe(1);
    expect(result.items[1].id).toBe(2);
    expect(result.items[2].id).toBe(3);
    expect(result.items[3].id).toBe(4);
});

it('should bring correclty items in page 2', async () => {
    const result = await Promise.resolve(provider({ page: 2, size: 4, sort: [] }));

    expect(result.items.length).toBe(4);
    expect(result.items[0].id).toBe(5);
});

it('should bring empty', async () => {
    const result = await Promise.resolve(provider({ page: 3, size: 4, sort: [] }));

    expect(result.items.length).toBe(0);
    expect(result.items[0]).toBe(undefined);
});

it('should bring 1', async () => {
    const result = await Promise.resolve(provider({ page: 2, size: 7, sort: [] }));

    expect(result.items.length).toBe(1);
    expect(result.items[0].id).toBe(8);
});


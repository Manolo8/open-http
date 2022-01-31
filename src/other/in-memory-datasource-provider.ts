import { ISubscriber } from 'open-observable';
import { DatasourceInput } from '../types/datasource-input';
import { DatasourceOutput } from '../types/datasource-output';
import { DatasourceProvider } from '../types/datasource-provider';

type Source<TOutput> = TOutput[] | ISubscriber<TOutput[]>;

export class InMemoryDatasourceProvider<TInput extends DatasourceInput<TOutput>, TOutput> {
    private readonly _source: Source<TOutput>;

    constructor(source: Source<TOutput>) {
        this._source = source;

        this.toProvider = this.toProvider.bind(this);
        this.provide = this.provide.bind(this);
        this.applySort = this.applySort.bind(this);
        this.applyPagination = this.applyPagination.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
    }

    public toProvider(): DatasourceProvider<TInput, TOutput> {
        return this.provide;
    }

    private provide(input: TInput): DatasourceOutput<TOutput> {
        let items = Array.isArray(this._source) ? this._source : this._source.current();

        items = this.applyFilter(input, items);

        const total = items.length;

        items = this.applySort(input, items);
        items = this.applyPagination(input, items);

        return { total, items };
    }

    private applyFilter(input: TInput, value: TOutput[]): TOutput[] {
        return value;
    }

    private applySort(input: TInput, value: TOutput[]): TOutput[] {
        const sort = input.sort;

        if (!sort || sort.length === 0) return value;

        const result = [...value];

        //todo all sorts kind
        const sorter = sort[0];

        result.sort((a, b) => {
            const valueA = a[sorter[0]] as any;
            const valueB = b[sorter[0]] as any;

            const type = typeof valueA;

            if (typeof valueB !== type) return 0;

            switch (type) {
                case 'string':
                    return (valueA as string).localeCompare(valueB as string);
                case 'number':
                case 'boolean':
                    return (valueA as number) - (valueB as number);
                default:
                    return 0;
            }
        });

        if (sorter[1] === 'DESC') result.reverse();

        return result;
    }

    private applyPagination(input: TInput, value: TOutput[]): TOutput[] {
        const page = input.page;
        const size = input.size;

        const start = (page - 1) * size;
        const end = Math.min(start + size, value.length);

        return value.slice(start, end);
    }
}

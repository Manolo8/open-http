import {ISubscriber} from 'open-observable';
import {DatasourceInput} from '../types/datasource-input';
import {DatasourceOutput} from '../types/datasource-output';
import {DatasourceProvider} from '../types/datasource-provider';

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

        return {total, items};
    }

    private applyFilter(input: TInput, value: TOutput[]): TOutput[] {
        return value;
    }

    private applySort(input: TInput, value: TOutput[]): TOutput[] {
        const sort = input.sort;

        if (!sort || sort.length === 0) return value;

        const result = [...value];

        //todo all sorts kind
        result.sort((a, b) => {

            for (const sorter of sort) {
                const valueA = a[sorter[0]];
                const valueB = b[sorter[0]];

                let value = 0;

                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    value = valueA.localeCompare(valueB);
                } else if (typeof valueA === 'number' && typeof valueB === 'number') {
                    value = valueA - valueB;

                    if (value > 0) value = 1;
                    else if (value < 0) value = -1;
                } else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
                    value = (+valueA) - (+valueB);
                }

                if (value === 0) continue;

                return sorter[1] === 'ASC' ? value : value === 1 ? -1 : 1;
            }

            return 0;
        });

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

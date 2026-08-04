import {ISubscriber} from 'open-observable';
import {IDatasourceInput} from '../types/i-datasource-input';
import {DatasourceOutput} from '../types/datasource-output';
import {DatasourceProvider} from '../types/datasource-provider';

type Source<TOutput> = TOutput[] | ISubscriber<TOutput[]>;

export class InMemoryDatasourceProvider<TInput extends IDatasourceInput<TOutput>, TOutput> {
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

    /**
     * Extension point: subclasses may override this to filter the source before
     * sorting/pagination is applied. The base implementation is a no-op.
     */
    protected applyFilter(input: TInput, value: TOutput[]): TOutput[] {
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
                    // Comparisons (instead of subtraction) avoid overflow and keep NaN as "equal".
                    value = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                } else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
                    value = (+valueA) - (+valueB);
                }

                if (value === 0) continue;

                // localeCompare may return any negative/positive number, not only ±1.
                return sorter[1] === 'ASC' ? value : -value;
            }

            return 0;
        });

        return result;
    }

    private applyPagination(input: TInput, value: TOutput[]): TOutput[] {
        const page = Number.isFinite(input.page) && input.page > 1 ? Math.floor(input.page) : 1;
        const size = Number.isFinite(input.size) && input.size > 0 ? Math.floor(input.size) : 0;

        const start = (page - 1) * size;

        return value.slice(start, start + size);
    }
}

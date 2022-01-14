import {Dispatch, ISubscriber, Observable} from 'open-observable';
import {Pagination} from '../types/pagination';
import {DatasourceInput} from '../types/datasource-input';
import {DatasourceProvider} from '../types/datasource-provider';

export class Datasource<TInput extends DatasourceInput<TOutput>, TOutput> {
    private readonly _provider: DatasourceProvider<TInput, TOutput>;
    private _intervalId: number;

    private _items: Observable<TOutput[]>;
    private _total: Observable<number>;
    private _pagination: Observable<Pagination>;
    private _fixedFilter: Observable<Partial<Exclude<TInput, Pagination>>>;
    private _filter: Observable<Partial<Exclude<TInput, Pagination>>>;

    private _resolve: { resolve: () => void; reject: () => void }[];

    constructor(provider: DatasourceProvider<TInput, TOutput>) {
        this._provider = provider;
        this._intervalId = 0;
        this._items = new Observable<TOutput[]>([]);
        this._total = new Observable<number>(0);
        this._pagination = new Observable<Pagination>({page: 1, size: 10});
        this._fixedFilter = new Observable<Partial<Exclude<TInput, Pagination>>>({});
        this._filter = new Observable<Partial<Exclude<TInput, Pagination>>>({});
        this._resolve = [];

        this.refresh = this.refresh.bind(this);
        this.realRefresh = this.realRefresh.bind(this);
        this.setPage = this.setPage.bind(this);
        this.setSize = this.setSize.bind(this);
        this.setFixedFilter = this.setFixedFilter.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.refreshDone = this.refreshDone.bind(this);
    }

    public refresh(): void {
        clearInterval(this._intervalId);

        this._intervalId = setTimeout(this.realRefresh, 250);
    }

    public refreshDone(): Promise<void> {
        return new Promise((resolve, reject) => this._resolve.push({resolve, reject}));
    }

    private realRefresh() {
        const filter = {...this._filter.current(), ...this._fixedFilter.current()} as Exclude<TInput, Pagination>;
        const pagination = this._pagination.current();

        const input = {...filter, ...pagination};

        const copy = this._resolve;
        this._resolve = [];

        Promise.resolve(this._provider(input))
            .then((result) => {
                this._items.next(result.items);
                this._total.next(result.total);

                copy.forEach((x) => x.resolve());
            })
            .catch(() => copy.forEach((x) => x.reject()));
    }

    public setPage(page: number) {
        this._pagination.next((old) => ({...old, page}));
        this.refresh();
    }

    public setSize(size: number) {
        this._pagination.next((old) => ({...old, size}));
        this.refresh();
    }

    public get items(): ISubscriber<TOutput[]> {
        return this._items.asSubscriber();
    }

    public get total(): ISubscriber<number> {
        return this._total.asSubscriber();
    }

    public get pagination(): ISubscriber<Pagination> {
        return this._pagination.asSubscriber();
    }

    public get fixedFilter(): ISubscriber<Partial<TInput>> {
        return this._fixedFilter.asSubscriber();
    }

    public get filter(): ISubscriber<Partial<TInput>> {
        return this._filter.asSubscriber();
    }

    public setFixedFilter(value: Dispatch<Partial<Exclude<TInput, Pagination>>>): void {
        this._fixedFilter.next(value);
        this.refresh();
    }

    public setFilter(value: Dispatch<Partial<Exclude<TInput, Pagination>>>): void {
        this._filter.next(value);
        this.refresh();
    }
}

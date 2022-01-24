import { Dispatch, ISubscriber, Observable } from 'open-observable';
import { Pagination } from '../types/pagination';
import { DatasourceInput } from '../types/datasource-input';
import { DatasourceProvider } from '../types/datasource-provider';
import { DatasourceFilter } from '../types/datasource-filter';
import { Sort } from '../types/sort';

export class Datasource<TInput extends DatasourceInput<TOutput>, TOutput> {
    private readonly _provider: DatasourceProvider<TInput, TOutput>;
    private _timeoutId: number;

    private _items: Observable<TOutput[]>;
    private _loading: Observable<boolean>;
    private _total: Observable<number>;
    private _raw: Observable<any>;
    private _pagination: Observable<Pagination>;
    private _fixedFilter: Observable<DatasourceFilter<TInput, TOutput>>;
    private _filter: Observable<DatasourceFilter<TInput, TOutput>>;
    private _sort: Observable<Sort<TOutput>>;
    private _appending: boolean;
    private _lock: boolean;
    private _clearOnLock: boolean;

    private _resolve: { resolve: () => void; reject: () => void }[];

    constructor(provider: DatasourceProvider<TInput, TOutput>) {
        this._provider = provider;
        this._appending = false;
        this._lock = false;
        this._clearOnLock = false;
        this._timeoutId = 0;
        this._items = new Observable<TOutput[]>([]);
        this._total = new Observable<number>(0);
        this._raw = new Observable<TOutput | undefined>(undefined);
        this._loading = new Observable<boolean>(false);
        this._pagination = new Observable<Pagination>({ page: 1, size: 10 });
        this._fixedFilter = new Observable<DatasourceFilter<TInput, TOutput>>({});
        this._filter = new Observable<DatasourceFilter<TInput, TOutput>>({});
        this._sort = new Observable<Sort<TOutput>>([]);
        this._resolve = [];

        this.refresh = this.refresh.bind(this);
        this.append = this.append.bind(this);
        this.realRefresh = this.realRefresh.bind(this);
        this.setPage = this.setPage.bind(this);
        this.setSize = this.setSize.bind(this);
        this.setFixedFilter = this.setFixedFilter.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.setSort = this.setSort.bind(this);
        this.refreshDone = this.refreshDone.bind(this);
        this.setLock = this.setLock.bind(this);
        this.setClearOnLock = this.setClearOnLock.bind(this);
        this.clear = this.clear.bind(this);
    }

    public refresh(): void {
        if (this._lock) return;

        clearTimeout(this._timeoutId);

        this._appending = false;
        this._loading.next(true);

        this._timeoutId = setTimeout(this.realRefresh, 250);
    }

    public append(): void {
        if (this._lock) return;

        if (this._loading.current()) return;

        const { size, page } = this._pagination.current();
        const total = this._total.current();

        if (size * page >= total) return;

        clearTimeout(this._timeoutId);

        this._appending = true;
        this._loading.next(true);

        this._timeoutId = setTimeout(this.realRefresh, 250);
    }

    public refreshDone(): Promise<void> {
        return new Promise((resolve, reject) => this._resolve.push({ resolve, reject }));
    }

    public buildInput(): TInput {
        const filter = {
            ...this._filter.current(),
            ...this._fixedFilter.current(),
        } as Omit<TInput, keyof Pagination | 'sort'>;

        const pagination = this._pagination.current();

        const sort = this._sort.current();

        return { ...filter, ...pagination, sort } as TInput;
    }

    private realRefresh() {
        const appending = this._appending;

        if (appending) this._pagination.next((old) => ({ ...old, page: old.page + 1 }));

        const input = this.buildInput();

        const copy = this._resolve;
        this._resolve = [];

        Promise.resolve(this._provider(input))
            .then((result) => {
                this._raw.next(result);
                this._items.next((old) => (appending ? [...old, ...result.items] : result.items));
                this._total.next(result.total);
                this._loading.next(false);

                copy.forEach((x) => x.resolve());
            })
            .catch(() => {
                this._loading.next(false);
                copy.forEach((x) => x.reject());
            });
    }

    public setPage(page: number) {
        this._pagination.next((old) => ({ ...old, page }));
        this.refresh();
    }

    public setSize(size: number) {
        this._pagination.next((old) => ({ ...old, size }));
        this.refresh();
    }

    public setLock(lock: boolean) {
        this._lock = lock;

        if (!this._lock) return;

        clearTimeout(this._timeoutId);

        if (!this._clearOnLock) return;

        this.clear();
    }

    public setClearOnLock(clearOnLock: boolean) {
        this._clearOnLock = clearOnLock;

        if (!(this._clearOnLock && this._lock)) return;

        this.clear();
    }

    private clear() {
        this._raw.next(undefined);
        this._items.next([]);
        this._total.next(0);
        this._loading.next(false);
    }

    public setFixedFilter(value: Dispatch<DatasourceFilter<TInput, TOutput>>): void {
        this._fixedFilter.next(value);
        this.refresh();
        this.setPage(1);
    }

    public setFilter(value: Dispatch<DatasourceFilter<TInput, TOutput>>): void {
        this._filter.next(value);
        this.setPage(1);
    }

    public setSort(value: Dispatch<Sort<TOutput>>): void {
        this._sort.next(value);
        this.setPage(1);
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

    public get fixedFilter(): ISubscriber<DatasourceFilter<TInput, TOutput>> {
        return this._fixedFilter.asSubscriber();
    }

    public get filter(): ISubscriber<DatasourceFilter<TInput, TOutput>> {
        return this._filter.asSubscriber();
    }

    public get loading(): ISubscriber<boolean> {
        return this._loading.asSubscriber();
    }

    public get raw(): ISubscriber<any> {
        return this._raw.asSubscriber();
    }

    public get sort(): ISubscriber<Sort<TOutput>> {
        return this._sort.asSubscriber();
    }

    public get lock(): boolean {
        return this._lock;
    }

    public get clearOnLock(): boolean {
        return this._clearOnLock;
    }
}

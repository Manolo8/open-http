import { Dispatch, ISubscriber, Observable } from 'open-observable';
import { DatasourceFilter } from '../types/datasource-filter';
import { DatasourceProvider } from '../types/datasource-provider';
import { IDatasource } from '../types/i-datasource';
import { IDatasourceInput } from '../types/i-datasource-input';
import { IFilterPriority } from '../types/i-filter-priority';
import { Pagination } from '../types/pagination';
import { Sort } from '../types/sort';

export class Datasource<TInput extends IDatasourceInput<TOutput>, TOutput> implements IDatasource<TInput, TOutput> {
    private readonly _provider: DatasourceProvider<TInput, TOutput>;
    private _timeoutId: number;
    private _controller?: AbortController;

    private readonly _items: Observable<TOutput[]>;
    private readonly _loading: Observable<boolean>;
    private readonly _total: Observable<number>;
    private readonly _raw: Observable<any>;
    private readonly _pagination: Observable<Pagination>;
    private readonly _filter: Record<IFilterPriority, Observable<DatasourceFilter<TInput, TOutput>>>;
    private readonly _sort: Observable<Sort<TOutput>>;
    private _error?: (error: unknown) => void;
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
        this._filter = {
            LOW: new Observable<DatasourceFilter<TInput, TOutput>>({}),
            MEDIUM: new Observable<DatasourceFilter<TInput, TOutput>>({}),
            HIGH: new Observable<DatasourceFilter<TInput, TOutput>>({}),
        };
        this._sort = new Observable<Sort<TOutput>>([]);
        this._resolve = [];

        this.refresh = this.refresh.bind(this);
        this.append = this.append.bind(this);
        this.internalRefresh = this.internalRefresh.bind(this);
        this.setPage = this.setPage.bind(this);
        this.setSize = this.setSize.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.setSort = this.setSort.bind(this);
        this.refreshDone = this.refreshDone.bind(this);
        this.setLock = this.setLock.bind(this);
        this.setClearOnLock = this.setClearOnLock.bind(this);
        this.internalClear = this.internalClear.bind(this);
    }

    private async internalRefresh() {
        const appending = this._appending;

        if (appending) this._pagination.next((old) => ({ ...old, page: old.page + 1 }));

        const input = this.buildInput();

        const copy = this._resolve;
        this._resolve = [];

        const controller = (this._controller = new AbortController());

        try {
            const result = await this._provider(input, { signal: this._controller.signal });

            this._raw.next(result);
            this._items.next((old) => (appending ? [...old, ...result.items] : result.items));
            this._total.next(result.total);
            this._loading.next(false);

            copy.forEach((x) => x.resolve());
        } catch (error) {
            //Ignore if request is cancelled
            if (controller.signal.aborted) return;

            copy.forEach((x) => x.reject());

            this._error?.(error);
        } finally {
            this._loading.next(false);
        }
    }

    private internalCancelIncomingRequests(): void {
        clearTimeout(this._timeoutId);
        this._controller?.abort();
    }

    private internalClear(): void {
        this._raw.next(undefined);
        this._items.next([]);
        this._total.next(0);
        this._loading.next(false);
    }

    public destroy(): void {
        this.internalCancelIncomingRequests();
        this.internalClear();
    }

    public refresh(): void {
        if (this._lock) return;

        this.internalCancelIncomingRequests();

        this._appending = false;
        this._loading.next(true);

        this._timeoutId = setTimeout(this.internalRefresh, 250);
    }

    public refreshDone(): Promise<void> {
        return new Promise((resolve, reject) => this._resolve.push({ resolve, reject }));
    }

    public append(): boolean {
        if (this._lock) return false;
        if (this._loading.current()) return false;

        const { size, page } = this._pagination.current();
        const total = this._total.current();

        if (size * page >= total) return false;

        this.internalCancelIncomingRequests();

        this._controller?.abort();
        this._appending = true;
        this._loading.next(true);
        this._timeoutId = setTimeout(this.internalRefresh, 250);

        return true;
    }

    public buildInput(): TInput {
        const low = this._filter.LOW.current();
        const medium = this._filter.MEDIUM.current();
        const high = this._filter.HIGH.current();

        const pagination = this._pagination.current();
        const sort = this._sort.current();

        const filter = { ...low, ...medium, ...high };

        return { ...filter, ...pagination, sort } as TInput;
    }

    public setError(callback: (error: unknown) => void): void {
        this._error = callback;
    }

    public setPage(page: number): void {
        this._pagination.next((old) => ({ ...old, page }));
        this.refresh();
    }

    public setSize(size: number): void {
        this._pagination.next((old) => ({ ...old, size }));
        this.refresh();
    }

    public setSort(value: Dispatch<Sort<TOutput>>): void {
        this._sort.next(value);
        this.setPage(1);
    }

    public setLock(lock: boolean): void {
        if (this._lock === lock) return;

        this._lock = lock;

        if (!this._lock) {
            this.refresh();

            return;
        }

        this.internalCancelIncomingRequests();

        if (!this._clearOnLock) return;

        this.internalClear();
    }

    public setClearOnLock(clearOnLock: boolean): void {
        this._clearOnLock = clearOnLock;

        if (!(this._clearOnLock && this._lock)) return;

        this.internalClear();
    }

    public setFilter(
        value: Dispatch<Partial<Omit<TInput, 'size' | 'page' | 'sort'>>>,
        priority?: IFilterPriority
    ): void {
        this._filter[priority ?? 'LOW'].next(value);
        this.setPage(1);
    }

    public async allItems(size?: number, page?: number): Promise<TOutput[]> {
        const input = { ...this.buildInput(), page: page ?? 1, size: size ?? 1_000_000 };

        const result = await this._provider(input);

        return result.items;
    }

    public get items(): ISubscriber<TOutput[]> {
        return this._items;
    }

    public get total(): ISubscriber<number> {
        return this._total;
    }

    public get pagination(): ISubscriber<Pagination> {
        return this._pagination;
    }

    public get sort(): ISubscriber<Sort<TOutput>> {
        return this._sort;
    }

    public get filter(): Record<IFilterPriority, ISubscriber<Partial<Omit<TInput, 'size' | 'page' | 'sort'>>>> {
        return this._filter;
    }

    public get loading(): ISubscriber<boolean> {
        return this._loading;
    }

    public get raw(): ISubscriber<any> {
        return this._raw;
    }

    public get lock(): boolean {
        return this._lock;
    }

    public get clearOnLock(): boolean {
        return this._clearOnLock;
    }
}

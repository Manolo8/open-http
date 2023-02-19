import { Dispatch, ISubscriber } from 'open-observable';
import { DatasourceFilter } from './datasource-filter';
import { IDatasourceInput } from './i-datasource-input';
import { IFilterPriority } from './i-filter-priority';
import { Pagination } from './pagination';
import { Sort } from './sort';

export interface IDatasource<TInput extends IDatasourceInput<TOutput>, TOutput> {
    /**
     * Refresh items in the datasource
     */
    refresh(): void;

    /**
     * @return {Promise<void>} when the refresh is done
     */
    refreshDone(): Promise<void>;

    /**
     * Append items in the datasource
     * @return {boolean} true if new items are appended
     */
    append(): boolean;

    /**
     * Build the input based on current filters, sort and pagination
     * @return the input
     */
    buildInput(): TInput;

    /**
     * Set a callback to be called when an error occurs
     * @param callback
     */
    setError(callback: (error: unknown) => void): void;

    /**
     * Set current datasource's page
     * @param page
     */
    setPage(page: number): void;

    /**
     * Set how many items are fetched per page
     * or/and how many items are appended
     * @param size
     */
    setSize(size: number): void;

    /**
     * Set sort
     * @param value
     */
    setSort(value: Dispatch<Sort<TOutput>>): void;

    /**
     * Set if the datasource is locked
     * when the datasource is locked, no new data is fetched
     * @param lock
     */
    setLock(lock: boolean): void;

    /**
     * Set if the datasource should be cleared when it is locked
     * @param clearOnLock
     */
    setClearOnLock(clearOnLock: boolean): void;

    /**
     * Set datasource filter
     * @param value
     * @param priority
     */
    setFilter(value: Dispatch<DatasourceFilter<TInput, TOutput>>, priority?: IFilterPriority): void;

    /**
     *  Try to get all items of this datasource from the server
     *  This function doesn't change the datasource
     *  @param size default 1_000_000
     *  @param page default 1
     *  @return TOutput[]
     */
    allItems(size?: number, page?: number): Promise<TOutput[]>

    /**
     * Return a subscriber of the datasource's items
     */
    get items(): ISubscriber<TOutput[]>;

    /**
     * Return a subscriber of the datasource's total items
     */
    get total(): ISubscriber<number>;

    /**
     * Return a subscriber of the datasource's pagination
     */
    get pagination(): ISubscriber<Pagination>;

    /**
     * Return a subscriber of the datasource's sort
     */
    get sort(): ISubscriber<Sort<TOutput>>;

    /**
     * Return an object containing a subscriber of the datasource's filter per priority
     */
    get filter(): Record<IFilterPriority, ISubscriber<DatasourceFilter<TInput, TOutput>>>;

    /**
     * Return a subscriber of the datasource's current loading state
     */
    get loading(): ISubscriber<boolean>;

    /**
     * Return a subscriber of the datasource's raw data
     */
    get raw(): ISubscriber<any>;

    /**
     * Return current lock state
     */
    get lock(): boolean;

    /**
     * Return current clearOnLock state
     */
    get clearOnLock(): boolean;
}

import { Dispatch, ISubscriber } from 'open-observable';
import { Observable } from 'open-observable';
import { IRequestSource } from '../types/i-request-source';
import { RequestSourceProvider } from '../types/request-source-provider';

export class RequestSource<TInput, TOutput> implements IRequestSource<TInput, TOutput> {
    private readonly _provider: RequestSourceProvider<TInput, TOutput>;
    private _timeoutId: number;
    private _controller?: AbortController;

    private _input: Observable<TInput>;
    private _error?: (error: unknown) => void;
    private _output: Observable<TOutput | undefined>;
    private _loading: Observable<boolean>;
    private _lock: boolean;
    private _clearOnLock: boolean;

    public constructor(provider: RequestSourceProvider<TInput, TOutput>) {
        this._provider = provider;
        this._timeoutId = 0;
        this._input = new Observable<TInput>({} as TInput);
        this._output = new Observable<TOutput | undefined>(undefined);
        this._loading = new Observable<boolean>(false);
        this._lock = false;
        this._clearOnLock = false;

        this.setInput = this.setInput.bind(this);
        this.refresh = this.refresh.bind(this);
        this.internalRefresh = this.internalRefresh.bind(this);
        this.setLock = this.setLock.bind(this);
        this.setClearOnLock = this.setClearOnLock.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    private async internalRefresh() {
        const controller = (this._controller = new AbortController());

        try {
            const input = this._input.current();

            const result = await this._provider(input, { signal: controller.signal });

            this._output.next(result);
        } catch (error) {
            if (controller.signal.aborted) return;

            this._error?.(error);
        } finally {
            this._loading.next(false);
        }
    }

    private internalClear() {
        this._output.next(undefined);
        this._loading.next(false);
    }

    private internalCancelIncomingRequests() {
        clearTimeout(this._timeoutId);
        this._controller?.abort();
    }

    public destroy(): void {
        this.internalCancelIncomingRequests();
        this.internalClear();
    }

    public get value(): ISubscriber<TOutput | undefined> {
        return this._output.asSubscriber();
    }

    public get loading(): ISubscriber<boolean> {
        return this._loading.asSubscriber();
    }

    public setInput(value: Dispatch<TInput>): void {
        this._input.next(value);
    }

    public setLock(lock: boolean): void {
        if (this._lock === lock) return;

        this._lock = lock;

        if (!this._lock) {
            this.refresh();

            return;
        }

        clearTimeout(this._timeoutId);
        this._controller?.abort();

        if (!this._clearOnLock) return;

        this.internalClear();
    }

    public setError(callback: (error: unknown) => void): void {
        this._error = callback;
    }

    public setClearOnLock(clearOnLock: boolean): void {
        this._clearOnLock = clearOnLock;

        if (!(this._clearOnLock && this._lock)) return;

        this.internalClear();
    }

    public refresh(): void {
        if (this._lock) return;

        this.internalCancelIncomingRequests();

        this._loading.next(true);

        this._timeoutId = setTimeout(this.internalRefresh, 250);
    }
}

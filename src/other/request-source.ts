import { Dispatch, ISubscriber } from 'open-observable';
import { Observable } from 'open-observable';
import { RequestSourceProvider } from '../types/request-source-provider';

export class RequestSource<TInput, TOutput> {
    private readonly _provider: RequestSourceProvider<TInput, TOutput>;
    private _timeoutId: number;

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
        this.realRefresh = this.realRefresh.bind(this);
        this.setLock = this.setLock.bind(this);
        this.setClearOnLock = this.setClearOnLock.bind(this);
    }

    public get value(): ISubscriber<TOutput | undefined> {
        return this._output.asSubscriber();
    }

    public get loading(): ISubscriber<boolean> {
        return this._loading.asSubscriber();
    }

    public setInput(value: Dispatch<TInput>) {
        this._input.next(value);
    }

    public setLock(lock: boolean) {
        this._lock = lock;

        if (!this._lock) return;

        clearTimeout(this._timeoutId);

        if (!this._clearOnLock) return;

        this.clear();
    }

    public setError(callback: (error: unknown) => void) {
        this._error = callback;
    }

    public setClearOnLock(clearOnLock: boolean) {
        this._clearOnLock = clearOnLock;

        if (!(this._clearOnLock && this._lock)) return;

        this.clear();
    }

    public refresh(): void {
        if (this._lock) return;

        clearTimeout(this._timeoutId);

        this._loading.next(true);

        this._timeoutId = setTimeout(this.realRefresh, 250);
    }

    private async realRefresh() {
        try {
            const input = this._input.current();

            const result = await this._provider(input);

            this._output.next(result);
        } catch (error) {
            this._error?.(error);
        } finally {
            this._loading.next(false);
        }
    }

    private clear() {
        this._output.next(undefined);
        this._loading.next(false);
    }
}

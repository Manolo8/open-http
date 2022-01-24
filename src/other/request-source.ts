import { Dispatch, ISubscriber } from 'open-observable';
import { Observable } from 'open-observable';
import { RequestSourceProvider } from '../types/request-source-provider';

export class RequestSource<TInput, TOutput> {
    private readonly _provider: RequestSourceProvider<TInput, TOutput>;
    private _timeoutId: number;

    private _input: Observable<TInput>;
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

    public setLock(value: boolean) {
        this._lock = value;

        if (value) {
            clearTimeout(this._timeoutId);
            this._loading.next(false);

            if (this._clearOnLock) {
                this._output.next(undefined);
            }
        } else this.refresh();
    }

    public setClearOnLock(value: boolean) {
        this._clearOnLock = value;

        if (this._clearOnLock && this._lock) {
            this._output.next(undefined);
        }
    }

    public refresh(): void {
        clearTimeout(this._timeoutId);
        this._loading.next(true);

        this._timeoutId = setTimeout(this.realRefresh, 250);
    }

    private realRefresh() {
        Promise.resolve(this._provider(this._input.current()))
            .then((result) => {
                this._output.next(result);
                this._loading.next(false);
            })
            .catch(() => this._loading.next(false));
    }
}

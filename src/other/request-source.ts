import {Dispatch, ISubscriber} from 'open-observable';
import {Observable} from 'open-observable';
import {RequestSourceProvider} from '../types/request-source-provider';

export class RequestSource<TInput, TOutput> {
    private readonly _provider: RequestSourceProvider<TInput, TOutput>;
    private _intervalId: number;

    private _input: Observable<TInput>;
    private _output: Observable<TOutput | null>;
    private _loading: Observable<boolean>;

    public constructor(provider: RequestSourceProvider<TInput, TOutput>) {
        this._provider = provider;
        this._intervalId = 0;
        this._input = new Observable<TInput>({} as TInput);
        this._output = new Observable<TOutput | null>(null);
        this._loading = new Observable<boolean>(false);

        this.setInput = this.setInput.bind(this);
        this.refresh = this.refresh.bind(this);
        this.realRefresh = this.realRefresh.bind(this);
    }

    public get value(): ISubscriber<TOutput | null> {
        return this._output.asSubscriber();
    }

    public get loading(): ISubscriber<boolean> {
        return this._loading.asSubscriber();
    }

    public setInput(value: Dispatch<TInput>) {
        this._input.next(value);
    }

    public refresh(): void {
        clearInterval(this._intervalId);

        this._intervalId = setTimeout(this.realRefresh, 250);
    }

    private realRefresh() {
        Promise.resolve(this._provider(this._input.current())).then((result) => {
            this._output.next(result);
        });
    }
}

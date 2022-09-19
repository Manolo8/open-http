import { Dispatch, ISubscriber } from 'open-observable';

export interface IRequestSource<TInput, TOutput> {
    /**
     * Return a subscriber of the output value.
     */
    get value(): ISubscriber<TOutput | undefined>;

    /**
     * Return a subscriber of the loading state.
     */
    get loading(): ISubscriber<boolean>;

    /**
     * Set the input value.
     * @param value
     */
    setInput(value: Dispatch<TInput>): void;

    /**
     * Set the error callback.
     */
    setError(callback: (error: unknown) => void): void;

    /**
     * Set the lock state.
     * @param lock
     */
    setLock(lock: boolean): void;

    /**
     * Set the clearOnLock state.
     * @param clearOnLock
     */
    setClearOnLock(clearOnLock: boolean): void;

    /**
     * Refresh the request-source.
     */
    refresh(): void;
}

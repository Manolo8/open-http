import { HttpRequestOptions } from './http-request-options';

export type RequestSourceProvider<TInput, TOutput> = (input: TInput, options?: HttpRequestOptions) => Promise<TOutput>;

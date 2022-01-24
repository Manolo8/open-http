import { HttpRequestOptions } from './http-request-options';

export type RequestBuilder<TInput, TOutput> = (input: TInput, options?: HttpRequestOptions) => Promise<TOutput>;
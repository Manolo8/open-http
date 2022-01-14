export type RequestSourceProvider<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

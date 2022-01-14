import { useEffect, useState } from 'react';
import { RequestSource } from '../other/request-source';
import { RequestSourceProvider } from '../types/request-source-provider';

export const useRequest = <TInput, TOutput>(
    provider: RequestSourceProvider<TInput, TOutput>,
    configure?: (source: RequestSource<TInput, TOutput>) => void
): RequestSource<TInput, TOutput> => {
    const [source] = useState(() => new RequestSource<TInput, TOutput>(provider));

    useEffect(() => {
        configure?.(source);
        source.refresh();
    }, [configure, source]);

    return source;
};

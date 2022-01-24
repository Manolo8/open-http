import { useEffect, useState } from 'react';
import { RequestSource } from '../other/request-source';
import { RequestSourceProvider } from '../types/request-source-provider';
import { Configurator, IConfigurator } from 'open-observable';

export const useRequest = <TInput, TOutput>(
    provider: RequestSourceProvider<TInput, TOutput>,
    configure?: (source: IConfigurator<RequestSource<TInput, TOutput>>) => void
): RequestSource<TInput, TOutput> => {
    const [{ source, configurator }] = useState(() => {
        const source = new RequestSource<TInput, TOutput>(provider);
        const configurator = new Configurator(source);
        return { source, configurator };
    });

    useEffect(() => {
        configure?.(configurator);

        source.refresh();

        return () => configurator.reset();
    }, [configurator, configure, source]);

    return source;
};

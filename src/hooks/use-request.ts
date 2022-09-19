import { Configurator, IConfigurator } from 'open-observable';
import { useEffect, useState } from 'react';

import { RequestSource } from '../other/request-source';
import { IRequestSource } from '../types/i-request-source';
import { RequestSourceProvider } from '../types/request-source-provider';

export const useRequest = <TInput, TOutput>(
    provider: RequestSourceProvider<TInput, TOutput>,
    configure?: (source: IConfigurator<RequestSource<TInput, TOutput>>) => void
): IRequestSource<TInput, TOutput> => {
    const [{ source, configurator }] = useState(() => {
        const source = new RequestSource<TInput, TOutput>(provider);
        const configurator = new Configurator(source);
        return { source, configurator };
    });

    useEffect(() => {
        configure?.(configurator);

        if (configurator.isCalled() || !configure) source.refresh();

        return () => configurator.reset();
    }, [configurator, configure, source]);

    useEffect(() => source.destroy, [source]);

    return source;
};

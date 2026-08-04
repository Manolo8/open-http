import { Configurator, IConfigurator } from 'open-observable';
import { useEffect, useMemo, useRef } from 'react';

import { RequestSource } from '../other/request-source';
import { IRequestSource } from '../types/i-request-source';
import { RequestSourceProvider } from '../types/request-source-provider';

export const useRequest = <TInput, TOutput>(
    provider: RequestSourceProvider<TInput, TOutput>,
    configure?: (source: IConfigurator<RequestSource<TInput, TOutput>>) => void
): IRequestSource<TInput, TOutput> => {
    const { source, configurator } = useMemo(() => {
        const source = new RequestSource<TInput, TOutput>(provider);
        const configurator = new Configurator(source);
        return { source, configurator };
    }, [provider]);

    // Holds the latest `configure` without making it an effect dependency, so an inline
    // arrow function does not retrigger reset/reconfigure/refresh on every render.
    const configureRef = useRef(configure);
    configureRef.current = configure;

    useEffect(() => {
        configureRef.current?.(configurator);

        source.refresh();

        // Runs on unmount and whenever `provider` yields a new instance, so the replaced
        // source is always aborted and cleared instead of being abandoned.
        return () => {
            configurator.reset();
            source.destroy();
        };
    }, [configurator, source]);

    return source;
};

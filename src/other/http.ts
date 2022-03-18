import axios, { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';

import { HttpConfig } from '../types/http-config';
import { HttpDataType } from '../types/http-data-type';
import { HttpRequestOptions } from '../types/http-request-options';
import { RequestBuilder } from '../types/request-builder';

export class Http<Response, SuccessData, ErrorData> {
    private readonly _axios: Axios;
    private readonly _config: HttpConfig<Response, SuccessData, ErrorData>;

    constructor(config: HttpConfig<Response, SuccessData, ErrorData>) {
        this._axios = new Axios(config?.axiosConfig);
        this._config = config;
    }

    public get<TInput, TOutput>(url: string): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this.processPromise(input, this._axios.get<TOutput>(url + Http.compileParameters(input), options ?? {}));
    }

    public post<TInput, TOutput>(url: string, dataType?: HttpDataType): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this.processPromise(
                input,
                this._axios.post<TOutput>(
                    Http.buildUrl(url, input, dataType),
                    this.buildInput(input, dataType),
                    Http.buildOptions(options, dataType)
                )
            );
    }

    public put<TInput, TOutput>(url: string, dataType?: HttpDataType): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this.processPromise(
                input,
                this._axios.put<TOutput>(
                    Http.buildUrl(url, input, dataType),
                    this.buildInput(input, dataType),
                    Http.buildOptions(options, dataType)
                )
            );
    }

    public patch<TInput, TOutput>(url: string, dataType?: HttpDataType): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this.processPromise(
                input,
                this._axios.patch<TOutput>(
                    Http.buildUrl(url, input, dataType),
                    this.buildInput(input, dataType),
                    Http.buildOptions(options, dataType)
                )
            );
    }

    public delete<TInput, TOutput>(url: string): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this.processPromise(input, this._axios.delete<TOutput>(url + Http.compileParameters(input), options));
    }

    public async processPromise<TInput, TOutput>(input: TInput, promise: Promise<AxiosResponse>): Promise<TOutput> {
        try {
            const axiosResponse = await promise;

            const data = await this._config.responseHandler(axiosResponse);

            return this._config.successHandler(data);
        } catch (error) {
            if (axios.isCancel(error)) throw new Error('cancelled');

            this._config.errorHandler(input, error as any);

            throw error;
        }
    }

    private buildInput(input: any, dataType?: HttpDataType) {
        if (dataType === 'FORMDATA') return this.buildFormData(input);

        if (dataType === 'JSON') return JSON.stringify(input);

        return undefined;
    }

    private static buildUrl(url: string, input: any, dataType?: HttpDataType): string {
        if (!dataType) {
            return url + Http.compileParameters(input);
        }

        return url;
    }

    private static compileParameters(parameters: any) {
        if (!parameters) return '';

        const entries = Object.entries(parameters);

        const compiled = entries
            .map(([key, value]) =>
                Array.isArray(value) ? value.map((x, i) => `${key}[${i}]=${x}`).join('&') : `${key}=${value}`
            )
            .join('&');

        return compiled ? '?' + compiled : '';
    }

    private buildFormData(input: any) {
        if (!input) return null;

        const formData = new FormData();

        Object.entries(input).forEach(([key, value]) => formData.append(key, value as any));

        return formData;
    }

    private static buildOptions(options?: HttpRequestOptions, dataType?: HttpDataType): AxiosRequestConfig {
        return {
            ...options,
            headers: {
                'Content-Type': dataType === 'FORMDATA' ? 'multipart/form-data' : 'application/json',
            },
        };
    }
}

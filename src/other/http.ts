import axios, { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpDataType } from '../types/http-data-type';
import { HttpRequestOptions } from '../types/http-request-options';
import { RequestBuilder } from '../types/request-builder';
import { HttpConfig } from '../types/http-config';

export class Http {
    private readonly _axios: Axios;
    private readonly _config?: HttpConfig;

    constructor(config?: HttpConfig) {
        this._axios = new Axios(config?.axiosConfig);
        this._config = config;

        this.handleError = this.handleError.bind(this);
        this.handleSuccess = this.handleSuccess.bind(this);
    }

    public get<TInput, TOutput>(url: string): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this._axios
                .get<TOutput>(url + Http.compileParameters(input), options ?? {})
                .then(this.handleSuccess)
                .catch((error) => this.handleError(input, error));
    }

    public post<TInput, TOutput>(url: string, dataType?: HttpDataType): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this._axios
                .post<TOutput>(
                    Http.buildUrl(url, input, dataType),
                    this.buildInput(input, dataType),
                    Http.buildOptions(options, dataType)
                )
                .then(this.handleSuccess)
                .catch((error) => this.handleError(input, error));
    }

    public put<TInput, TOutput>(url: string, dataType?: HttpDataType): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this._axios
                .put<TOutput>(
                    Http.buildUrl(url, input, dataType),
                    this.buildInput(input, dataType),
                    Http.buildOptions(options, dataType)
                )
                .then(this.handleSuccess)
                .catch((error) => this.handleError(input, error));
    }

    public patch<TInput, TOutput>(url: string, dataType?: HttpDataType): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this._axios
                .patch<TOutput>(
                    Http.buildUrl(url, input, dataType),
                    this.buildInput(input, dataType),
                    Http.buildOptions(options, dataType)
                )
                .then(this.handleSuccess)
                .catch((error) => this.handleError(input, error));
    }

    public delete<TInput, TOutput>(url: string): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this._axios
                .delete<TOutput>(url + Http.compileParameters(input), options)
                .then(this.handleSuccess)
                .catch((error) => this.handleError(input, error));
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

    private handleSuccess(response: AxiosResponse) {
        const handler = this._config?.successHandler;

        if (handler) return handler(response);

        return response.data;
    }

    private handleError(input: any, error: any) {
        if (axios.isCancel(error)) return Promise.reject('cancelled');

        const handler = this._config?.errorHandler;

        handler?.(input, error);

        throw error;
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

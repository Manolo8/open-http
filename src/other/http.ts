import {Axios, AxiosRequestConfig} from 'axios';
import {HttpDataType} from '../types/http-data-type';
import {HttpRequestOptions} from '../types/http-request-options';
import {RequestBuilder} from '../types/request-builder';

export class Http {
    private readonly _axios: Axios;

    constructor(config: AxiosRequestConfig) {
        this._axios = new Axios(config);
    }

    public get<TInput, TOutput>(url: string): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this._axios.get<TOutput>(url + Http.compileParameters(input), options).then((x) => x.data);
    }

    public post<TInput, TOutput>(url: string, dataType?: HttpDataType): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this._axios
                .post<TOutput>(url, this.buildInput(input, dataType), Http.buildOptions(options, dataType))
                .then((x) => x.data);
    }

    public put<TInput, TOutput>(url: string, dataType?: HttpDataType): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this._axios
                .put<TOutput>(url, this.buildInput(input, dataType), Http.buildOptions(options, dataType))
                .then((x) => x.data);
    }

    public patch<TInput, TOutput>(url: string, dataType?: HttpDataType): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this._axios
                .patch<TOutput>(url, this.buildInput(input, dataType), Http.buildOptions(options, dataType))
                .then((x) => x.data);
    }

    public delete<TInput, TOutput>(url: string): RequestBuilder<TInput, TOutput> {
        return (input: TInput, options?: HttpRequestOptions) =>
            this._axios.delete<TOutput>(url + Http.compileParameters(input), options).then((x) => x.data);
    }

    private static compileParameters(parameters: any) {
        if (!parameters) return '';

        const compiled = Object.entries(parameters)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        return compiled ? '?' + compiled : '';
    }

    private buildInput(input: any, dataType?: HttpDataType) {
        if (dataType === 'FORMDATA') return this.buildFormData(input);

        return JSON.stringify(input);
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

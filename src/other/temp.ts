// import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
// import { ErrorType, ServerResponse } from 'lib/types/server-response';
// import { useEffect } from 'react';

// const compileParameters = (parameters: any) => {
//     if (!parameters) return '';

//     const compiled = Object.entries(parameters)
//         .map(([key, value]) => `${key}=${value}`)
//         .join('&');

//     return compiled ? '?' + compiled : '';
// };

// const errorHandler: ((error: ErrorType) => void)[] = [];

// const useHttpErrorHandler = (callback: (error: ErrorType) => void): void => {
//     useEffect(() => {
//         errorHandler.push(callback);

//         return () => {
//             errorHandler.splice(errorHandler.indexOf(callback), 1);
//         };
//     }, [callback]);
// };

// const headers: { [key: string]: string } = {};

// const useSetHeader = (key: string, value: string): void => {
//     useEffect(() => {
//         headers[key] = value;

//         return () => {
//             delete headers[key];
//         };
//     }, [key, value]);
// };

// const buildFormData = (formData: FormData, data: any, parentKey?: string) => {
//     if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
//         Object.keys(data).forEach((key) => {
//             buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
//         });
//     } else if (parentKey) {
//         const value = data == null ? '' : data;

//         formData.append(parentKey, value);
//     }
// };

// const request = <D, R>(url: string, method: Method, data?: D, info?: PromiseInfo, dataType?: DataType): Promise<R> => {
//     if (method === 'GET' && data) {
//         url = url + compileParameters(data);
//         data = undefined;
//     }

//     const requestHeaders = { ...headers };

//     if (dataType === 'FORMDATA') {
//         requestHeaders['Content-Type'] = 'multipart/form-data';
//         const formData = new FormData();
//         buildFormData(formData, data);
//         data = formData as any;
//     }

//     const promise = axios
//         .request<ServerResponse<R>>({
//             method,
//             url: url,
//             data: data,
//             headers: requestHeaders,
//             ...info,
//         })
//         .then((x) => (!x || x.data.fail ? Promise.reject(x?.data) : x.data))
//         .catch((error) => {
//             if (axios.isCancel(error)) return Promise.reject('cancelled');
//             if (error.response?.data) {
//                 errorHandler.forEach((e) => e(error.response.data));
//                 return Promise.reject(error.response.data);
//             }
//             errorHandler.forEach((e) => e(error));
//             throw error;
//         });

//     return promise as unknown as Promise<R>;
// };

// const createCancellable: () => CancelTokenSource = () => axios.CancelToken.source();
// //endregion

// //region Methods

// const builder =
//     <D, R>(url: string, method: Method, type?: DataType): PromiseInfoBuilder<D, R> =>
//         (info?: PromiseInfo): PromiseBuilder<D, R> =>
//             (data?: D): Promise<R> =>
//                 request<D, R>(url, method, data, info, type);

// const post = <D, R>(url: string, type?: DataType): PromiseInfoBuilder<D, R> => builder<D, R>(url, 'POST', type);
// const get = <D, R>(url: string, type?: DataType): PromiseInfoBuilder<D, R> => builder<D, R>(url, 'GET', type);
// const _delete = <D, R>(url: string, type?: DataType): PromiseInfoBuilder<D, R> => builder<D, R>(url, 'DELETE', type);
// const put = <D, R>(url: string, type?: DataType): PromiseInfoBuilder<D, R> => builder<D, R>(url, 'PUT', type);

// const http = { request: request, post, get, delete: _delete, put };
// //endregion

// export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

// type PromiseInfo = Pick<AxiosRequestConfig, 'onDownloadProgress' | 'onUploadProgress' | 'cancelToken'>;
// type PromiseBuilder<D, R> = (data: D) => Promise<R>;
// type PromiseInfoBuilder<D, R> = (info?: PromiseInfo) => PromiseBuilder<D, R>;
// type DataType = 'JSON' | 'FORMDATA';

// export type { PromiseBuilder, PromiseInfoBuilder, PromiseInfo };
// export { http, useHttpErrorHandler, useSetHeader, createCancellable };

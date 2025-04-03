import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const nativeService: AxiosInstance = axios.create({
  timeout: 0,
  headers: {},
});

export const nativeHttp = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return nativeService.get(url, config);
  },

  post<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
    return nativeService.post(url, data, config);
  },

  put<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
    return nativeService.put(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return nativeService.delete(url, config);
  },
};

export { nativeHttp as NativeRequest };
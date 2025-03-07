import axios from 'axios';
import { Toast } from '@douyinfe/semi-ui';
import Router from 'next/router';

export const HttpClient = axios.create({
  baseURL: process.env.SERVER_API_URL,
  timeout: 60000,
});

const isBrowser = typeof window !== 'undefined';

HttpClient.interceptors.request.use(
  (config) => {
    if (isBrowser) {
      const token = window.localStorage.getItem('token');
      if (config && config.headers && token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  () => {
    throw new Error('发起请求出错');
  }
);

HttpClient.interceptors.response.use(
  (data) => {
    if (data.status && +data.status === 200 && data.data.status === 'error') {
      isBrowser && Toast.error(data.data.message);
      return null;
    }

    const res = data.data;

    if (!res.success) {
      Toast.error(res.msg);
      return null;
    }
    return res.data;
  },
  (err) => {
    if (err && err.response && err.response.status) {
      const status = err.response.status;

      switch (status) {
        case 504:
        case 404:
          isBrowser && Toast.error((err.response && err.response.data && err.response.data.message) || '服务器异常');
          break;
        case 401:
          if (isBrowser) {
            Router.replace(`/login?redirect=${window.location.pathname}`);
          }
          break;

        default:
          isBrowser && Toast.error((err.response && err.response.data && err.response.data.message) || '未知错误!');
      }
      return Promise.reject({
        statusCode: err.response.status,
        message: err.response.data.message,
      });
    }

    return Promise.reject(err);
  }
);

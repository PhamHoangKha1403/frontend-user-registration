import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosRequestHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getRefreshToken, setRefreshToken } from '@/utils/tokenStore.ts';

type CustomAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const ensureHeaders = (
  config: CustomAxiosRequestConfig,
): AxiosHeaders => {
  if (config.headers instanceof AxiosHeaders) {
    return config.headers;
  }

  const headers = new AxiosHeaders(config.headers ?? {});
  config.headers = headers as AxiosRequestHeaders;
  return headers;
};

const hasAuthorizationHeader = (headers: AxiosHeaders): boolean =>
  Boolean(headers.get('Authorization'));

const setAuthorizationHeader = (headers: AxiosHeaders, token: string) => {
  headers.set('Authorization', `Bearer ${token}`);
};

// --- Cấu hình Axios ---

// 1. Tạo một instance Axios
const apiBaseUrl =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Biến toàn cục để lưu trữ các hàm từ AuthContext
let authContextApi: {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
} | null = null;

// Hàm này sẽ được gọi từ AuthProvider để "inject" state vào
export const setupAxiosInterceptors = (api: {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}) => {
  authContextApi = api;
};

// 3. Request Interceptor (Gắn Access Token) 
axiosInstance.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const headers = ensureHeaders(config);

    
    if (hasAuthorizationHeader(headers)) {
      return config;
    }
   

    if (!authContextApi) {
      return config;
    }

    const accessToken = authContextApi.getAccessToken();
    if (accessToken) {
      setAuthorizationHeader(headers, accessToken);
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

// 4. Response Interceptor (Xử lý 401 - Tự động Refresh Token)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Chỉ xử lý lỗi 401 (Unauthorized)
    // Và request này chưa được retry (_retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang trong quá trình refresh, xếp request này vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (typeof token === 'string') {
              const headers = ensureHeaders(originalRequest);
              setAuthorizationHeader(headers, token);
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Đánh dấu request này là đã retry
      originalRequest._retry = true;
      isRefreshing = true;

      const localRefreshToken = getRefreshToken();
      if (!localRefreshToken) {
        // Không có refresh token, logout
        authContextApi?.logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // --- Bắt đầu quá trình Refresh Token (GỌI API THẬT) ---
        console.log(
          '[Axios Interceptor] Access Token hết hạn. Đang gọi Refresh API thật...',
        );

        const refreshResponse = await axiosInstance.post('/auth/refresh', {
          refreshToken: localRefreshToken,
        });

        // --- SỬA LỖI: Xóa chữ "Data" bị thừa ---
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data;

        // --- Refresh thành công ---
        console.log(
          '[Axios Interceptor] Refresh thành công. Cập nhật Access Token mới.',
        );
        authContextApi?.setAccessToken(newAccessToken);

        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        // Cập nhật header cho request hiện tại và các request sau
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        // Gắn token mới vào request retry
        setAuthorizationHeader(ensureHeaders(originalRequest), newAccessToken);

        // Xử lý hàng đợi
        processQueue(null, newAccessToken);

        // Retry lại request ban đầu
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        // --- Refresh thất bại ---
        console.error(
          '[Axios Interceptor] Refresh thất bại. Đang logout.',
          refreshError.message,
        );
        authContextApi?.logout();

        // Xử lý hàng đợi (báo lỗi)
        processQueue(refreshError, null);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
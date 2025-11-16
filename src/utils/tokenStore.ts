const REFRESH_TOKEN_KEY = 'my_refresh_token';

/**
 * Lấy refresh token từ localStorage
 */
export const getRefreshToken = (): string | null => {
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Không thể lấy refresh token từ localStorage', error);
    return null;
  }
};

/**
 * Lưu refresh token vào localStorage
 */
export const setRefreshToken = (token: string): void => {
  try {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Không thể lưu refresh token vào localStorage', error);
  }
};

/**
 * Xóa refresh token khỏi localStorage
 */
export const removeRefreshToken = (): void => {
  try {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Không thể xóa refresh token khỏi localStorage', error);
  }
};
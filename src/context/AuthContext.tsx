import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode, SetStateAction, Dispatch } from 'react';
import { getRefreshToken, removeRefreshToken, setRefreshToken } from '../utils/tokenStore.ts'; // <--- 1. Import getRefreshToken, setRefreshToken
import { axiosInstance, setupAxiosInterceptors } from '../api/axiosInstance.ts'; // <--- 2. Import axiosInstance

// Định nghĩa kiểu dữ liệu cho User
interface User {
  id: string;
  name: string;
  email: string;
}

// Định nghĩa kiểu dữ liệu cho AuthContext
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setAccessToken: Dispatch<SetStateAction<string | null>>;
  isAuthenticated: boolean;
  isLoading: boolean; // <--- 3. Thêm state isLoading
}

// Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tạo Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // <--- 4. Khởi tạo isLoading = true

  // Dùng useCallback để đảm bảo hàm không bị tạo lại
  const login = useCallback((userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
  }, []);

  const logout = useCallback(() => {
    console.log('Đã gọi hàm logout từ context');
    setUser(null);
    setAccessToken(null);
    removeRefreshToken();
  }, []);

  const isAuthenticated = !!accessToken && !!user;

  // "Inject" state vào Axios Interceptor
  useEffect(() => {
    const getAccessToken = () => accessToken;
    setupAxiosInterceptors({ getAccessToken, setAccessToken, logout });
  }, [accessToken, logout]);

  // <--- 5. THÊM LOGIC SILENT REFRESH KHI TẢI APP ---
  useEffect(() => {
    const restoreAuth = async () => {
      const localRefreshToken = getRefreshToken();
      if (!localRefreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('[AuthContext] Đang thử "Silent Refresh"...');
        // 1. Dùng Refresh Token để lấy Access Token mới
        const refreshResponse = await axiosInstance.post('/auth/refresh', {
          refreshToken: localRefreshToken,
        });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
        
        // 2. Cập nhật state (memory) và localStorage
        setAccessToken(newAccessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        // 3. Lấy thông tin user (vì /auth/refresh không trả về user)
        // Interceptor sẽ tự động dùng newAccessToken
        const profileResponse = await axiosInstance.get('/user/profile');
        setUser(profileResponse.data); // Đặt thông tin user
        
        console.log('[AuthContext] "Silent Refresh" thành công.');

      } catch (error) {
        console.error('[AuthContext] "Silent Refresh" thất bại:', error);
        logout(); // Xóa token hỏng
      } finally {
        setIsLoading(false); // <--- 6. Báo cho app biết đã kiểm tra xong
      }
    };

    restoreAuth();
  }, [logout]); // Chạy 1 lần khi mount

  const contextValue = useMemo(
    () => ({
      user,
      accessToken,
      login,
      logout,
      setAccessToken,
      isAuthenticated,
      isLoading, // <--- 7. Cung cấp isLoading ra context
    }),
    [user, accessToken, login, logout, isLoading],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Tạo custom hook để sử dụng AuthContext dễ dàng
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
};
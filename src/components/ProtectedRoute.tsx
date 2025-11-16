import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth(); // <--- 1. Lấy thêm isLoading
  const location = useLocation();

  // 2. Nếu đang trong quá trình "Silent Refresh", hiển thị loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Đang tải và xác thực...</div>
      </div>
    );
  }

  // 3. Nếu KHÔNG loading VÀ KHÔNG đăng nhập -> đá về /login
  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, điều hướng về /login
    // state={{ from: location }} để sau khi login có thể quay lại trang cũ
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Nếu KHÔNG loading VÀ ĐÃ đăng nhập -> cho vào
  return <Outlet />;
};

export default ProtectedRoute;
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Chờ cho AuthContext kiểm tra xong (quan trọng)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Đang tải...</div>
      </div>
    );
  }

  // Nếu ĐÃ đăng nhập, điều hướng họ khỏi trang public
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu CHƯA đăng nhập, cho phép họ xem
  return <Outlet />;
};

export default PublicOnlyRoute;
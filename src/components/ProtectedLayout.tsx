import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function ProtectedLayout() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // Tạo mutation cho Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Trong tương lai có thể gọi API /auth/logout
      return Promise.resolve();
    },
    onSettled: () => {
      // Luôn gọi logout (từ context)
      logout();
      // Xóa cache của React Query
      queryClient.clear();
      // ProtectedRoute sẽ tự động đá về /login
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* === Thanh Header === */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-6">
          {/* Logo/Tên App */}
          <Link to="/dashboard" className="mr-6 font-bold">
            My App
          </Link>

          {/* Menu bên phải */}
          <div className="flex flex-1 items-center justify-end space-x-4">
            <span className="text-sm text-muted-foreground">
              Chào, {user?.name || user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Đang thoát..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      {/* === Phần Nội dung Trang === */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

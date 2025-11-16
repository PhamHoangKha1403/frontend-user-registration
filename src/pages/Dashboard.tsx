import { useAuth } from "../context/AuthContext.tsx"; 
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../api/axiosInstance.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

// Định nghĩa kiểu dữ liệu cho User Profile (từ API /user/profile)
interface UserProfile {
  _id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export default function Dashboard() {
  // 1. Lấy thông tin user (từ Context) để chào
  const { user } = useAuth();

  // 2. Dùng useQuery để fetch dữ liệu chi tiết (như yêu cầu)
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axiosInstance.get("/user/profile");
      return response.data; // <--- Dữ liệu user từ backend
    },
    refetchOnWindowFocus: false,
  });

 
  const createdDate = profile?.createdAt ? new Date(profile.createdAt) : null;
  const formattedJoinDate =
    createdDate && !Number.isNaN(createdDate.getTime())
      ? createdDate.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Chưa cập nhật"; 

  const greetingName = user?.name || profile?.name || profile?.email;

  // 3. Xử lý trạng thái Loading (Skeleton UI của bạn)
  if (isLoading) {
    return (
     
      <div className="flex w-full flex-col items-center gap-6 text-center">
        <div className="space-y-2 w-full max-w-2xl">
          <div className="h-8 w-2/5 mx-auto animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/5 mx-auto animate-pulse rounded bg-muted" />
        </div>
        <Card className="w-full max-w-xl animate-pulse text-left">
          <CardHeader>
            <div className="h-5 w-1/3 rounded bg-muted" />
            <div className="h-4 w-2/5 rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Xử lý trạng thái Error
  if (isError) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>
          Không thể tải dữ liệu profile. {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Không có dữ liệu</AlertTitle>
        <AlertDescription>
          Không thể tìm thấy thông tin người dùng. Vui lòng thử tải lại trang.
        </AlertDescription>
      </Alert>
    );
  }

 
  return (
    // Bỏ mx-auto, max-w-2xl, py-10 vì Layout đã lo
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">
          Chào mừng trở lại, {greetingName}!
        </h1>
        <p className="text-muted-foreground">
          Đây là tổng quan tài khoản cá nhân của bạn.
        </p>
      </section>

      <Card className="w-full max-w-xl text-left">
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>
            Dữ liệu đồng bộ từ API `/user/profile`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div>
            <p className="text-sm text-muted-foreground">Họ và tên</p>
            <p className="text-base font-semibold">
              {profile.name ?? "Chưa cung cấp"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-base font-semibold">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày tham gia</p>
            <p className="text-base font-semibold">{formattedJoinDate}</p>
          </div>
         
          <div>
            <p className="text-sm text-muted-foreground">Mã người dùng</p>
            <p className="font-mono text-base">{profile._id}</p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? "Đang làm mới..." : "Làm mới thông tin"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
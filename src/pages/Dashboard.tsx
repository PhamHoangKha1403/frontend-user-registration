import { useNavigate } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Gộp lại thành một component và export default
export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Trong một ứng dụng thật, bạn sẽ xoá token/auth context ở đây
    console.log("Logging out...");

    // Điều hướng về trang chủ
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Dashboard</CardTitle>
          <CardDescription>Welcome to your personal area!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You have successfully logged in. This is a protected route.</p>
          <p>
            In a real application, this page would fetch and display your
            personal data, settings, or other application features.
          </p>
          <Button onClick={handleLogout} className="w-full" variant="outline">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

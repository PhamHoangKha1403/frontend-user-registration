import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios'; 

import { axiosInstance } from '@/api/axiosInstance.ts';
import { useAuth } from '@/context/AuthContext.tsx'; 
import { setRefreshToken } from '@/utils/tokenStore.ts'; 

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// 1. Định nghĩa schema validation với Zod
const formSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // <--- 4. Lấy hàm login từ Context

  // Lấy trang trước đó (nếu có) để điều hướng về
  const from = location.state?.from?.pathname || '/dashboard';

  //  Kết nối Zod với react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  //  Tạo Mutation (React Query) để gọi API thật
  const mutation = useMutation({
    mutationFn: (loginData: FormData) => {
      return axiosInstance.post('/auth/login', loginData);
    },
    onSuccess: (response) => {
      // --- XỬ LÝ KHI LOGIN THÀNH CÔNG ---
      const { user, accessToken, refreshToken } = response.data; 

      login(user, accessToken);

      setRefreshToken(refreshToken);

      navigate(from, { replace: true });
    },
    onError: (error: any) => {
  
      let message = 'Login failed. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        message = error.response.data.message || 'Invalid email or password';
      }
      alert(`Login Failed: ${message}`);
      form.setError('root', { message });
    },
  });

  // 11. Hàm OnSubmit (RHF)
  const onSubmit = (data: FormData) => {
    mutation.mutate(data); // Chạy mutation
  };

  return (
    <div className="flex items-center justify-center h-screen bg-muted">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Hiển thị lỗi chung (nếu có) */}
              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-muted-foreground w-full">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

// 1. Định nghĩa schema validation
const formSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

type FormData = z.infer<typeof formSchema>;

const registerUser = async (data: FormData) => {
  const response = await axios.post(`${API_URL}/user/register`, data);
  return response.data;
};

export default function SignUp() {
  const navigate = useNavigate();

  // 2. Kết nối Zod
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      // 3. Thay alert bằng điều hướng và (lý tưởng nhất) là một toast message
      // Ví dụ: toast.success('Registration successful!')
      alert('Registration successful!');
      navigate('/login');
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
      // 2. Lấy message từ data của backend
      const backendMessage = error.response.data.message;
      alert(`Registration Failed: ${backendMessage}`);
    } else {
      // 3. Fallback cho các lỗi khác
      alert(`Registration Failed: ${error.message}`);
    }
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="flex items-center justify-center h-screen bg-muted">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Create your new account in one step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? 'Registering...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-muted-foreground w-full">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
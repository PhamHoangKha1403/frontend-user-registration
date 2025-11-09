import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-muted">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome</CardTitle>
          <CardDescription>
            Please sign in or register to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-2">
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
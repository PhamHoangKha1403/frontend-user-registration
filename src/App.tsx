import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.tsx';
import ProtectedLayout from './components/ProtectedLayout.tsx'; 

function App() {
  return (
    <Routes>
      {/* Các route public (chỉ cho khách) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Các route được bảo vệ (cho user đã login) */}
      <Route element={<ProtectedRoute />}>
        {/* 2. Bọc các trang được bảo vệ bằng Layout mới */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/user/Home';
import Login from './pages/user/Login';
import Signup from './pages/user/Signup';
import FindId from './pages/user/FindId';
import ResetPassword from './pages/user/ResetPassword';
import ContractInspect from './pages/user/ContractInspect';
import InspectionHistory from './pages/user/InspectionHistory';
import InspectionDetail from './pages/user/InspectionDetail';
import Mypage from './pages/user/Mypage';
import Withdraw from './pages/user/Withdraw';

import AdminHome from './pages/admin/AdminHome';
import UserList from './pages/admin/UserList';
import Stats from './pages/admin/Stats';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/find-id" element={<FindId />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contract" element={<ContractInspect />} />
        <Route path="/history" element={<InspectionHistory />} />
        <Route path="/history/:contractId" element={<InspectionDetail />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/users" element={<UserList />} />
        <Route path="/admin/stats/:section" element={<Stats />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
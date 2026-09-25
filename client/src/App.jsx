import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import MyProfile from './pages/MyProfile';
import EditProfile from './pages/EditProfile';
import PublicProfile from './pages/PublicProfile';
import Developers from './pages/Developers';
import Feed from './pages/Feed';
import AiAnalyzer from './pages/ai/AiAnalyzer';
import AiHistory from './pages/ai/AiHistory';
import AiDetail from './pages/ai/AiDetail';
import Collaborators from './pages/matching/Collaborators';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/developers" element={<ProtectedRoute><Developers /></ProtectedRoute>} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            
            <Route path="/ai-analyzer" element={<ProtectedRoute><AiAnalyzer /></ProtectedRoute>} />
            <Route path="/ai-analyzer/history" element={<ProtectedRoute><AiHistory /></ProtectedRoute>} />
            <Route path="/ai-analyzer/:id" element={<ProtectedRoute><AiDetail /></ProtectedRoute>} />

            <Route path="/collaborators" element={<ProtectedRoute><Collaborators /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />

            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

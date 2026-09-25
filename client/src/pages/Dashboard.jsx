import { useAuth } from '../hooks/useAuth';
import { User, ShieldCheck, Mail, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Here is your developer dashboard overview.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            Profile Information
          </h3>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <User className="w-4 h-4" /> Full name
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Account ID
              </dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">{user?.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

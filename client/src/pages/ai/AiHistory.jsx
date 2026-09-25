import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowLeft, Loader2, Sparkles, ChevronRight, Target } from 'lucide-react';
import api from '../../services/api';

const AiHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/ai/profile-analysis/history');
        setHistory(data.data);
      } catch (err) {
        setError('Failed to load analysis history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/ai-analyzer" className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <History className="w-8 h-8 text-primary-600" />
            Analysis History
          </h1>
          <p className="mt-1 text-gray-600">Review your past AI profile analyses and track your growth.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No History Found</h3>
          <p className="mt-2 text-gray-500 mb-6">You haven't run any AI profile analyses yet.</p>
          <Link to="/ai-analyzer" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700">
            Run Analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Link 
              key={item.id} 
              to={`/ai-analyzer/${item.id}`}
              className="block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-primary-500" />
                    Target: {item.targetRole}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Analyzed on {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiHistory;

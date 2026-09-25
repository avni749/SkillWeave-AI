import { useState } from 'react';
import api from '../../services/api';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/posts', { content });
      setContent('');
      if (onPostCreated) onPostCreated(data.post);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex gap-4">
        <div className="h-10 w-10 flex-shrink-0 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none outline-none transition-all"
              rows="3"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
            ></textarea>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="bg-primary-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;

import { useState, useEffect } from 'react';
import api from '../services/api';
import CreatePost from '../components/feed/CreatePost';
import PostItem from '../components/feed/PostItem';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const fetchFeed = async (pageNum = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/feed?page=${pageNum}&limit=10`);
      setPosts(data.posts);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(page);
  }, [page]);

  const handlePostCreated = (newPost) => {
    // To ensure UI updates, we can either re-fetch or prepend
    fetchFeed(1);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? { ...p, content: updatedPost.content } : p));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Developer Feed</h1>
          <p className="mt-1 text-gray-600">See what your network is talking about.</p>
        </div>
        <Link to="/developers" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
          Find Developers
        </Link>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6">
          {error}
        </div>
      )}

      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <PostItem 
              key={post.id} 
              post={post} 
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Your feed is quiet</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            You are not following anyone yet, or they haven't posted anything. 
            Find developers to follow to see their updates here!
          </p>
          <Link to="/developers" className="mt-6 inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Explore Developers
          </Link>
        </div>
      )}
    </div>
  );
};

export default Feed;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Trash, Edit, MoreVertical, X, Check, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import CommentSection from './CommentSection';

const PostItem = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwner = user?.id === post.authorId;

  useEffect(() => {
    // Determine if the current user has liked the post
    // Ideally we need an initial check, but if the endpoint doesn't return `isLiked` for the list,
    // we fetch it individually or manage it. We'll check the individual post if possible,
    // or assume false until clicked for now, to save network calls unless the API provides it.
    // Let's check single post status asynchronously just to set the initial like state properly
    const checkLikeStatus = async () => {
      try {
        const { data } = await api.get(`/posts/${post.id}`);
        setLiked(data.isLiked);
      } catch (err) {}
    };
    if (user) checkLikeStatus();
  }, [post.id, user]);

  const handleLike = async () => {
    try {
      if (liked) {
        setLiked(false);
        setLikesCount(prev => prev - 1);
        await api.delete(`/posts/${post.id}/like`);
      } else {
        setLiked(true);
        setLikesCount(prev => prev + 1);
        await api.post(`/posts/${post.id}/like`);
      }
    } catch (err) {
      // Revert on failure
      setLiked(!liked);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.put(`/posts/${post.id}`, { content: editContent });
      setIsEditing(false);
      setMenuOpen(false);
      if (onPostUpdated) onPostUpdated(data.post);
    } catch (err) {
      console.error('Failed to update', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <Link to={`/profile/${post.authorId}`} className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
            {post.author?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 hover:underline">{post.author?.name}</h4>
            <span className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        </Link>
        
        {isOwner && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
              <MoreVertical className="w-5 h-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-100 z-10 py-1">
                <button 
                  onClick={() => { setIsEditing(true); setMenuOpen(false); }} 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={handleDelete} 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Trash className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 text-gray-800 whitespace-pre-wrap">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none"
              rows="3"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={loading}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setIsEditing(false); setEditContent(post.content); }}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                disabled={loading}
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={handleUpdate}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center gap-1"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
              </button>
            </div>
          </div>
        ) : (
          <p>{post.content}</p>
        )}
      </div>

      {!isEditing && (
        <>
          <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              {post._count?.comments || 0} {post._count?.comments === 1 ? 'Comment' : 'Comments'}
            </button>
          </div>

          {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <CommentSection postId={post.id} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostItem;

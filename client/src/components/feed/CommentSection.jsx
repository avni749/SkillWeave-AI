import { useState, useEffect } from 'react';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(data.comments);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      await api.post(`/posts/${postId}/comments`, { 
        content, 
        parentCommentId: replyingTo 
      });
      setContent('');
      setReplyingTo(null);
      fetchComments(); // refresh to get the new comment with author info
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        {replyingTo && (
          <div className="flex justify-between items-center text-xs text-primary-600 bg-primary-50 p-2 rounded">
            <span>Replying to comment</span>
            <button type="button" onClick={() => setReplyingTo(null)} className="hover:underline">Cancel</button>
          </div>
        )}
        <div className="flex gap-2">
          <input 
            type="text" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyingTo ? "Write a reply..." : "Write a comment..."} 
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm outline-none"
            disabled={posting}
          />
          <button 
            type="submit" 
            disabled={posting || !content.trim()}
            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-primary-500" /></div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Link to={`/profile/${comment.authorId}`} className="h-8 w-8 flex-shrink-0 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs mt-1">
                {comment.author?.name?.charAt(0) || 'U'}
              </Link>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <Link to={`/profile/${comment.authorId}`} className="font-medium text-sm text-gray-900 hover:underline">
                      {comment.author?.name}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                </div>
                <div className="mt-1 ml-2">
                  <button onClick={() => setReplyingTo(comment.id)} className="text-xs text-gray-500 hover:text-primary-600 font-medium flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> Reply
                  </button>
                </div>
                
                {/* Render Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="flex gap-3">
                        <Link to={`/profile/${reply.authorId}`} className="h-6 w-6 flex-shrink-0 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs mt-1">
                          {reply.author?.name?.charAt(0) || 'U'}
                        </Link>
                        <div className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-100">
                          <div className="flex justify-between items-start mb-1">
                            <Link to={`/profile/${reply.authorId}`} className="font-medium text-xs text-gray-900 hover:underline">
                              {reply.author?.name}
                            </Link>
                          </div>
                          <p className="text-xs text-gray-800 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first!</p>
      )}
    </div>
  );
};

export default CommentSection;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Users, Search, Target, UserPlus, Check, X, Filter } from 'lucide-react';
import api from '../../services/api';

const Collaborators = () => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [recommendations, setRecommendations] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filterSkill, setFilterSkill] = useState('');
  const [filterInterest, setFilterInterest] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [requestLoading, setRequestLoading] = useState({});

  useEffect(() => {
    if (activeTab === 'recommendations') fetchRecommendations();
    else if (activeTab === 'incoming') fetchIncoming();
    else if (activeTab === 'outgoing') fetchOutgoing();
  }, [activeTab, page]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filterSkill) params.append('skill', filterSkill);
      if (filterInterest) params.append('interest', filterInterest);
      
      const { data } = await api.get(`/matching/recommendations?${params.toString()}`);
      setRecommendations(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncoming = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/matching/requests/incoming');
      setIncoming(data.data);
    } catch (err) {
      setError('Failed to load incoming requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutgoing = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/matching/requests/outgoing');
      setOutgoing(data.data);
    } catch (err) {
      setError('Failed to load outgoing requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    setRequestLoading(prev => ({ ...prev, [receiverId]: true }));
    try {
      await api.post(`/matching/requests/${receiverId}`);
      // Remove from recommendations
      setRecommendations(prev => prev.filter(r => r.id !== receiverId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequestLoading(prev => ({ ...prev, [receiverId]: false }));
    }
  };

  const handleAccept = async (requestId) => {
    setRequestLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await api.put(`/matching/requests/${requestId}/accept`);
      setIncoming(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      alert('Failed to accept request');
    } finally {
      setRequestLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId) => {
    setRequestLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await api.put(`/matching/requests/${requestId}/reject`);
      setIncoming(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      alert('Failed to reject request');
    } finally {
      setRequestLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecommendations();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-primary-600" />
          Find Collaborators
        </h1>
        <p className="mt-2 text-gray-600">Discover and connect with developers who share your interests and complement your skills.</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('recommendations'); setPage(1); }}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'recommendations' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Recommended Matches
        </button>
        <button
          onClick={() => { setActiveTab('incoming'); setPage(1); }}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'incoming' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Incoming Requests
        </button>
        <button
          onClick={() => { setActiveTab('outgoing'); setPage(1); }}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'outgoing' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent Requests
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6">
          {error}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Skill</label>
              <input
                type="text"
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                placeholder="e.g. React"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Project Interest</label>
              <input
                type="text"
                value={filterInterest}
                onChange={(e) => setFilterInterest(e.target.value)}
                placeholder="e.g. Open Source"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500"
              />
            </div>
            <button type="submit" className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>
          ) : recommendations.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.map(rec => (
                <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {rec.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <Link to={`/profile/${rec.id}`} className="text-lg font-bold text-gray-900 hover:underline">
                        {rec.name}
                      </Link>
                      <p className="text-sm text-gray-500">{rec.profile?.targetRole || 'Developer'}</p>
                    </div>
                    <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold border border-primary-100">
                      Match Score: {rec.matchScore}
                    </div>
                  </div>

                  <div className="mb-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                    <strong className="block not-italic mb-1 text-gray-900">Why it's a match:</strong>
                    {rec.explanation}
                  </div>

                  <div className="mb-6 flex-1">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {rec.skills?.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {rec.skills?.length > 5 && <span className="text-gray-500 text-xs py-1">+{rec.skills.length - 5} more</span>}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Link to={`/profile/${rec.id}`} className="flex-1 text-center bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      View Profile
                    </Link>
                    <button 
                      onClick={() => handleSendRequest(rec.id)}
                      disabled={requestLoading[rec.id]}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {requestLoading[rec.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
              <p className="mt-2 text-gray-500">We couldn't find any developers matching your criteria right now.</p>
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="flex justify-center items-center gap-4 mt-8 pt-6">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600">Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'incoming' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>
          ) : incoming.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {incoming.map(req => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {req.sender?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <Link to={`/profile/${req.sender.id}`} className="font-bold text-gray-900 hover:underline">
                        {req.sender.name}
                      </Link>
                      <p className="text-sm text-gray-500">{req.sender.profile?.targetRole || 'Developer'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAccept(req.id)}
                      disabled={requestLoading[req.id]}
                      className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg disabled:opacity-50 transition-colors"
                      title="Accept Request"
                    >
                      {requestLoading[req.id] ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleReject(req.id)}
                      disabled={requestLoading[req.id]}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors"
                      title="Reject Request"
                    >
                      {requestLoading[req.id] ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No incoming requests</h3>
              <p className="mt-2 text-gray-500">You don't have any pending collaboration requests.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'outgoing' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>
          ) : outgoing.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {outgoing.map(req => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {req.receiver?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <Link to={`/profile/${req.receiver.id}`} className="font-bold text-gray-900 hover:underline">
                        {req.receiver.name}
                      </Link>
                      <p className="text-sm text-gray-500">{req.receiver.profile?.targetRole || 'Developer'}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      req.status === 'ACCEPTED' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : req.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {req.status ? req.status.charAt(0) + req.status.slice(1).toLowerCase() : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No outgoing requests</h3>
              <p className="mt-2 text-gray-500">You haven't sent any collaboration requests yet.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Collaborators;

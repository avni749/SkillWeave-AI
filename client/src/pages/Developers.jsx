import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Loader2, Code2, MapPin } from 'lucide-react';

const Developers = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const fetchProfiles = async (query = '') => {
    try {
      setLoading(true);
      const { data } = await api.get(`/profiles/search${query}`);
      setProfiles(data.profiles);
    } catch (error) {
      console.error('Error fetching profiles', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('name', search);
    if (targetRole) params.append('targetRole', targetRole);
    fetchProfiles(`?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Developer Directory</h1>
        <p className="mt-2 text-gray-600">Find and connect with other developers.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter by role (e.g., Frontend)..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Link 
              key={profile.id} 
              to={`/profile/${profile.userId}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all p-6 block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-lg font-bold">
                  {profile.user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{profile.user.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">{profile.targetRole || 'Developer'}</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {profile.bio || 'No bio provided.'}
              </p>

              <div className="space-y-2">
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" /> {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Code2 className="w-4 h-4" /> 
                  {profile.user.userSkills?.length > 0 
                    ? profile.user.userSkills.slice(0, 3).map(us => us.skill.name).join(', ') + (profile.user.userSkills.length > 3 ? '...' : '')
                    : 'No skills listed'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No developers found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Developers;

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import GithubRepos from '../components/profile/GithubRepos';
import { Briefcase, GraduationCap, MapPin, Loader2, GitBranch, Users, Globe, Code2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const PublicProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/profiles/${id}`);
        setProfile(data.profile);
        
        // Fetch followers to check follow status
        if (user && data.profile) {
          const followersData = await api.get(`/users/${data.profile.userId}/followers`);
          const followers = followersData.data.followers;
          setIsFollowing(followers.some(f => f.id === user.id));
        }
      } catch (err) {
        setError('Profile not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <Code2 className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Developer Not Found</h2>
        <Link to="/developers" className="mt-4 text-primary-600 hover:underline">Back to Developers</Link>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.userId;

  const handleFollowToggle = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/users/${profile.userId}/follow`);
        setIsFollowing(false);
      } else {
        await api.post(`/users/${profile.userId}/follow`);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow toggle error', err);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {profile.user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.user.name}</h1>
              <p className="text-gray-500 font-medium">{profile.targetRole || 'Developer'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!isOwnProfile && user && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isFollowing 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {followLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            {isOwnProfile && (
              <Link 
                to="/profile/edit" 
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {profile.bio || 'No bio provided.'}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.user.userSkills?.length > 0 ? (
                  profile.user.userSkills.map(us => (
                    <span key={us.skillId} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100">
                      {us.skill.name} • {us.level}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills added.</span>
                )}
              </div>
            </section>

            {profile.githubUsername && (
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GitBranch className="w-5 h-5" /> GitHub Activity
                </h3>
                <GithubRepos username={profile.githubUsername} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
              {profile.location && (
                <div className="flex gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
              {profile.education && (
                <div className="flex gap-3 text-gray-600">
                  <GraduationCap className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-sm">{profile.education}</span>
                </div>
              )}
              {profile.experience && (
                <div className="flex gap-3 text-gray-600">
                  <Briefcase className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-sm">{profile.experience}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {profile.githubUsername && (
                <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                  <GitBranch className="w-6 h-6" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Users className="w-6 h-6" />
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600 transition-colors">
                  <Globe className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

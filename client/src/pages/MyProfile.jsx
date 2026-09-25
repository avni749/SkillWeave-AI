import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import GithubRepos from '../components/profile/GithubRepos';
import { Briefcase, GraduationCap, MapPin, Loader2, Edit, GitBranch, Users, Globe } from 'lucide-react';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profiles/me');
        setProfile(data.profile);
      } catch (error) {
        if (error.response?.status === 404) {
          navigate('/profile/edit'); // redirect to create
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!profile) return null;

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
          <Link 
            to="/profile/edit" 
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </Link>
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
                <a href={`https://github./${profile.githubUsername}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
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

export default MyProfile;

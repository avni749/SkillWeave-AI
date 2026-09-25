import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, Target, CheckCircle2, AlertTriangle, Map, Briefcase, FileText, History } from 'lucide-react';
import api from '../../services/api';

const AiAnalyzer = () => {
  const [formData, setFormData] = useState({
    targetRole: '',
    careerGoals: '',
    projects: '',
    education: '',
    experience: '',
    skills: ''
  });
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [profileExists, setProfileExists] = useState(true);

  // Check if user has a profile first
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data } = await api.get('/profiles/me');
        if (data.profile) {
          const profile = data.profile;
          const skillsList = profile.user?.userSkills?.map(us => us.skill.name).join(', ') || 'No skills listed';
          
          setFormData(prev => ({ 
            ...prev, 
            targetRole: profile.targetRole || '',
            education: profile.education || 'Not provided',
            experience: profile.experience || 'Not provided',
            skills: skillsList
          }));
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setProfileExists(false);
        }
      }
    };
    checkProfile();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.post('/ai/profile-analysis', formData);
      setResult(data.data.analysisResult);
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many analysis requests. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to analyze profile. Please try again.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  if (!profileExists) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Sparkles className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Profile First</h2>
        <p className="text-gray-600 mb-6">You need to set up your developer profile before our AI can analyze it.</p>
        <Link to="/profile/edit" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700">
          Set Up Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary-600" />
            AI Profile Analyzer
          </h1>
          <p className="mt-2 text-gray-600">Get personalized feedback and a learning roadmap powered by AI.</p>
        </div>
        <Link to="/ai-analyzer/history" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
          <History className="w-4 h-4" /> History
        </Link>
      </div>

      {!result && !analyzing && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
                {error}
              </div>
            )}
            
            <p className="text-sm text-gray-500 mb-4">
              Our AI analyzes the skills, education, and experience currently on your profile. Fill in the details below to give it more context.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Job Role *</label>
              <input
                type="text"
                name="targetRole"
                required
                value={formData.targetRole}
                onChange={handleChange}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Career Goals (Optional)</label>
              <textarea
                name="careerGoals"
                rows="3"
                value={formData.careerGoals}
                onChange={handleChange}
                placeholder="Where do you see yourself in 2-3 years? What kind of companies do you want to work for?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education (from profile)</label>
                <input
                  type="text"
                  disabled
                  value={formData.education}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (from profile)</label>
                <input
                  type="text"
                  disabled
                  value={formData.experience}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technical Skills (from profile)</label>
              <textarea
                disabled
                rows="2"
                value={formData.skills}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notable Projects (Optional)</label>
              <textarea
                name="projects"
                rows="3"
                value={formData.projects}
                onChange={handleChange}
                placeholder="Briefly describe 1-2 major projects you've built recently..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                disabled={analyzing}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" /> Analyze My Profile
            </button>
          </form>
        </div>
      )}

      {analyzing && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Profile...</h3>
          <p className="text-gray-500">Our AI is reviewing your skills, experience, and goals to build your personalized roadmap.</p>
        </div>
      )}

      {result && !analyzing && (
        <div className="space-y-8 fade-in">
          <div className="bg-gradient-to-r from-primary-50 to-white p-6 rounded-xl border border-primary-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Summary</h2>
            <p className="text-gray-700 leading-relaxed">{result.profileSummary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5" /> Key Strengths
              </h3>
              <ul className="space-y-2">
                {result.strengths?.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-amber-700 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" /> Skill Gaps to Address
              </h3>
              <ul className="space-y-2">
                {result.skillGaps?.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 font-bold">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4">
              <Map className="w-5 h-5" /> Learning Roadmap
            </h3>
            <div className="space-y-4 text-sm text-gray-700">
              {result.learningRoadmap?.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    {idx < result.learningRoadmap.length - 1 && <div className="w-px h-full bg-blue-100 my-1"></div>}
                  </div>
                  <div className="pt-1 pb-4">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-purple-700 flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5" /> Project Recommendations
              </h3>
              <ul className="space-y-3">
                {result.projectRecommendations?.map((proj, idx) => (
                  <li key={idx} className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {proj}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" /> Suggested Professional Bio
              </h3>
              <div className="space-y-4">
                {result.bioSuggestions?.map((bio, idx) => (
                  <div key={idx} className="text-sm text-gray-700 italic border-l-4 border-primary-500 pl-4 py-1">
                    "{bio}"
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <button 
              onClick={() => setResult(null)} 
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Run Another Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAnalyzer;

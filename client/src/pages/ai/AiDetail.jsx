import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Target, CheckCircle2, AlertTriangle, Map, Briefcase, FileText, Trash2 } from 'lucide-react';
import api from '../../services/api';

const AiDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data } = await api.get(`/ai/profile-analysis/${id}`);
        setAnalysis(data.data);
      } catch (err) {
        setError('Analysis not found or access denied');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;
    setDeleting(true);
    try {
      await api.delete(`/ai/profile-analysis/${id}`);
      navigate('/ai-analyzer/history');
    } catch (err) {
      console.error('Failed to delete', err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 inline-block mb-4">
          {error}
        </div>
        <div>
          <Link to="/ai-analyzer/history" className="text-primary-600 hover:underline">Back to History</Link>
        </div>
      </div>
    );
  }

  const result = analysis.analysisResult;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Link to="/ai-analyzer/history" className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary-600" />
              {analysis.targetRole}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button 
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors"
          title="Delete Analysis"
        >
          {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
      </div>

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
      </div>
    </div>
  );
};

export default AiDetail;

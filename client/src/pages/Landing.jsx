import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, Code, Users, Zap } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Landing = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl">
          Weave your skills into <span className="text-primary-600">opportunity.</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
          SkillWeave AI is the ultimate developer platform for networking, collaboration, and AI-powered career growth. Discover matches that complement your tech stack.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition flex items-center gap-2 shadow-lg shadow-primary-500/30">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition">
            Sign In
          </Link>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="bg-white py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Developer Matching</h3>
              <p className="text-gray-500">Find the perfect collaborator based on overlapping interests and complementary tech stacks.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">GitHub Integration</h3>
              <p className="text-gray-500">Sync your repositories directly to your profile and showcase your open-source contributions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Profile Analysis</h3>
              <p className="text-gray-500">Get AI-generated feedback on your skills and custom roadmaps to land your target role.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

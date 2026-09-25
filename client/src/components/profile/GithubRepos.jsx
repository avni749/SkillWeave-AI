import { useState, useEffect } from 'react';
import api from '../../services/api';
import { GitBranch, Star, GitFork, ExternalLink, Loader2 } from 'lucide-react';

const GithubRepos = ({ username }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchRepos = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/github/${username}/repos`);
        setRepos(data.data.slice(0, 5)); // Show top 5
      } catch (err) {
        setError('Failed to load GitHub repositories.');
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [username]);

  if (!username) return null;

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
  }

  if (repos.length === 0) {
    return <div className="text-gray-500 p-4">No public repositories found.</div>;
  }

  return (
    <div className="space-y-4">
      {repos.map(repo => (
        <div key={repo.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors bg-white">
          <div className="flex justify-between items-start">
            <div>
              <a 
                href={repo.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg font-semibold text-primary-600 hover:underline flex items-center gap-2"
              >
                <GitBranch className="w-4 h-4" />
                {repo.name}
              </a>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{repo.description || 'No description provided.'}</p>
            </div>
            <a 
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            {repo.language && (
              <span className="flex items-center gap-1 font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" /> {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-4 h-4" /> {repo.forks_count}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GithubRepos;

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes cache

export const getGithubProfile = async (req, res) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }

  const cacheKey = `github_profile_${username}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return res.status(200).json({ success: true, data: cachedData, cached: true });
  }

  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SkillWeave-AI-Backend'
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/users/${username}`, { headers });
    
    if (response.status === 404) {
      return res.status(404).json({ success: false, message: 'GitHub user not found' });
    }
    
    if (response.status === 403) {
      return res.status(429).json({ success: false, message: 'GitHub API rate limit exceeded' });
    }

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Pick only public profile information to expose
    const profileInfo = {
      login: data.login,
      id: data.id,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
      name: data.name,
      company: data.company,
      blog: data.blog,
      location: data.location,
      bio: data.bio,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      created_at: data.created_at
    };

    cache.set(cacheKey, profileInfo);

    res.status(200).json({ success: true, data: profileInfo, cached: false });
  } catch (error) {
    console.error('GitHub Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch GitHub profile' });
  }
};

export const getGithubRepos = async (req, res) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }

  const cacheKey = `github_repos_${username}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return res.status(200).json({ success: true, data: cachedData, cached: true });
  }

  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SkillWeave-AI-Backend'
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, { headers });
    
    if (response.status === 404) {
      return res.status(404).json({ success: false, message: 'GitHub user not found' });
    }
    
    if (response.status === 403) {
      return res.status(429).json({ success: false, message: 'GitHub API rate limit exceeded' });
    }

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const data = await response.json();
    
    const reposInfo = data.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      language: repo.language,
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count,
      updated_at: repo.updated_at
    }));

    cache.set(cacheKey, reposInfo);

    res.status(200).json({ success: true, data: reposInfo, cached: false });
  } catch (error) {
    console.error('GitHub Repos Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch GitHub repositories' });
  }
};

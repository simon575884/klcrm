import { useState } from 'react';
import axios from 'axios';
import { Wrench } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { username, password });
      onLogin(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkBg via-darkCard to-darkBg flex items-center justify-center p-4">
      <div className="bg-darkCard border border-borderColor rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-danger rounded-full mb-4">
            <Wrench className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-textPrimary mb-2">K&L Auto Repair</h1>
          <p className="text-textSecondary">24 Hour Mobile Tire & Roadside Service</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm animate-slide-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-sm text-textSecondary text-center space-y-1">
          <p>📞 Contact: 803-477-1467</p>
          <p>📧 klmobileexp@yahoo.com</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

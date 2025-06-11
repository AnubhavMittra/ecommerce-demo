import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface AuthFormProps {
  mode: 'signin' | 'register';
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let response;
      if (mode === 'signin') {
        response = await fetch('http://localhost:8081/api/v1/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
      } else {
        response = await fetch('http://localhost:8081/api/v1/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password })
        });
      }
      const data = await response.json();
      console.log('Response data:', data);
      if (!response.ok) throw new Error(data.message || 'Authentication failed');

      if (data.token) {
        localStorage.setItem('jwt', data.token);
      }
    
      login(data.token || 'demo-token', { name: data.firstName || data.username || email });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
      <h2 className="text-xl font-bold mb-4">{mode === 'signin' ? 'Sign In' : 'Register'}</h2>
      {mode === 'register' && (
        <>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="mb-3 w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="mb-3 w-full border rounded px-3 py-2"
            required
          />
        </>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="mb-3 w-full border rounded px-3 py-2"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="mb-3 w-full border rounded px-3 py-2"
        required
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        disabled={loading}
      >
        {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Register'}
      </button>
    </form>
  );
};

export default AuthForm;

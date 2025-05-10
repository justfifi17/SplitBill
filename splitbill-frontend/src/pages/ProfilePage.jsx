import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, updateEmail, updatePassword, updateProfile, signOut } from 'firebase/auth';
import { FaHome, FaUsers, FaUser } from 'react-icons/fa';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      if (password) {
        await updatePassword(user, password);
      }
      setMessage('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError('Failed to log out.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between pb-20">

      <main className="flex-1 w-full max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-600">
              {name.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h2 className="mt-3 text-lg font-semibold">{name || 'Your Name'}</h2>
            <p className="text-xs text-gray-600">{email}</p>
          </div>

          {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm mb-2 text-center">{message}</p>}

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Leave blank to keep unchanged"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="mt-5 w-full py-2 px-4 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600"
          >
            Log Out
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around items-center h-16">
        <button onClick={() => navigate('/home')} className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <FaHome className="text-xl" />
          <span className="text-xs">Home</span>
        </button>
        <button onClick={() => navigate('/friends')} className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <FaUsers className="text-xl" />
          <span className="text-xs">Friends</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center text-blue-600">
          <FaUser className="text-xl" />
          <span className="text-xs">Profile</span>
        </button>
      </nav>
    </div>
  );
}

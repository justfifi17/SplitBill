import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FaHome, FaUsers, FaUser, FaUserFriends } from 'react-icons/fa';
import axios from 'axios';

export default function FriendsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const res = await axios.get(`https://splitbill-api.onrender.com/api/groups/my-groups`, {
            headers: {
              Authorization: `Bearer ${await currentUser.getIdToken()}`,
            },
          });

          const emails = new Set();
          res.data.forEach(group => {
            group.transactions.forEach(tx => {
              if (tx.paidBy.email && tx.paidBy.uid !== currentUser.uid) {
                emails.add(tx.paidBy.email);
              }
              tx.participants.forEach(p => {
                if (p.email && p.uid !== currentUser.uid) {
                  emails.add(p.email);
                }
              });
            });
            group.members.forEach(member => {
              if (member.email && member.uid !== currentUser.uid) {
                emails.add(member.email);
              }
            });
          });
          setFriends([...emails]);
        } catch (err) {
          console.error('Error loading friends:', err);
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="w-full bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-700">SplitBill</h1>
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto px-4 mt-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Friends</h2>

        <section className="mb-6">
          <h3 className="text-md font-semibold mb-2">Your Friends</h3>
          {friends.length === 0 ? (
            <p className="text-sm text-gray-500">No shared users found.</p>
          ) : (
            <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
              {friends.map((email, idx) => (
                <li key={idx}>{email}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-md font-semibold mb-2">Add a Friend</h3>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter friend's email"
            className="w-full p-2 border border-gray-300 rounded-lg mb-3"
          />
          <button
            onClick={handleInvite}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Send Invite
          </button>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around items-center h-16">
        <button onClick={() => navigate('/home')} className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <FaHome className="text-xl" />
          <span className="text-xs">Home</span>
        </button>
        <button onClick={() => navigate('/friends')} className="flex flex-col items-center text-blue-600">
          <FaUserFriends className="text-xl" />
          <span className="text-xs">Friends</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <FaUser className="text-xl" />
          <span className="text-xs">Profile</span>
        </button>
      </nav>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaPlane, FaUtensils, FaShoppingCart, FaBriefcase, FaUserFriends,
  FaUser, FaHome, FaHeart, FaMusic, FaBook, FaSearch, FaPlus
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const HomePage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [friendOptions, setFriendOptions] = useState([
    'mine@gmail.com',
    'test@gmail.com',
    'mike@splitbill.com',
    'def@gmail.com',
    'jessiii@gmail.com',
    'abc@gmail.com'
  ]);

  const [userBalance, setUserBalance] = useState({
    owed: 0,
    owes: 0,
    total: 0
  });

  const userId = 'ctEaRg3hmOeZZBgpD62ryijwqAz1';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://splitbill-api.onrender.com/api/groups/my-groups');
        setGroups(res.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load groups');
        setLoading(false);
      }
    };

    const fetchBalance = async () => {
      try {
        const auth = getAuth();
        const token = await auth.currentUser.getIdToken();

        const res = await axios.get('https://splitbill-api.onrender.com/api/transactions/my-balance', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserBalance(res.data);
      } catch (err) {
        console.error('Failed to fetch balance', err);
      }
    };

    fetchData();
    fetchBalance();
  }, []);

  const filteredGroups = groups.filter(group =>
    group.groupName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconForGroup = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('trip') || lower.includes('travel')) return <FaPlane className="text-blue-600" />;
    if (lower.includes('food') || lower.includes('dinner') || lower.includes('lunch')) return <FaUtensils className="text-blue-600" />;
    if (lower.includes('shopping') || lower.includes('groceries')) return <FaShoppingCart className="text-blue-600" />;
    if (lower.includes('work') || lower.includes('project')) return <FaBriefcase className="text-blue-600" />;
    if (lower.includes('love') || lower.includes('date')) return <FaHeart className="text-blue-600" />;
    if (lower.includes('music')) return <FaMusic className="text-blue-600" />;
    if (lower.includes('book') || lower.includes('study')) return <FaBook className="text-blue-600" />;
    return <FaUsers className="text-blue-600" />;
  };

  const handleCreateGroup = () => {
    if (!newGroupName || selectedMembers.length === 0) return;
    const members = [userId, ...selectedMembers];
    axios.post('https://splitbill-api.onrender.com/api/groups/create', {
      groupName: newGroupName,
      members
    }).then(() => {
      setShowModal(false);
      setNewGroupName('');
      setSelectedMembers([]);
      setGroups([]);
      setLoading(true);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }).catch(err => console.error(err));
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-20">
        <h1 className="text-xl font-bold">SplitBill</h1>
      </header>

      <div className="bg-gray-100 z-10 sticky top-14 px-4">
        <div className="relative mt-4">
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <section className="bg-blue-700 text-white rounded-xl mt-4 p-4 shadow-md">
          <div className="text-xs text-white/80 font-medium">Total Balance</div>
          <div className="text-lg font-bold mb-1">${userBalance.total.toFixed(2)}</div>
          <div className="flex justify-between items-start text-sm font-semibold mt-1">
            <div className="text-left">
              <div className="text-xs text-white/70">You owe</div>
              <div className="text-lg font-bold text-white">${userBalance.owes.toFixed(2)}</div>
            </div>
            <div className="h-8 border-r border-white/40 mx-4"></div>
            <div className="text-right">
              <div className="text-xs text-white/70">You are owed</div>
              <div className="text-lg font-bold text-white">${userBalance.owed.toFixed(2)}</div>
            </div>
          </div>
        </section>
      </div>

      <main className="flex-1 overflow-y-auto px-4 mt-4">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md flex items-center gap-1"
          >
            <FaPlus /> Add Group
          </button>
        </div>
        <h2 className="text-sm text-gray-700 font-semibold uppercase tracking-wide mb-2">Your Groups</h2>

        {loading && <p className="text-center text-sm text-gray-600">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && filteredGroups.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No groups found</p>
        )}

        <div className="space-y-4 pb-24">
          {filteredGroups.map((group) => (
            <div
              key={group._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                {getIconForGroup(group.groupName)}
                <div className="flex flex-col">
                  <h2 className="text-base font-semibold">{group.groupName}</h2>
                  <p className="text-xs text-gray-400">{group.members?.length || 0} members</p>
                </div>
              </div>
              <div className="text-right">
                <Link
                  to={`/groups/${group._id}`}
                  className="text-xs px-2 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded-xl shadow-md w-11/12 max-w-md">
            <h2 className="text-lg font-bold mb-4">Create New Group</h2>
            <input
              type="text"
              placeholder="Group name"
              className="w-full border px-3 py-2 mb-3 rounded-md"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Select members</label>
              <select
                multiple
                value={selectedMembers}
                onChange={(e) =>
                  setSelectedMembers([...e.target.selectedOptions].map(o => o.value))
                }
                className="w-full border px-3 py-2 rounded-md h-32"
              >
                {friendOptions.map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-1 border rounded-md">Cancel</button>
              <button onClick={handleCreateGroup} className="px-4 py-1 bg-blue-600 text-white rounded-md">Create</button>
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md p-2 flex justify-around">
        <button className="flex flex-col items-center text-blue-500 text-xs font-semibold">
          <FaHome className="w-5 h-5 mb-0.5" />
          Home
        </button>
        <button onClick={() => navigate('/friends')} className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <FaUserFriends className="text-xl" />
          <span className="text-xs">Friends</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center text-gray-400 text-xs"
        >
          <FaUser className="w-5 h-5 mb-0.5" />
          Profile
        </button>
      </footer>
    </div>
  );
};

export default HomePage;

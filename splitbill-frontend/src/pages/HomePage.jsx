import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaPlane,
  FaUtensils,
  FaShoppingCart,
  FaBriefcase,
  FaUserFriends,
  FaUser,
  FaHome,
  FaHeart,
  FaMusic,
  FaBook,
  FaSearch
} from 'react-icons/fa';
import { Link } from 'react-router-dom';


const HomePage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [youOwe, setYouOwe] = useState(0);
  const [youAreOwed, setYouAreOwed] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const userId = 'ctEaRg3hmOeZZBgpD62ryijwqAz1'; // Replace dynamically in production

  useEffect(() => {
    axios
      .get('https://splitbill-api.onrender.com/api/groups/my-groups')
      .then((res) => {
        const groupsData = res.data || [];
        setGroups(groupsData);

        let totalOwe = 0;
        let totalOwed = 0;

        groupsData.forEach(group => {
          if (Array.isArray(group.transactions)) {
            group.transactions.forEach(tx => {
              if (tx.paidBy === userId) {
                tx.splitAmong.forEach(split => {
                  if (split.user !== userId) {
                    totalOwed += split.amount;
                  }
                });
              } else {
                const userSplit = tx.splitAmong.find(s => s.user === userId);
                if (userSplit) {
                  totalOwe += userSplit.amount;
                }
              }
            });
          }
        });

        setYouOwe(totalOwe);
        setYouAreOwed(totalOwed);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load groups');
        setLoading(false);
      });
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

  const calculateGroupBalance = (group) => {
    let owe = 0;
    let owed = 0;
    if (Array.isArray(group.transactions)) {
      group.transactions.forEach(tx => {
        if (tx.paidBy === userId) {
          tx.splitAmong.forEach(split => {
            if (split.user !== userId) owed += split.amount;
          });
        } else {
          const userSplit = tx.splitAmong.find(s => s.user === userId);
          if (userSplit) owe += userSplit.amount;
        }
      });
    }
    return owed - owe;
  };

  const totalBalance = youAreOwed - youOwe;

  return (
    <div className="min-h-screen bg-gray-100 pb-20 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold">SplitBill</h1>
      </header>

      {/* Sticky Top UI */}
      <div className="bg-gray-100 z-10 sticky top-14 px-4">
        {/* Search Bar */}
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

        {/* Balance Summary */}
        <section className="bg-blue-700 text-white rounded-xl mt-4 p-4 shadow-md">
          <div className="text-lg font-bold mb-1">${totalBalance.toFixed(2)}</div>
          <div className="text-xs text-white/80 font-medium mb-3">Total Balance</div>
          <div className="flex justify-between items-start text-sm font-semibold mt-1">
            <div className="text-left">
              <div className="text-xs text-white/70">You owe</div>
              <div className="text-lg font-bold text-white">${youOwe.toFixed(2)}</div>
            </div>
            <div className="h-8 border-r border-white/40 mx-4"></div>
            <div className="text-right">
              <div className="text-xs text-white/70">You are owed</div>
              <div className="text-lg font-bold text-white">${youAreOwed.toFixed(2)}</div>
            </div>
          </div>
        </section>
      </div>

      {/* Scrollable Groups Section */}
      <main className="flex-1 overflow-y-auto px-4 mt-4">
        <h2 className="text-sm text-gray-700 font-semibold uppercase tracking-wide mb-2">Your Groups</h2>

        {loading && <p className="text-center text-sm text-gray-600">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && filteredGroups.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No groups found</p>
        )}

        <div className="space-y-4 pb-24">
          {filteredGroups.map((group) => {
            const balance = calculateGroupBalance(group);
            return (
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
                  <p
                    className={`text-sm font-bold mb-1 ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}
                  >
                    {balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : `$${balance.toFixed(2)}`}
                  </p>
                  <Link
                  to={`/groups/${group._id}`}
                  className="text-xs px-2 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-center"
                >
                  View Details
                </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md p-2 flex justify-around">
        <button className="flex flex-col items-center text-blue-500 text-xs font-semibold">
          <FaHome className="w-5 h-5 mb-0.5" />
          Home
        </button>
        <button className="flex flex-col items-center text-gray-400 text-xs">
          <FaUsers className="w-5 h-5 mb-0.5" />
          Groups
        </button>
        <button className="flex flex-col items-center text-gray-400 text-xs">
          <FaUserFriends className="w-5 h-5 mb-0.5" />
          Friends
        </button>
        <button
          onClick={() => {
            console.log('Navigating to profile from HomePage...');
            navigate('/profile');
          }}
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

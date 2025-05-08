import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaHome, FaUsers, FaUser, FaUserFriends } from 'react-icons/fa';

const GroupDetailsPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const res = await axios.get(
          `https://splitbill-api.onrender.com/api/groups/${groupId}`
        );
        setGroup(res.data.group);
        setTransactions(res.data.transactions);
        setUsers(res.data.users);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load group details');
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const getName = (userId) => {
    if (!Array.isArray(users)) return userId;
    const user = users.find((u) => u._id === userId);
    return user ? user.name : userId;
  };

  const getBalanceText = (tx, userId) => {
    if (tx.paidBy === userId) {
      let owed = 0;
      tx.splitAmong.forEach((split) => {
        if (split.user !== userId) owed += split.amount;
      });
      return { amount: `+$${owed.toFixed(2)}`, color: 'text-green-600' };
    } else {
      const share = tx.splitAmong.find((s) => s.user === userId);
      if (share) {
        return { amount: `-$${share.amount.toFixed(2)}`, color: 'text-red-500' };
      }
    }
    return { amount: '$0.00', color: 'text-gray-400' };
  };

  const currentUserId = 'ctEaRg3hmOeZZBgpD62ryijwqAz1'; // Replace with actual auth ID in real app

  return (
    <div className="min-h-screen bg-gray-100 pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{'SplitBill'}</h1>
        <h1 className="text-xl font-bold text-blue-600">{group?.groupName}</h1>
        <button className="text-gray-600">
          <FaArrowLeft />
        </button>
      </header>

      {/* Group Members */}
      <section className="bg-white px-4 py-4 border-b overflow-x-auto">
        <div className="flex gap-4">
          {Array.isArray(users) && users.map((user) => (
            <div key={user._id} className="flex flex-col items-center text-sm">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <FaUser className="text-sm" />
              </div>
              <span className="text-xs mt-1 text-center w-16 truncate">{user.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Transactions */}
      <main className="flex-1 overflow-y-auto px-4 py-3">
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && Array.isArray(transactions) && transactions.length === 0 && (
          <p className="text-center text-gray-400">No transactions yet</p>
        )}
        <div className="space-y-4">
          {Array.isArray(transactions) && transactions.map((tx) => {
            const balance = getBalanceText(tx, currentUserId);
            return (
              <div
                key={tx._id}
                className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex justify-between items-start"
              >
                <div>
                  <h3 className="font-semibold text-base text-gray-800">{tx.description}</h3>
                  <p className="text-sm text-gray-500">
                    Paid by: <span className="text-gray-700 font-medium">{getName(tx.paidBy)}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Total: <span className="font-semibold">${tx.totalAmount.toFixed(2)}</span>
                  </p>
                </div>
                <div className={`text-base font-semibold ${balance.color}`}>
                  {balance.amount}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md p-2 flex justify-around">
        <button className="flex flex-col items-center text-gray-400 text-xs">
          <FaHome className="w-5 h-5 mb-0.5" />
          Home
        </button>
        <button className="flex flex-col items-center text-blue-500 text-xs font-semibold">
          <FaUsers className="w-5 h-5 mb-0.5" />
          Groups
        </button>
        <button className="flex flex-col items-center text-gray-400 text-xs">
          <FaUserFriends className="w-5 h-5 mb-0.5" />
          Friends
        </button>
        <button className="flex flex-col items-center text-gray-400 text-xs">
          <FaUser className="w-5 h-5 mb-0.5" />
          Profile
        </button>
      </footer>
    </div>
  );
};

export default GroupDetailsPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaHome, FaUsers, FaUser, FaUserFriends, FaPlus } from 'react-icons/fa';
import EditTransactionModal from '../components/EditTransactionModal';

const GroupDetailsPage = () => {
  const [editingTx, setEditingTx] = useState(null);
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUserId = 'ctEaRg3hmOeZZBgpD62ryijwqAz1';

  const fetchGroupDetails = async () => {
    try {
      const res = await axios.get(`https://splitbill-api.onrender.com/api/groups/${groupId}`);
      setGroup(res.data.group);

      if (!res.data.group.members.includes(currentUserId)) {
        alert("You are not a member of this group.");
        navigate('/groups');
        return;
      }

      setTransactions(res.data.transactions);
      setUsers(res.data.users);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load group details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId, navigate]);

  const getName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : userId;
  };

  const getBalanceText = (tx, userId) => {
    const uid = userId.toString();
    const paidById = tx.paidBy?.toString();

    if (paidById === uid) {
      let totalOwed = 0;
      tx.splitAmong?.forEach((split) => {
        if (split.user?.toString() !== uid) {
          totalOwed += split.amount;
        }
      });
      return {
        amount: totalOwed > 0 ? `$${totalOwed.toFixed(2)}` : '$0.00',
        color: totalOwed > 0 ? 'text-green-600' : 'text-gray-400',
      };
    }

    const yourShare = tx.splitAmong?.find((s) => s.user?.toString() === uid);
    if (yourShare) {
      return {
        amount: `-$${yourShare.amount.toFixed(2)}`,
        color: 'text-red-500',
      };
    }

    return { amount: '$0.00', color: 'text-gray-400' };
  };

  const handleSettle = async (transactionId) => {
    try {
      await axios.patch(`https://your-api/transactions/${transactionId}/settle`);
      fetchGroupDetails();
    } catch (err) {
      console.error('Failed to settle transaction', err);
    }
  };

  const handleDelete = async (transactionId) => {
    try {
      await axios.delete(`https://your-api/transactions/${transactionId}`);
      fetchGroupDetails();
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold">SplitBill</h1>
        <button className="text-gray-600" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
      </header>

      {/* Group Name */}
      <div className="px-4 pt-4">
        <h2 className="text-base font-semibold text-gray-800">
          {group?.groupName || 'Group Details'}
        </h2>
      </div>

      {/* Group Members */}
      {Array.isArray(users) && users.length > 0 && (
        <div className="mt-3 px-4 pb-2">
          <div className="flex gap-4 w-max">
            {users
              .filter((u) => group?.members?.includes(u._id))
              .map((user, index) => {
                const pastelPalette = ['#cce5ff', '#d1d8ff', '#cde0f6', '#d6e4ff', '#ccf0e1', '#f0e8ff', '#d9f0ff'];
                const textPalette = ['#2c74b3', '#4e4edb', '#3673ac', '#30506d', '#2b7b66', '#5e3b8c', '#39789d'];
                const paletteIndex = index % pastelPalette.length;
                const bgColor = pastelPalette[paletteIndex];
                const textColor = textPalette[paletteIndex];

                const initials = user.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';
                const displayName = user.name.includes('@') ? user.name.split('@')[0] : user.name;

                return (
                  <div key={user._id} className="flex flex-col items-center text-sm" title={displayName}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm font-bold"
                      style={{ backgroundColor: bgColor, color: textColor }}
                    >
                      {initials}
                    </div>
                    <span className="text-xs mt-1 text-center w-16 truncate">{displayName}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Transactions */}
      <main className="flex-1 overflow-y-auto px-4 py-4 mt-2">
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="space-y-4">
            {transactions
              .filter((tx) => {
                const uid = currentUserId.toString();
                const isPayer = tx.paidBy?.toString() === uid;
                const isParticipant = tx.splitAmong?.some((s) => s.user?.toString() === uid);
                return isPayer || isParticipant;
              })
              .map((tx) => {
                const balance = getBalanceText(tx, currentUserId);
                const paidByName = tx.paidBy?.toString() === currentUserId ? 'You' : getName(tx.paidBy);

                return (
                  <div key={tx._id} className="relative bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition">
                    <div>
                      <h3 className="font-semibold text-base text-gray-800">{tx.description}</h3>
                      <p className="text-sm text-gray-500">
                        Paid by: <span className="text-gray-700 font-medium">{paidByName}</span>
                      </p>
                      {tx.receiptUrl && (
                        <a
                          href={tx.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 mt-1 inline-block"
                        >
                          🧾 Receipt
                        </a>
                      )}


                      

                      {/* Extra cent info */}
                      {tx.remainingCent > 0 && tx.extraCentDecision && (
                        <div className={`mt-2 px-3 py-0.5 rounded-full text-xs flex items-center gap-1.5 border ${tx.extraCentDecision === 'donate' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                          <span className="text-sm">💰</span>
                          <span>
                            Extra cent: {tx.extraCentDecision === 'donate' ? 'Donated to group fund' : `Paid by ${tx.extraCentWinner?.toString() === currentUserId ? 'you' : getName(tx.extraCentWinner)}`}
                          </span>
                        </div>
                      )}

                      {/* Settle/Delete buttons */}
                      <div className="mt-3 flex gap-2 text-xs right-3">
                        <button
                          onClick={() =>  navigate(`/add-expense/${groupId}?edit=${tx._id}`)}
                          className="absolute bottom-6 right-4 px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-center"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    <div className={`text-base font-semibold ${balance.color}`}>
                      {balance.amount}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </main>
      <EditTransactionModal
        isOpen={!!editingTx}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onUpdated={fetchGroupDetails}
      />


      {/* Add Expense Button */}
      <button
        onClick={() => navigate(`/groups/${groupId}/add-expense`)}
        className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg z-50"
        title="Add Expense"
      >
        <FaPlus className="w-5 h-5" />
      </button>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md p-2 flex justify-around z-40" style={{ backgroundColor: '#fff', borderTop: '2px solid #ccc' }}>
        <button onClick={() => navigate('/')} className="flex flex-col items-center text-gray-400 text-xs">
          <FaHome className="w-5 h-5 mb-0.5" />
          Home
        </button>
        <button onClick={() => navigate('/groups')} className="flex flex-col items-center text-blue-500 text-xs font-semibold">
          <FaUsers className="w-5 h-5 mb-0.5" />
          Groups
        </button>
        <button onClick={() => navigate('/friends')} className="flex flex-col items-center text-gray-400 text-xs">
          <FaUserFriends className="w-5 h-5 mb-0.5" />
          Friends
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center text-gray-400 text-xs">
          <FaUser className="w-5 h-5 mb-0.5" />
          Profile
        </button>
      </footer>
    </div>
  );
};

export default GroupDetailsPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddExpensePage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitWith, setSplitWith] = useState([]);
  const [paidBy, setPaidBy] = useState('');
  const [extraCentOption, setExtraCentOption] = useState('donate');
  const [winner, setWinner] = useState(null);
  const currentUserId = 'ctEaRg3hmOeZZBgpD62ryijwqAz1';

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const res = await axios.get(
          `https://splitbill-api.onrender.com/api/groups/${groupId}`
        );
        setGroup(res.data.group);
        setUsers(res.data.users.filter((u) => res.data.group.members.includes(u._id)));
        setSplitWith(res.data.group.members);
        setPaidBy(currentUserId);
      } catch (err) {
        console.error('Error fetching group data:', err);
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  const handleSplitChange = (userId) => {
    setSplitWith((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = parseFloat(amount);
    const baseAmount = Math.floor((total / splitWith.length) * 100) / 100;
    const remainingCent = +(total - baseAmount * splitWith.length).toFixed(2);

    let extraCentWinner = null;
    if (extraCentOption === 'game' && remainingCent > 0) {
      const spinDuration = 2000;
      const randomIndex = Math.floor(Math.random() * splitWith.length);
      const chosen = splitWith[randomIndex];
      setWinner('spinning');
      setTimeout(() => {
        setWinner(chosen);
        setTimeout(() => navigate(`/groups/${groupId}`), 2500);
      }, spinDuration);
      extraCentWinner = chosen;
    }

    const payload = {
      groupId,
      description,
      totalAmount: total,
      paidBy,
      splitAmong: splitWith.map((id) => ({ user: id, amount: baseAmount })),
      remainingCent,
      extraCentDecision: extraCentOption,
      extraCentWinner: extraCentWinner,
    };

    try {
      await axios.post('https://splitbill-api.onrender.com/api/transactions/add', payload);
if (!(extraCentOption === 'game' && remainingCent > 0)) {
  setTimeout(() => navigate(`/groups/${groupId}`), 3000);
}
    } catch (err) {
      console.error('Failed to submit expense:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-lg font-bold mb-4 text-blue-700">Add Expense</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <input
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Pizza, Taxi, Movie"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Paid By</label>
            <select
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user._id === currentUserId ? 'You' : user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Split With</label>
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center space-x-2 text-sm px-3 py-1 rounded-full border border-gray-200 bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={splitWith.includes(user._id)}
                    onChange={() => handleSplitChange(user._id)}
                  />
                  <span>{user._id === currentUserId ? 'You' : user.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Handle Remaining Cent</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="donate"
                  checked={extraCentOption === 'donate'}
                  onChange={() => setExtraCentOption('donate')}
                />
                <span>Donate</span>
              </label>
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="game"
                  checked={extraCentOption === 'game'}
                  onChange={() => setExtraCentOption('game')}
                />
                <span>Game 🎲</span>
              </label>
            </div>
            {winner && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center text-center shadow-sm animate-fade-in">
                {winner === 'spinning' ? (
                  <>
                    <span className="text-5xl animate-spin duration-[1000ms] mb-2">🎲</span>
                    <p className="text-sm text-blue-600 font-semibold">Rolling the unlucky name...</p>
                  </>
                ) : (
                  <>
                    <span className="text-5xl mb-2">🎲</span>
                    {(() => {
  const name = users.find((u) => u._id === winner)?.name || 'Someone';
  const messages = [
    `Welp... someone's luck just ran out. Sorry, ${name} 😅`,
    `🎯 And the winner (of 1¢ debt) is... ${name}! 🥲`,
    `The universe has chosen... ${name}. Please clap 👏`,
    `Plot twist: ${name} owes a whole extra cent! 😬`,
    `Sorry ${name}, but hey... character development 😆`,
    `Better luck next bill, ${name} 🍀`,
    `Everyone hold a moment of silence for ${name} 😔`,
    `🪙 Destiny flips a coin... and ${name} loses`,
    `🔥 Sacrifice made. Thank you, ${name}, for your 1¢ donation`,
    `Congrats ${name}, you’ve been randomly taxed 🎉`
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  return <p className="text-md text-blue-800 font-semibold">{msg}</p>;
})()}
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
          >
            Submit Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpensePage;

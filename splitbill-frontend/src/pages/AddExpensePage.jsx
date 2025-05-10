import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddExpensePage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const editTxId = query.get('edit');

  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitWith, setSplitWith] = useState([]);
  const [paidBy, setPaidBy] = useState('');
  const [extraCentOption, setExtraCentOption] = useState('donate');
  const [winner, setWinner] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const currentUserId = 'ctEaRg3hmOeZZBgpD62ryijwqAz1';

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const res = await axios.get(`https://splitbill-api.onrender.com/api/groups/${groupId}`);
        setGroup(res.data.group);
        const filteredUsers = res.data.users.filter((u) => res.data.group.members.includes(u._id));
        setUsers(filteredUsers);
        setSplitWith(res.data.group.members);
        setPaidBy(currentUserId);
      } catch (err) {
        console.error('Error fetching group data:', err);
      }
    };

    const fetchTransactionDetails = async () => {
      try {
        const res = await axios.get(
          `https://splitbill-api.onrender.com/api/transactions/${editTxId}`
        );
        const tx = res.data.transaction;
        setDescription(tx.title);
        setAmount(tx.totalAmount);
        setPaidBy(tx.paidBy);
        setSplitWith(tx.participants);
        setReceiptUrl(tx.receiptUrl || '');
      } catch (err) {
        console.error('Error fetching transaction:', err);
      }
    };

    fetchGroupDetails();
    if (editTxId) fetchTransactionDetails();
  }, [groupId, editTxId]);

  const handleSplitChange = (userId) => {
    setSplitWith((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleFileUpload = async () => {
    if (!receiptFile) return '';
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);

      const res = await axios.post(
        'https://splitbill-api.onrender.com/api/uploads/receipt',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setUploading(false);
      setReceiptUrl(res.data.receiptUrl);
      return res.data.receiptUrl;
    } catch (err) {
      console.error('Receipt upload failed:', err);
      setUploading(false);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const total = parseFloat(amount);
    const baseAmount = Math.floor((total / splitWith.length) * 100) / 100;
    const remainingCent = +(total - baseAmount * splitWith.length).toFixed(2);

    const uploadedReceiptUrl = receiptFile ? await handleFileUpload() : receiptUrl;

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
      extraCentWinner,
      receiptUrl: uploadedReceiptUrl || '',
    };

    try {
      if (editTxId) {
        await axios.put(
          `https://splitbill-api.onrender.com/api/transactions/${editTxId}`,
          payload
        );
      } else {
        await axios.post('https://splitbill-api.onrender.com/api/transactions/add', payload);
      }
      if (!(extraCentOption === 'game' && remainingCent > 0)) {
        navigate(`/groups/${groupId}`);
      }
    } catch (err) {
      console.error('Failed to submit expense:', err);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this expense?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://splitbill-api.onrender.com/api/transactions/${editTxId}`);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleSettle = async () => {
    try {
      await axios.put(`https://splitbill-api.onrender.com/api/transactions/settle/${editTxId}`);
      alert('Transaction settled!');
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error('Failed to settle transaction:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-blue-700 text-center">
          {editTxId ? 'Edit Expense' : 'Add New Expense'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600">Description</label>
            <input
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600">Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600">Paid By</label>
            <select
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
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

          {/* Split With */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-600">Split With</label>
            <div className="flex flex-wrap gap-3">
              {users.map((user) => (
                <label
                  key={user._id}
                  className={`flex items-center space-x-2 text-sm px-4 py-2 rounded-full shadow-sm ${
                    splitWith.includes(user._id)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  } cursor-pointer transition duration-200`}
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

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600">Attach Receipt</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReceiptFile(e.target.files[0])}
              className="block w-full text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg p-2"
            />
            {uploading && <p className="text-sm text-blue-500 mt-2">Uploading receipt...</p>}
            {receiptUrl && (
              <img
                src={receiptUrl}
                alt="Receipt Preview"
                className="mt-3 rounded shadow-md max-h-48 object-contain"
              />
            )}
          </div>

          {/* Cent Resolution */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600">
              Handle Remaining Cent
            </label>
            <div className="flex gap-6 mt-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="donate"
                  checked={extraCentOption === 'donate'}
                  onChange={() => setExtraCentOption('donate')}
                />
                <span>Donate</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="game"
                  checked={extraCentOption === 'game'}
                  onChange={() => setExtraCentOption('game')}
                />
                <span>Game 🎲</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-full text-lg font-semibold shadow-md hover:bg-blue-700 transition-all duration-300"
          >
            {editTxId ? 'Update Expense' : 'Submit Expense'}
          </button>

          {/* Settle & Delete Buttons */}
          {editTxId && (
            <div className="flex gap-4 mt-6 justify-center">
              <button
                type="button"
                className="bg-green-100 text-green-700 px-5 py-2 rounded-full font-medium shadow-sm border border-green-200 hover:bg-green-200 transition"
                onClick={handleSettle}
              >
                ✅ Settle
              </button>
              <button
                type="button"
                className="bg-red-100 text-red-700 px-5 py-2 rounded-full font-medium shadow-sm border border-red-200 hover:bg-red-200 transition"
                onClick={handleDelete}
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddExpensePage;

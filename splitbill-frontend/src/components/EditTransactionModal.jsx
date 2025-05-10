import React, { useState } from 'react';
import axios from 'axios';

const EditTransactionModal = ({ isOpen, onClose, transaction, onUpdated }) => {
  const [description, setDescription] = useState(transaction?.description || '');
  const [totalAmount, setTotalAmount] = useState(transaction?.totalAmount || 0);
  const [settled, setSettled] = useState(transaction?.resolved || false);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.patch(`https://your-api/transactions/${transaction._id}`, {
        description,
        totalAmount,
        resolved: settled,
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`https://your-api/transactions/${transaction._id}`);
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        <h2 className="text-lg font-bold mb-4">Edit Transaction</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2 mb-4"
          value={totalAmount}
          onChange={(e) => setTotalAmount(Number(e.target.value))}
        />

        <label className="inline-flex items-center mb-4">
          <input
            type="checkbox"
            className="mr-2"
            checked={settled}
            onChange={() => setSettled(!settled)}
          />
          Mark as settled
        </label>

        <div className="flex justify-between mt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-red-600 px-4 py-2 hover:underline"
            >
              Delete
            </button>
          ) : (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-red-700 font-semibold px-4 py-2"
            >
              Confirm Delete
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default EditTransactionModal;

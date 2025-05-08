import React, { useEffect, useState } from 'react';
import { fetchTransactions } from '../api/api';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(data);
      } catch (err) {
        setError('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    };
    getTransactions();
  }, []);

  if (loading) return <p className="text-blue-600">Loading transactions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transaction List</h2>
      <ul className="space-y-3">
        {transactions.map((tx) => (
          <li key={tx._id} className="border p-3 rounded-lg shadow-md">
            <p><strong>Description:</strong> {tx.description}</p>
            <p><strong>Amount:</strong> ${tx.totalAmount}</p>
            <p><strong>Group ID:</strong> {tx.groupId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;

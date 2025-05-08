import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const GroupDetails = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`https://splitbill-api.onrender.com/api/groups/${groupId}`)
      .then((res) => {
        setGroup(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load group details');
        setLoading(false);
      });
  }, [groupId]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!group) return null;

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-2">{group.groupName}</h1>
      <p className="text-sm text-gray-500 mb-4">{group.members.length} members</p>

      <h2 className="text-lg font-semibold mb-2">Transactions</h2>
      <ul className="space-y-2">
        {group.transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions yet.</p>
        ) : (
          group.transactions.map((tx) => (
            <li key={tx._id} className="bg-white rounded-lg p-3 shadow">
              <p className="font-semibold">{tx.description}</p>
              <p className="text-sm text-gray-600">Total: ${tx.totalAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Paid by: {tx.paidBy}</p>
              {tx.receiptUrl && (
                <a href={tx.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs underline mt-1 inline-block">
                  View Receipt
                </a>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default GroupDetails;

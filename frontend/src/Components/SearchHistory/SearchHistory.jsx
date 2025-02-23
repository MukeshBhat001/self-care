import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdDelete, MdAccessTime } from 'react-icons/md';
import config from '../../config';

const SearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${config.apiUrl}/api/search-history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHistory(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to fetch search history');
      setLoading(false);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.apiUrl}/api/search-history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting history:', err);
      setError('Failed to delete history item');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="search-history">
      <h2>Search History</h2>
      {history.length === 0 ? (
        <p className="no-history">No search history available</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item._id} className="history-item">
              <div className="history-header">
                <div className="history-time">
                  <MdAccessTime />
                  {formatDate(item.timestamp)}
                </div>
                <button
                  className="delete-button"
                  onClick={() => deleteHistoryItem(item._id)}
                >
                  <MdDelete />
                </button>
              </div>
              
              <div className="history-content">
                <div className="symptoms">
                  <strong>Symptoms:</strong>
                  <p>{item.symptoms.join(', ')}</p>
                </div>
                
                <div className="analysis">
                  <strong>Analysis:</strong>
                  <div className={`urgency ${item.analysis.analysis.urgency.toLowerCase()}`}>
                    {item.analysis.analysis.urgency}
                  </div>
                  <p>{item.analysis.rawResponse}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchHistory;

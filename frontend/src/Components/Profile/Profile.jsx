import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchHistory from '../SearchHistory/SearchHistory';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: '',
    gender: ''
  });
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await api.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          age: response.data.age || '',
          gender: response.data.gender || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await api.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Profile</h2>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="0"
                max="120"
              />
            </div>
            <div className="form-group">
              <label>Gender:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div className="profile-actions">
              <button type="submit" className="save-btn">Save</button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Age:</strong> {user.age || 'Not specified'}</p>
            <p><strong>Gender:</strong> {user.gender || 'Not specified'}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="edit-btn"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
      <div className="search-history-section">
        <h3>Search History</h3>
        <SearchHistory />
      </div>
    </div>
  );
};

export default Profile;

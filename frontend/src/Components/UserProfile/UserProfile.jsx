import { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import config from '../../config';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ProfileAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #666;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileField = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    margin: 0;
    color: #666;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  padding: 1rem;
  background: #ffe6e6;
  border-radius: 5px;
  margin-bottom: 1rem;
`;

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${config.apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setProfile(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ProfileContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileAvatar>
          {profile?.username?.charAt(0).toUpperCase()}
        </ProfileAvatar>
        <ProfileInfo>
          <h1>{profile?.username}</h1>
          <p>{profile?.email}</p>
        </ProfileInfo>
      </ProfileHeader>

      <ProfileField>
        <label>Username</label>
        <p>{profile?.username}</p>
      </ProfileField>

      <ProfileField>
        <label>Email</label>
        <p>{profile?.email}</p>
      </ProfileField>

      
    </ProfileContainer>
  );
};

export default UserProfile;

import React, { useState, useEffect } from 'react';
import PageContainer from '../../../containers/PageContainer';
import { getProfile } from '../../../services/user-service';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null); // expect: { user, matchHistory }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(); // returns { user, matchHistory }
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="loading">Loading profile...</div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="error">Error: {error}</div>
      </PageContainer>
    );
  }

  const { user, matchHistory } = profile;

  return (
    <PageContainer>
      <div className="profile-header">
        <img
          src="https://picsum.photos/150"
          alt="Profile"
          className="profile-picture"
        />
        <h1 className="profile-name">{user.nickname || 'Unknown'}</h1>
      </div>
      <div className="profile-details">
        <p><strong>User ID:</strong> {user._id}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      {matchHistory && matchHistory.length > 0 ? (
        <div className="match-history">
          <h2>Match History</h2>
          <ul>
            {matchHistory.map((match) => (
              <li key={match._id} className="match-item">
                <div className="match-row">
                  <div className="match-user">
                    <p><strong>{match.players[0]}</strong></p>
                  </div>
                  <div className="match-vs">
                    <p>VS</p>
                  </div>
                  <div className="match-user">
                    <p><strong>{match.players[1]}</strong></p>
                  </div>
                </div>
                <div className="match-details">
                  <p><strong>Match ID:</strong> {match._id}</p>
                  <p><strong>Status:</strong> {match.status}</p>
                  <p>
                    <strong>Deck:</strong>{' '}
                    {match.deck && match.deck.length > 0 ? match.deck.join(', ') : 'N/A'}
                  </p>
                  <p>
                    <strong>Created:</strong> {new Date(match.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Updated:</strong> {new Date(match.updatedAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="no-match-history">No match history available.</div>
      )}
    </PageContainer>
  );
};

export default ProfilePage;
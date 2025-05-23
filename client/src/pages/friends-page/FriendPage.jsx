import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../containers/PageContainer';
import { getFriends, requestFriendship, acceptFriendRequest, rejectFriendRequest } from '../../services/user-service';
import './FriendPage.css';

const FriendsPage = () => {
  const [friendsData, setFriendsData] = useState({
    friends: [],
    friendRequestsReceived: [],
    friendRequestsSent: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendIdentifier, setFriendIdentifier] = useState('');
  const [friendMessage, setFriendMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getFriends(); // Expected to return { friends, friendRequestsReceived, friendRequestsSent }
        setFriendsData(data);
      } catch (err) {
        setError(err.message || 'Error fetching friends');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleFriendRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestFriendship(friendIdentifier);
      setFriendMessage('Friend request sent successfully!');
      setFriendIdentifier('');
      // Refresh friends data after sending request.
      const updatedData = await getFriends();
      setFriendsData(updatedData);
    } catch (err) {
      console.error(err);
      setFriendMessage(err.response?.data?.error || 'Error sending friend request.');
    }
  };

  const handleAcceptRequest = async (friendNickname) => {
    try {
      await acceptFriendRequest(friendNickname);
      // Refresh friends data after acceptance.
      const updatedData = await getFriends();
      setFriendsData(updatedData);
    } catch (err) {
      console.error(err);
      setFriendMessage(err.response?.data?.error || 'Error accepting friend request.');
    }
  };

  const handleRejectRequest = async (friendNickname) => {
    try {
      await rejectFriendRequest(friendNickname);
      // Refresh friends data after rejection.
      const updatedData = await getFriends();
      setFriendsData(updatedData);
    } catch (err) {
      console.error(err);
      setFriendMessage(err.response?.data?.error || 'Error rejecting friend request.');
    }
  };

  return (
    <PageContainer isLoading={loading} error={error}>
      <div className="friends-container">
        <div className="add-friend-section">
          <h2>Add a Friend</h2>
          <form onSubmit={handleFriendRequestSubmit}>
            <input
              type="text"
              placeholder="Friend Email or ID"
              value={friendIdentifier}
              onChange={(e) => setFriendIdentifier(e.target.value)}
              required
            />
            <button type="submit">Send Friend Request</button>
          </form>
          {friendMessage && <p className="friend-message">{friendMessage}</p>}
        </div>

        <div className="section-wrapper">
          <div className="requests-section">
            <h2>Friend Requests Received</h2>
            {friendsData.friendRequestsReceived.length > 0 ? (
              <ul>
                {friendsData.friendRequestsReceived.map((req, idx) => (
                  <li key={idx} className="request-item">
                    <span className="request-name">{req}</span>
                    <div className="request-actions">
                      <button onClick={() => handleAcceptRequest(req)} className="action-btn accept-btn">
                        Accept
                      </button>
                      <button onClick={() => handleRejectRequest(req)} className="action-btn reject-btn">
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No friend requests received.</p>
            )}
          </div>

          <div className="requests-section">
            <h2>Friend Requests Sent</h2>
            {friendsData.friendRequestsSent.length > 0 ? (
              <ul>
                {friendsData.friendRequestsSent.map((req, idx) => (
                  <li key={idx} className="request-item">
                    <span className="request-name">{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No friend requests sent.</p>
            )}
          </div>
        </div>

        <div className="friends-list">
          <h2>Your Friends</h2>
          {friendsData.friends.length > 0 ? (
            <ul>
              {friendsData.friends.map((friend) => (
                <li key={friend._id} className="friend-item" onClick={() => navigate(`/members/${friend.nickname}`)}>
                  <div className="friend-avatar">
                    <img
                      src={friend.avatar || 'https://picsum.photos/100'}
                      alt={friend.nickname}
                    />
                  </div>
                  <div className="friend-info">
                    <h3>{friend.nickname || 'Unknown'}</h3>
                    <p>{friend.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No friends found. Try adding someone!</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default FriendsPage;
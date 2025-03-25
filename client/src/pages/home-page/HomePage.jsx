import React from 'react';
import Header from '../../components/Header';
import RoomList from '../../components/RoomList';
import Footer from '../../components/Footer';
import './HomePage.css';

function HomePage() {
  return (
    <>
      <Header />
      <RoomList />
      <Footer />
    </>
  );
}

export default HomePage;
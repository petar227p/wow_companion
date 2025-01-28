import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AuctionHouse.css';
import goldImg from '../assets/Gold.jpg';
import silverImg from '../assets/Silver.jpg';
import bronzeImg from '../assets/Bronze.jpg'

const AuctionHouse = ({ token }) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auctionhouse', {
          params: { token, page: currentPage, itemsPerPage },
        });
        const auctionData = response.data.auctions;
        const total = response.data.total;

        // Fetch item details for each auction
        const auctionsWithDetails = await Promise.all(
          auctionData.map(async (auction) => {
            const itemId = auction.item.id; // Povuci itemId
            const itemResponse = await axios.get('http://localhost:5000/item', {
              params: { itemId, token }, // Koristi itemId za dohvaćanje detalja o itemu
            });

            const itemMediaResponse = await axios.get('http://localhost:5000/item/media', {
              params: { itemId, token }, // Koristi itemId za dohvaćanje medija itema
            });

            return {
              ...auction,
              itemDetails: {
                ...itemResponse.data,
                media: itemMediaResponse.data,
              },
            };
          })
        );

        setAuctions(auctionsWithDetails);
        setTotalItems(total);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [token, currentPage]);

  if (loading) {
    return <p>Loading auctions...</p>;
  }

  if (error) {
    return <p>Error loading auctions: {error.message}</p>;
  }

  const formatPrice = (price) => {
    const gold = Math.floor(price / 10000);
    const silver = Math.floor((price % 10000) / 100);
    const copper = price % 100;
    ;

    return (
      <span>
        {gold > 0 && (
          <span>
            {gold}
            <img src={goldImg} alt="Gold" className="currency-icon" />
          </span>
        )}
        {silver > 0 && (
          <span>
            {silver}
            <img src={silverImg} alt="Silver" className="currency-icon" />
          </span>
        )}
        {copper > 0 && (
          <span>
            {copper}
            <img src={bronzeImg} alt="Bronze" className="currency-icon" />
          </span>
        )}
      </span>
    );
  };

  const formatTimeLeft = (timeLeft) => {
    switch (timeLeft) {
      case 'SHORT':
        return 'Less than 30 minutes';
      case 'MEDIUM':
        return '30 minutes to 2 hours';
      case 'LONG':
        return '2 to 12 hours';
      case 'VERY_LONG':
        return 'More than 12 hours';
      default:
        return 'Unknown';
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageNumbers = [];

    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 9) {
        for (let i = 1; i <= 10; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage > 9 && currentPage <= totalPages - 9) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 4; i <= currentPage + 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 9; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      }
    }

    return (
      <div>
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Back
        </button>
        {pageNumbers.map((number, index) => (
          <button
            key={index}
            onClick={() => number !== '...' && paginate(number)}
            disabled={number === '...' || currentPage === number}
            className={currentPage === number ? 'active' : ''}
          >
            {number}
          </button>
        ))}
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="auction-house">
      <h1>Auction House</h1>
      <ul>
        {auctions.map((auction) => (
          <li key={auction.id} className={`auction-item ${auction.itemDetails?.quality?.type?.toLowerCase()}`}>
            {auction.itemDetails && auction.itemDetails.media && auction.itemDetails.media.assets && auction.itemDetails.media.assets[0] && (
              <img
                src={auction.itemDetails.media.assets.find(asset => asset.key === 'icon').value} // Prikazuj ikonu iz assets
                alt={auction.itemDetails?.name || 'Unknown Item'}
                className={`item-image ${auction.itemDetails.quality?.type.toLowerCase()}`}
              />
            )}
            <div className="auction-details">
              <p className={`item-name ${auction.itemDetails.quality?.type.toLowerCase()}`}>
                {auction.itemDetails?.name || 'Unknown Item'}
              </p>
              <p>Unit Price: {formatPrice(auction.buyout)}</p>
              <p>Time Left: {formatTimeLeft(auction.time_left)}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="pagination">
        {renderPagination()}
      </div>
    </div>
  );
};

export default AuctionHouse;

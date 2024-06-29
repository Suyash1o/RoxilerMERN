import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transaction = () => {
    const [transactions, setTransactions] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [barChartData, setBarChartData] = useState([]);
  
    useEffect(() => {
      fetchData();
    }, []);
  
    const fetchData = async () => {
      try {
        const transactionsResponse = await axios.get('/transactions?month=3'); // Example for March (1-indexed)
        const statisticsResponse = await axios.get('/statistics?month=3'); // Example for March (1-indexed)
        const barChartDataResponse = await axios.get('/bar-chart?month=3'); // Example for March (1-indexed)
  
        setTransactions(transactionsResponse.data);
        setStatistics(statisticsResponse.data);
        setBarChartData(barChartDataResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error state
      }
    };
  
    return (
      <div className="container">
        <h2>Combined Data Example</h2>
  
        {/* Display Transactions */}
        <h3>Transactions</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Date of Sale</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction._id}>
                <td>{transaction._id}</td>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>{transaction.price}</td>
                <td>{transaction.dateOfSale}</td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Display Statistics */}
        <h3>Statistics</h3>
        <div>
          <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
          <p>Total Sold Items: {statistics.totalSoldItems}</p>
          <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
        </div>
  
        {/* Display Bar Chart Data */}
        <h3>Bar Chart Data</h3>
        <ul>
          {barChartData.map(item => (
            <li key={item.priceRange}>{`${item.priceRange}: ${item.itemCount} items`}</li>
          ))}
        </ul>
      </div>
    );
  };

export default Transaction;

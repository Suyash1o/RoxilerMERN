const express =require('express')
const mongoose=require('mongoose')
const Product = require('./User')
const cors =require('cors')
const axios = require('axios')
const mongoosePaginate = require('mongoose-paginate-v2');
const moment = require('moment'); 


const app = express()
const port=4000

mongoose.connect('mongodb://127.0.0.1:27017')
.then(()=>console.log("DB is Connected"))
.catch((err)=>console.log(err))

async function fetchSeedData() {
    const response = await axios.get('http://localhost:4000/combined-data?month=6&year=2024');
    return response.data;
}


app.get('/init-db', async (req, res) => {
    try {
        await Product.deleteMany({}); // Clear existing data
        const seedData = await fetchSeedData();
        
        for (const productData of seedData) {
            const product = new Product({
                id: productData.id,
                title: productData.title,
                price: productData.price,
                description: productData.description,
                category: productData.category,
                image: productData.image,
                sold: productData.sold,
                dateOfSale: productData.dateOfSale
            });
            await product.save();
        }
        
        res.status(200).send('Database initialized with seed data');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error initializing database');
    }
});

app.get('/get/:id', (req, res) => {
    const id = req.params.id;
    Product.findById(id)
      .then(product => res.json(product))
      .catch(err => res.json(err));
  });

  app.get('/transactions', async (req, res) => {
    try {
        const { search, page = 1, perPage = 10 } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { price: new RegExp(search, 'i') }
            ];
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(perPage, 10)
        };

        const products = await Product.paginate(query, options);

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching transactions');
    }
});
app.get('/statistics', async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).send('Month and year are required');
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const totalSaleAmount = await Product.aggregate([
            {
                $match: {
                    sold: true,
                    dateOfSale: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$price" }
                }
            }
        ]);

        const totalSoldItems = await Product.countDocuments({
            sold: true,
            dateOfSale: {
                $gte: startDate,
                $lt: endDate
            }
        });

        const totalNotSoldItems = await Product.countDocuments({
            sold: false
        });

        res.status(200).json({
            totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching statistics');
}
});


app.get('/statistics', async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).send('Month and year are required');
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const totalSaleAmount = await Product.aggregate([
            {
                $match: {
                    sold: true,
                    dateOfSale: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$price" }
                }
            }
        ]);

        const totalSoldItems = await Product.countDocuments({
            sold: true,
            dateOfSale: {
                $gte: startDate,
                $lt: endDate
            }
        });

        const totalNotSoldItems = await Product.countDocuments({
            sold: false
        });

        res.status(200).json({
            totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching statistics');
}
});

app.get('/pie-chart', async (req, res) => {
    try {
      const { month } = req.query;
  
      if (!month) {
        return res.status(400).send('Month parameter is required');
      }
  
      const startDate = moment(month, 'MM').startOf('month').toDate();
      const endDate = moment(month, 'MM').endOf('month').toDate();
  
      const categories = await Product.distinct('category', {
        dateOfSale: { $gte: startDate, $lte: endDate }
      });
      
  
      const categoryCounts = await Promise.all(categories.map(async (category) => {
        const count = await Product.countDocuments({
          category,
          dateOfSale: { $gte: startDate, $lte: endDate }
        });
        return { category, count };
      }));
  
      res.status(200).json(categoryCounts);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching pie chart data');
    }
  });

  

  app.get('/combined-data', async (req, res) => {
    try {
      const { month, year } = req.query;
  
      if (!month || !year) {
        return res.status(400).send('Month and year are required');
      }
  
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
  
      const statisticsPromise = axios.get(`http://localhost:4000/statistics?month=${month}&year=${year}`);
      const pieChartPromise = axios.get(`http://localhost:4000/pie-chart?month=${month}`);
  
      const [statisticsResponse, pieChartResponse] = await Promise.all([statisticsPromise, pieChartPromise]);
  
      const transactionsResponse = await axios.get(`http://localhost:4000/transactions`);
  
      const combinedData = {
        statistics: statisticsResponse.data,
        pieChart: pieChartResponse.data,
        transactions: transactionsResponse.data
      };
  
      res.status(200).json(combinedData);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching combined data');
    }
  });

  app.get('/bar-chart', async (req, res) => {
    try {
      const { month } = req.query;
  
      if (!month) {
        return res.status(400).send('Month parameter is required');
      }
  
      // Calculate start and end dates for the specified month
      const startDate = moment(month, 'MM').startOf('month').toDate();
      const endDate = moment(month, 'MM').endOf('month').toDate();
  
      console.log('startDate:', startDate);
      console.log('endDate:', endDate);
  
      // Define price ranges
      const priceRanges = [
        { range: '0 - 100', min: 0, max: 100 },
        { range: '101 - 200', min: 101, max: 200 },
        { range: '201 - 300', min: 201, max: 300 },
        { range: '301 - 400', min: 301, max: 400 },
        { range: '401 - 500', min: 401, max: 500 },
        { range: '501 - 600', min: 501, max: 600 },
        { range: '601 - 700', min: 601, max: 700 },
        { range: '701 - 800', min: 701, max: 800 },
        { range: '801 - 900', min: 801, max: 900 },
        { range: '901 - above', min: 901, max: Number.MAX_SAFE_INTEGER }
      ];
  
      // Query database to count items in each price range
      const barChartData = await Promise.all(priceRanges.map(async (range) => {
        const count = await Product.countDocuments({
          price: { $gte: range.min, $lte: range.max },
          dateOfSale: { $gte: startDate, $lte: endDate }
        });
        return { range: range.range, count };
      }));
  
      res.status(200).json(barChartData);
    } catch (error) {
      console.error('Error in /bar-chart endpoint:', error);
      res.status(500).send('Error fetching bar chart data');
    }
  });
  

app.listen(port,()=>{
    console.log("Server is created");
})
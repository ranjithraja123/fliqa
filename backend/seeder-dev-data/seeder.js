const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./../models/product');

dotenv.config({ path: './config/config.env' });

const DB = process.env.DB_LOCAL_URI;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology:true,
  })
  .then(() => console.log('DB connection successful111!'));

// READ JSON FILE
const products = JSON.parse(
  fs.readFileSync(`./seeder-dev-data/data.json`, 'utf-8')
);
console.log("products", products)

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Product.create(products);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};


// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv)

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

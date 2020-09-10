const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
PORT = process.env.PORT || 3000;

// URL to scrap
// http://finance.yahoo.com/cryptocurrencies

// showing what each package does seperately
// const responseData = async () => {
//     const axiosObj = await axios.get('http://finance.yahoo.com/cryptocurrencies')
//     console.log(axiosObj)
//     const cheerioObj = cheerio.load(axiosObj.data)
//     console.log(cheerioObj)
//     console.log(cheerioObj('body').html())
// }
//     responseData()

// fetch data all in one function
const fetchData = async (url) => {
  let result = await axios.get(url);
  return cheerio.load(result.data);
};

// express middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.urlencoded({ extended: true }));

// api route
app.get('/api', async (req, res) => {
  // empty array to push cherrio data to
  const data = [];
  // using fetchData function to pull response object from url
  const cd = await fetchData('http://finance.yahoo.com/cryptocurrencies');
  // cheerio syntax to find td html
  cd('body')
    .find('#scr-res-table > div > table > tbody > tr > td')
    .each((i, element) => {
      // console.log(cd(element).text())
      const stockInfo = cd(element).text();
      // we want to push each piece of stockinfo to an array
      data.push(stockInfo);
    });
  //   console.log(data);
  const joined = data.join(' ').split('  ');
  //   console.log(joined)
  const filtered = joined.filter((d) => {
    // ==================== if data isn't empty or trash =======
    if (
      d !== '' &&
      d !== undefined &&
      d !== null &&
      d.trim().split(' ')[0] !== 'BAT-USD'
    ) {
      // ================== object to return ===================
      return d;
    }
  });
  // console.log(filtered)
  // mapping through joined data to split into single elements
  const cleaned = filtered.map((d) => {
    return {
      // setting single elements to properties in an object
      abbr: d.trim().split(' ')[0],
      name: d.trim().split(' ')[1],
      price:
        d.trim().split(' ')[3] === 'USD' || d.trim().split(' ')[3] === 'Token'
          ? d.trim().split(' ')[4]
          : d.trim().split(' ')[3],
      change:
        d.trim().split(' ')[4] === '+' || d.trim().split(' ')[4] === '-'
          ? d.trim().split(' ')[5]
          : d.trim().split(' ')[4],
      // data below here is pushed back because of the names of some of the companies
      // so we use ternary operators to find data at each split
      // if data is equal to what we need we grab the data at that position
      // else we grab data at another position
      cost:
        d.trim().split(' ')[3] === 'USD' || d.trim().split(' ')[3] === 'Token'
          ? d.trim().split(' ')[4]
          : d.trim().split(' ')[3],
      change:
        d.trim().split(' ')[4].charAt(0) === '+' ||
        d.trim().split(' ')[4].charAt(0) === '-'
          ? d.trim().split(' ')[4]
          : d.trim().split(' ')[5],
      per_change:
        d
          .trim()
          .split(' ')[5]
          .charAt(d.trim().split(' ')[5].length - 1) === '%'
          ? d.trim().split(' ')[5]
          : d.trim().split(' ')[6],
      cap:
        d
          .trim()
          .split(' ')[6]
          .charAt(d.trim().split(' ')[6].length - 1) === '%'
          ? d.trim().split(' ')[7]
          : d.trim().split(' ')[6],
    };
  });
  // console.log(cleaned)
  res.json({
    // raw data
    data,
    // data split into long sentences
    joined,
    // filtered does not include 'BAT-USD'
    filtered,
    // final cleaned data
    cleaned,
  });
});

// route to show html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

// listen method
app.listen(PORT, () => {
  console.log(`Server start on http://localhost:${PORT}`);
});

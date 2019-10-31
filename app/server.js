const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const url = require('url');

const PORT = 3001;

// Set default state
let products = [];
let brands = [];
let users = [];

// Set default token for testing
let accessTokens = [
  {
    username: 'greenlion235',
    token: 'mySuperSecretToken'
  }
];

// Set default cart for testing
let cart = [{
  "id": "1",
  "categoryId": "1",
  "name": "Superglasses",
  "description": "The best glasses in the world",
  "price":150,
  "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
}];

// Function to get token and update
const getToken = request => {
  let urlParse = url.parse(request.url, true);
  let foundToken = urlParse.query.token;
  if(foundToken) {
    let currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.token === foundToken;
    })
  if (currentAccessToken) {
    return currentAccessToken
  } else {
    return null
  }
  } else {
    return null
  }
}

// Initial router setup
var router = Router();
router.use(bodyParser.json());

const server = http.createServer((request, response) => {
  router(request, response, finalHandler(request,response))
}).listen(PORT, () => {
  products = 
    JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));
  brands = 
    JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));
  users = 
    JSON.parse(fs.readFileSync('../initial-data/users.json'), 'utf-8')
});

// Route for Brands Endpoint
router.get('/api/brands', function(request, response) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    return response.end(JSON.stringify(brands));
})

router.get('/api/brands/:id/products', function (request, response) {
  const { id } = request.params;
  let productsByBrand = [];
  productsByBrand = products.filter(product => product.categoryId === id);
  if (productsByBrand.length === 0) {
    response.writeHead(404, 'Brand not found');
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(productsByBrand));
  }
});

// Route for Products Endpoint
router.get('/api/products', function(request, response) {
  let newProducts = [];
  let urlParse = url.parse(request.originalUrl);
  const query = queryString.parse(urlParse.query);
  if (query.q !== undefined) {
    newProducts = products.filter(product => {
      return product.name === query.q
    })
  if (newProducts.length === 0) {
    response.writeHead(400, 'There are no products matching the search');
    return response.end();
  }
  } else {
    newProducts = products;
  }
    response.writeHead(200, {'Content-Type': 'application/json'});
    return response.end(JSON.stringify(newProducts));
})

// Route for login Endpoint
router.post('/api/login', function(request, response) {
  if(request.body.username && request.body.password) {
    let user = users.filter(user => {
      return (
        user.login.username === request.body.username && 
        user.login.password === request.body.password);
    });
    if(user.length === 0) {
      response.writeHead(401, 'Invalid username or password');
      return response.end();
    };
    let currentAccessToken = accessTokens.find(token => {
      return token.username = user[0].login.username;
    });
    if(currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();
      return response.end(JSON.stringify(currentAccessToken.token));
    } else {
      let newAccesstoken = {
        username: request.body.username,
        token: uid(16)
      };
      accessTokens.push(newAccesstoken);
      return response.end(JSON.stringify(newAccesstoken.token));
    }
  } else {
    response.writeHead(400, 'Incorrectly formatted response');
    return response.end();
  }
});

// Route for cart Endpoint
router.get('/api/me/cart', function(request, response) {
  let currentAccessToken = getToken(request);
  if (!currentAccessToken) {
    response.writeHead(401, 'You do not have access to this data');
    return response.end();
  } else {
    response.writeHead(200, {'Content-Type': 'application/json'});
    return response.end(JSON.stringify(cart))
  }
})

// Route for cart Endpoint
router.post('/api/me/cart', function (request, response) {
  let currentAccessToken = getToken(request);
  if (!currentAccessToken) {
    response.writeHead(401, 'Invalid request.');
    return response.end();
  }
  if (!request.body.id) {
    response.writeHead(400, 'Invalid product ID.')
    return response.end();
  }
  let productToBeAdded = products.find(product => {
    return request.body.id === product.id 
    && request.body.categoryId === product.categoryId
    && request.body.name === product.name
    && request.body.description === product.description
    && request.body.price === product.price
  })
  if (!productToBeAdded) {
    response.writeHead(400, 'This product does not exist.')
    return response.end();
  }
  productToBeAdded.quantity === 1;
  cart.push(productToBeAdded);
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(cart));
})

// Route for cart Endpoint to change quantity
router.post('/api/me/cart/:productId', function (request, response) {
  let currentAccessToken = getToken(request);
    if (!currentAccessToken) {
      response.writeHead(401, 'Invalid request.');
      return response.end();
    }
    if (request.params.productId === undefined) {
      response.writeHead(400, 'You must specify a product to be added.')
      return response.end();
    }
    let productToBeChanged = cart.find(product => {
      return product.id = request.params.productId; 
    })
    if (!productToBeChanged) {
      response.writeHead(400, 'Product not found.')
      return response.end();
    }
    for (let i = 0; i < cart.length; i++) {
      if (productToBeChanged.id === cart[i].id) {
        productToBeChanged.quantity ++;
      }
    } 
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(cart));
})

router.get('/api/me/cart/:productId', function(request,response) {
  let currentAccessToken = getToken(request);
  if (!currentAccessToken) {
    response.writeHead(401, 'You do no have access to this data');
    return response.end();
  }
  if (!request.params.productId) {
    response.writeHead(400, 'You must specify a product to be added to cart')
    return response.end();
  }
  let productToBeDeleted = cart.find(product => {
    return product.id = request.params.productId; 
  })
  if (!productToBeDeleted) {
    response.writeHead(400, 'The id does not match any products currently in the cart')
    return response.end();
  }
  let newCart = cart.filter(product => {
    return product.id !== productToBeDeleted.id
  })
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(newCart));
})

module.exports = server;

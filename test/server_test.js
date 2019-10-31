const chai = require('chai');
const chaiHTTP = require('chai-http');
const server = require('../app/server');

const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);

// Endpoint test 1 of 8
describe('GET /api/brands', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});

// Endpoint test 2 of 8
describe('/GET brands/:id/products', () => {
  it('it should GET all of the products by brand id', done => {
    chai
      .request(server)
      .get('/api/brands/1/products')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(3);
        expect(res.body[0].name).to.eq("Superglasses");
        done();
      });
  });
  it('it should GET a 404 response when id is not found', done => {
    chai
      .request(server)
      .get('/api/brands/8/products')
      .end((err, res) => {
        assert.isNotNull(res.error);
        expect(res).to.have.status(404);
        done();
      });
  });
})

// Endpoint test 3 of 8
describe('GET /products', () => {
  it('should GET all the products if search query undefined', done => {
    chai
    .request(server)
    .get('/api/products')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect("Content-Type", "application/json");
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(11);              
      done();
    })
  })
  it('should return only true queries', done => {
    chai    
    .request(server)
    .get('/api/products?q=Brown+Sunglasses')
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect("Content-Type", "application/json");
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(1); 
      done();
    })
  })
  it('should return an error if unknown query', done => {
    chai
    .request(server)
    .get('/api/products?q=zz')
    .end((err, res) =>  {
      expect(res).to.have.status(400);
      done();
    })
  })        
});

// Endpoint test 4 of 8
describe ('POST /login', () => {
  it('should grant access with correct username and password', done => {
    let user = {username: 'greenlion235', password: 'waters'}
    chai
    .request(server)
    .post('/api/login')
    .set('Content-type', 'application/json')
    .send(user)
    .end((err, res) => {
      expect(res).to.have.status(200);
      done();
    })
  })
  it('should return an error for incorrect login information', done => {
    let user = {username: 'sirhackalot', password: 'todayismyday'}
    chai
    .request(server)
    .post('/api/login')
    .set('Content-type', 'application/json')
    .send(user)
    .end((err, res) => {
      expect(res).to.have.status(401);
      done();
    })
  })
})

// Endpoint test 5 of 8
describe ('GET me/cart', () => {
  it('should return current products in cart', done => {
    chai
    .request(server)
    .get('/api/me/cart/?token=mySuperSecretToken')
    .end((err,res) => {
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      done();
    })
  })
  it('should return an error if invalid token', done => {
    chai
    .request(server)
    .get('/api/me/cart')
    .end((err, res) => {
      expect(res).to.have.status(401);
      done();
    })
  })
})

// Endpoint test 6 of 8
describe ('POST me/cart', () => {
  let product = {
    id: "2",
    categoryId: "1",
    name: "Black Sunglasses",
    description: "The best glasses in the world",
    price: 100,
    imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  };
  let response = {
    name: 'wrong product'
  };
  it('should add a product to the cart', done => {
    chai
    .request(server)
    .post('/api/me/cart/?token=mySuperSecretToken')
    .send(product)
    .end((err,res) => {
      expect(res).to.have.status(200);
      done();
    })
  })
  it('should return an error with invalid token', done => {
    chai
    .request(server)
    .post('/api/me/cart/?token=a')
    .send(product)
    .end((err,res) => {
      expect(res).to.have.status(401);
      done();
    })
  })
  it('should return an error if the product entered is invalid', done => {
    chai    
    .request(server)
    .post('/api/me/cart/?token=mySuperSecretToken')
    .set('Content-type', 'application/json')
    .send(response)
    .end((err,res) => {
      expect(res).to.have.status(400);
      done();
    })
  })
})

// Endpoint test 6 of 8
describe('POST /me/cart/:productId', () => {
  it('should add product to cart', done => {
    chai
    .request(server)
    .post('/api/me/cart/1/?token=mySuperSecretToken')
    .end((err,res) => {
      expect(res).to.have.status(200);
      done();
    })
  })
  it('should return an error if there is access token is invalid', done => {
    chai
    .request(server)
    .get('/api/me/cart/1/?token=a')
    .end((err,res) => {
      expect(res).to.have.status(401);
      done();
    })
  })
})

// Endpoint test 7 of 8
describe ('DELETE /me/cart/:productId', () => {
  it('should delete a product from cart', done => {
    chai
    .request(server)
    .get('/api/me/cart/1/?token=mySuperSecretToken')
    .end((err,res) => {
      expect(res).to.have.status(200);
      done();
    })
  })
  it('should return an error if there is access token is invalid', done => {
    chai
    .request(server)
    .get('/api/me/cart/1/?token=a')
    .end((err,res) => {
      expect(res).to.have.status(401);
      done();
    })
  })
  it('should return an error if there is no url is entered', done => {
    chai
    .request(server)
    .get('/api/me/cart/?token=blahblahblah')
    .end((err,res) => {
      expect(res).to.have.status(401);
      done();
    })
  })
  it('should return an error if the product id is invalid', done => {
    chai   
    .request(server)
    .get('/api/me/cart/5555/?token=blahblahblah')
    .end((err,res) => {
      expect(res).to.have.status(401);
      done();
    })
  })
})

const express = require('express');
const {query, validationResult} = require('express-validator');

const router = express.Router();

const DefaultController = require("../controllers/DefaultController");
const MongoController = require("../controllers/MongoController");
const UserController = require("../controllers/UserController");
const {basicAuthenticateUser} = require("../helpers/authMiddleware");


// a middleware function with no mount path. This code is executed for every request to the router
router.use((req, res, next) => {
    console.log('Time:', Date.now())
    next()
})


router.get("/get_testdata/:id?", DefaultController.getTestData);
router.get("/get_params/:id", DefaultController.showParams);

router.get("/get_lawyers/:s?", DefaultController.getLawyers);
router.get("/get_html/:s?", DefaultController.getHtml);

// Start Users Routes using Mongo
router.get("/test/:s?", MongoController.test);
router.get("/get_movies/:s?/:offset?", MongoController.getMovies);
// END Users Routes

// Start Users Routes using Mysql
router.get('/users/test/:s?', UserController.test);
router.get('/users/list/:s?/:offset?', UserController.list);
router.post('/users/add/', basicAuthenticateUser, UserController.validateAddUser, UserController.add);
router.put('/users/edit/', basicAuthenticateUser, UserController.validateAddUser, UserController.edit);
router.delete('/users/delete/', basicAuthenticateUser, UserController.delete);
// END Users Routes

// Define the route with the middleware functions and the route handler
router.get('/t/:s', basicAuthenticateUser, UserController.test);

router.get('/t1/:s', (req, res, next) => {
    req.customParam = 'custom value'; // Set the custom parameter
    next(); // Call next() to pass control to the next middleware/route handler
}, basicAuthenticateUser, UserController.test);


module.exports = router;
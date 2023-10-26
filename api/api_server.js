const express = require('express');
const multer = require('multer');
const upload = multer();
const routes = require('./routes/ApiRoutes');

const app = express();

// Middleware to parse POST data
app.use(express.urlencoded({ extended: true }));
// app.use(express.raw({ extended: true }));

// Middleware to handle multipart/form-data requests
app.use(upload.none());

app.use('/api', routes);

/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message }).end();
    return;
});

app.get('/', (req, res) => {
    res.json({ message: 'Hello....' });
});


const hostName = '127.0.0.1';
const port = 3011; // You can change the port number if needed
app.listen(port, hostName, () => {
    console.log(`Server is running at http://${hostName}:${port}/`);
});
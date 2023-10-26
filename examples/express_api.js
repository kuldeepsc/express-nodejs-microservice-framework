const express = require('express');
const app = express();
const http = require('http');
const axios = require('axios');

app.get('/api/',(req,res)=>{
    res.json({ message: 'Welcome To api page.' });
})
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello, world!' });
});

/*app.get('/api/external', async (req, res) => {
    const r=await fetch(`https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json`);
    res.send(r);
    res.end();
});*/

app.get('/api/data', (req, res) => {
    try{
        axios.get(`https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json`)
            .then(response => {
                res.status(200).json(response.data);
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({ error: 'An error occurred' });
            });
    }catch (e) {
        console.error(error);
        res.send('');
    }
});

app.get('/api/data1', (req, res) => {
    const options = {
        hostname: 'https://microsoftedge.github.io',
        path: '/Demos/json-dummy-data/64KB.json',
        method: 'GET'
    };

    const request = http.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            res.json(JSON.parse(data));
        });
    });
    request.on('error', (error) => {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    });
    request.end();
});

const hostName = '127.0.0.1';
const port = 3010; // You can change the port number if needed
app.listen(port, hostName,() => {
    console.log(`Server is running at http://${hostName}:${port}/`);
});
const axios = require("axios");
const { getConn } = require('../helpers/mysqlConn');

module.exports = (() => {

    return {
        getTestData: async (req, res) => {
            const id = req.params.id;
            try {
                await axios.get(`https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json`)
                    .then(response => {
                        res.status(200).json({ param: id, message: "data fetched.", data: response.data });
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(500).json({ error: 'An error occurred' });
                    });
            } catch (e) {
                console.error(error);
                res.send('');
            }
        },

        showParams: (req, res, next) => {

            let id = req.params.id;
            res.status(200).send({ message: 'showing params', success: true, param: id }).end();
        },

        getLawyers: (req, res) => {
            const connection = getConn(req, res);
            try {
                let s = req.params.s;
                // Validate input
                if (!s) {
                    res.status(400).json({ error: 'Invalid input', message: 'Search parameter is required' }).end();
                }

                connection.query(`SELECT SQL_CALC_FOUND_ROWS lawyers.*
                                  FROM lawyers
                                  where name like "%${s}%" LIMIT 0,10`, (error, results, fields) => {
                    if (error) {
                        res.status(500).send({ error: error, message: "error while run query." }).end();
                    }

                    console.log('search param is: ', s);
                    const total_result = results.length;
                    let totalRows = 0;
                    console.log('total_result: ', total_result);
                    if (total_result > 0) {
                        connection.query('SELECT FOUND_ROWS() AS total_rows', (countError, countResult, countFields) => {
                            if (countError) {
                                res.status(500).send({
                                    error: countError,
                                    message: 'Error while retrieving total rows.'
                                }).end();
                                return;
                            }
                            totalRows = countResult[0].total_rows;
                            console.log("totalRows before..... ", totalRows)
                            res.status(200).json({
                                message: total_result > 0 ? 'Record Found' : 'No Record Found',
                                success: true,
                                search_param: s,
                                total_count: totalRows,
                                data: results,
                            }).end();
                        })
                    } else {
                        // Send the response if no records found
                        res.status(200).json({
                            message: 'No Record Found',
                            success: true,
                            search_param: s,
                            total_count: totalRows,
                            data: results,
                        }).end();
                    }

                    console.log('totalRows after: ', totalRows);
                    connection.end();
                });

            } catch (e) {
                console.error(error);
                res.status(500).send({ error: error, message: 'An error occurred' }).end();
            }

        },

        getHtml: (req, res) => {
            let s = req.params.s;
            res.status(200).send('<h2>welcome to hello world...</h2>').end();
        },

    }

})();
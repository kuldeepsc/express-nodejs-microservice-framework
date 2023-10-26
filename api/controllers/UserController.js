const {param, check, validationResult} = require('express-validator');
const {sqlQuery, createMysqlConn, closeSqlConn} = require('../helpers/mysqlConn');

const validateAddUser = async (req, res, next) => {
    try {
        const validationRules = [
            check('name').notEmpty().withMessage('Name is required.'),
            check('phone').notEmpty().isInt().withMessage('Phone is invalid.'),
            check('email').isEmail().withMessage('Invalid email.')
        ];
        await Promise.all(validationRules.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw {status: 400, errors: errors.array()};
        }
        next();
    } catch (error) {
        const statusCode = error.status || 500;
        console.error(error);
        res.status(statusCode).send({error, message: 'Internal Server Error'}).end();
    }

}

module.exports = (() => {

    return {
        validateAddUser,

        test: async (req, res) => {
            try {
                let s = req.params.s;
                console.log("params....", s);

                // Define the validation checks
                const validationRules = [
                    param('s').isInt().notEmpty().withMessage('Invalid ID.'),
                    check('email').isEmail().withMessage('Invalid email.')
                ];

                // Run the validation checks
                await Promise.all(validationRules.map(validation => validation.run(req)));

                // Check for validation errors
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    // Return the validation errors
                    return res.status(400).json({errors: errors.array()});
                }

                // If validation passes, continue with the rest of the code
                res.status(200).send({message: 'Showing Params', success: true, param: s}).end();
            } catch (error) {
                // Handle any other errors that occur
                console.error(error);
                res.status(500).send({message: 'Internal Server Error', success: false}).end();
            }
        },

        add: async (req, res) => {

            try {
                console.log("req.body....", req.body);
                const conn = await createMysqlConn();
                const {name, phone, email, age} = req.body;
                const q = 'INSERT INTO `users` (`name`, `phone`, `email`, `age`) VALUES (?, ?, ?, ?)';
                const values = [name, phone, email, age || ''];
                try {
                    const result = await sqlQuery(conn, q, values);
                    console.log("results 2..... ", result);
                    let message = 'Error in creating user.';
                    let success = false;
                    let insert_id = result.insertId;
                    if (insert_id) {
                        message = 'User created successfully';
                        success = true;
                    }
                    res.status(200).send({message, success, insert_id, res: result, payloadData: req.body}).end();
                } catch (e) {
                    res.status(400).send({error: true, message: e}).end();
                }
            } catch (error) {
                console.error(error);
                const status = error.status || 500;
                res.status(status).send({message: 'Internal Server Error', success: false, error}).end();
            }

        },

        edit: async (req, res) => {

            try {
                console.log("req.body....", req.body);
                const {id, name, phone, email, age} = req.body;
                if (!id) {
                    return res.status(400).json({error: 'Invalid input', message: 'id parameter is required'}).end();
                }

                const conn = await createMysqlConn();
                const q1 = `SELECT COUNT(id) AS count
                            FROM users
                            WHERE id = ${id}`;
                const [userDetail] = await sqlQuery(conn, q1);
                console.log(userDetail);
                if (userDetail && userDetail.count > 0) {
                    const q = 'UPDATE `users` SET `name` = ?, `phone` = ?, `email` = ?, `age` = ? WHERE `id` = ?';
                    const values = [name, phone, email, age || '', id];
                    try {
                        const result = await sqlQuery(conn, q, values);
                        console.log("results 2..... ", result);
                        let message = 'Error in updating user.';
                        let success = false;
                        if (result.affectedRows > 0) {
                            message = 'User updated successfully';
                            success = true;
                        }
                        res.status(200).send({message, success, payloadData: req.body}).end();
                    } catch (e) {
                        res.status(400).send({error: true, message: e}).end();
                    }
                } else {
                    res.status(404).send({error: true, message: 'User not found'}).end();
                }
            } catch (error) {
                console.error(error);
                const status = error.status || 500;
                res.status(status).send({message: 'Internal Server Error', success: false, error}).end();
            }
        },

        list: async (req, res) => {

            try {

                const s = req.params.s;
                const offset = req.params.offset || 0;
                const limit = 10;

                // Validate input
                if (!s) {
                    return res.status(400).json({
                        error: 'Invalid input',
                        message: 'Search parameter is required'
                    }).end();
                }
                const conn = await createMysqlConn();
                const results = await sqlQuery(conn, `SELECT SQL_CALC_FOUND_ROWS users.*
                                                      FROM users
                                                      WHERE name like "%${s}%" LIMIT ${offset}
                                                          , ${limit}`);

                console.log('search param is: ', s);
                const total_result = results.length;
                let totalRows = 0;
                if (total_result > 0) {
                    const countResult = await sqlQuery(conn, 'SELECT FOUND_ROWS() AS total_rows');

                    totalRows = countResult[0];
                    await closeSqlConn(conn);
                    // Send the response with records
                    return res.status(200).json({
                        message: total_result > 0 ? 'Record Found' : 'No Record Found',
                        success: true,
                        search_param: s,
                        total_count: totalRows.total_rows,
                        data: results,
                    }).end();

                } else {
                    // Send the response if no records found
                    return res.status(200).json({
                        message: 'No Record Found',
                        success: false,
                        search_param: s,
                        data: results,
                    }).end();
                }


            } catch (e) {
                console.error(error);
                return res.status(500).send({error: error, message: 'An error occurred'}).end();
            }

        },

        delete: async (req, res) => {

            try {

                console.log("req.body....", req.body);
                const {id} = req.body;

                if (!id) {
                    return res.status(400).json({error: 'Invalid input', message: 'id parameter is required'}).end();
                }

                const conn = await createMysqlConn();
                const q = 'DELETE FROM `users` WHERE `users`.`id` = ?';
                const values = [id];
                try {
                    const result = await sqlQuery(conn, q, values);
                    let message = 'Error in deleting user or invalid ID.';
                    let success = false;
                    if (result.affectedRows) {
                        message = 'User Deleted Successfully';
                        success = true;
                    }
                    res.status(200).send({message, success, payloadData: req.body}).end();
                } catch (e) {
                    res.status(400).send({error: true, message: e}).end();
                }
            } catch (error) {
                console.error(error);
                const status = error.status || 500;
                res.status(status).send({message: 'Internal Server Error', success: false, error}).end();
            }

        },


    }

})();
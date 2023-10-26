const mongoose = require('mongoose');
const {createMongoConn, closeMongoConn} = require('../helpers/mongoConn');

module.exports = (() => {

    return {

        test: (req, res) => {
            let str = req.params.s||'';
            res.status(200).send(`<h2>Welcome ${str? str.charAt(0).toUpperCase() + str.slice(1):''} to Disney World...!</h2>`).end();
        },

        getMovies: async (req,res) => {
            let s = req.params.s;
            const limit = 10;
            const offset = req.params.offset;
            console.log("s..... ", s);
            const conn = await createMongoConn();
            console.log("conn..... ", conn)
            if (conn){
                // Define a Mongoose schema for the "movies" collection
                const movieSchema = new mongoose.Schema({
                    // Define the schema fields
                    title: {type: String, required: true},
                    postime: {type: String, required: true},
                });

                // Create a Mongoose model based on the schema & Check if the model is already defined
                const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);


                const titleRegex = new RegExp(s, 'i'); // 'i' for case-insensitive
                // Fetch the first 10 records from the "movies" collection
                Movie.find({title: titleRegex})
                    .select('')
                    .skip(offset)
                    .limit(limit)
                    .exec()
                    .then((movies) => {
                        console.log('Found Movies:', movies.length);
                        // Get the total record count
                        Movie.countDocuments({title: titleRegex}).exec()
                            .then((count) => {
                                console.log('Total record count:', count);
                                closeMongoConn();
                                res.status(200).json({
                                    search_param: s,
                                    total_count: count,
                                    movies: movies,
                                }).end();
                            })
                            .catch((error) => {
                                console.error('Error getting total record count:', error);
                                res.status(500).send({
                                    error: error,
                                    message: 'Error getting total record count'
                                }).end();
                            });


                    })
                    .catch((error) => {
                        res.status(500).send({error: error, message: 'Error fetching movie data'}).end();
                    });
            }else{
                res.status(500).send('not connected').end();
            }






        }

    }

})();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
	const error = new HttpError('Couldnt find this route', 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}

	res.status(error.code || 500).json({
		message: error.message || 'خطای نامشخص',
	});
});
const uri = 'mongodb://localhost:27017/placesDB?replicaSet=rs0';

mongoose
.connect(uri,{   useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    retryWrites: false})
.then(()=>{
    app.listen(5000);
})
.catch(error=>{
    console.log(error);
});


const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = '';

const getCoordsForAddress = async (address) => {
	/* return {
        lat: 53.547106,
        lng: 9.9613252
    }*/

	const response = await axios.get(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
	);

	const data = response.data;
	console.log(data);
	if (!data || data.status === 'ZERO_RESULTS') {
		const error = new HttpError('محل موردنظر یافت نشد', 422);
		throw error;
	}

	const coordinates = data.results[0].geometry.location;

	return coordinates;
};

module.exports = getCoordsForAddress;

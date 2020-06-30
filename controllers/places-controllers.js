const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const { validationResult } = require('express-validator');
const Place = require('../models/place');

const { v4: uuidv4 } = require('uuid');
//use let instead of const to change array
let DUMMY_PLACES = [
	{
		id: 'p1',
		title: 'Empire Palace',
		description: 'One of the best place in the world',
		imageUrl: 'https://ziplin.ir/wp-content/uploads/2020/05/Smooth-Derm.jpg',
		address: 'Bernhard-Nocht-Straße 97, 20359 Hamburg',
		creator: 'u1',
		location: {
			lat: 53.547106,
			lng: 9.9613252,
		},
	},
];

const getPlaceById = (req, res, next) => {
	const placeId = req.params.pid;

	const place = DUMMY_PLACES.find((p) => {
		return p.id === placeId;
	});
	console.log('GET Req');

	if (!place) {
		//throw new HttpError('couldnt find place');
		const error = new HttpError('couldnt find place');
		error.code = 404;
		return next(new HttpError('couldnt find place', 404));
		//return res.status(404).json({ message: 'Not found' });
	} else {
		res.json({
			place: place,
		});
	}
};

const getPlacesByUserId = (req, res, next) => {
	const userId = req.params.uid;
	//find get first match ; filter return array
	/*	const place = DUMMY_PLACES.find((p) => {
		return p.creator === userId;
	});*/
	const places = DUMMY_PLACES.filter((p) => {
		return p.creator === userId;
	});
	if (!places || places.length === 0) {
		throw new HttpError('couldnt find userid');
		const error = new Error('couldnt find userid');
		error.code = 404;
		throw error;
	}

	res.json({ places });
};

const createPlace = async (req, res, next) => {
	//check express validators
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError('لطفا اطلاعات ورودی را بررسی نمایید', 422));
	}
	const { title, description, address, creator } = req.body;
	//above equal to define everyone individually const title = req.body.title;
	let coordinates;

	try {
		coordinates = { lat: 53.547106, lng: 9.9613252 }; //await getCoordsForAddress(address);
	} catch (error) {
		return next(error);
	}

	const createdPlace = new Place({
		title,
		description,
		location: coordinates,
		address,
		creator,
		image: 'https://ziplin.ir/wp-content/uploads/2020/05/Smooth-Derm.jpg',
	});

	/*{
		id: uuidv4(),
		title,
		description,
		location: coordinates,
		address,
		creator,
	};*/

	//DUMMY_PLACES.push(createdPlace); // or unshift(createdPlace)
	try {
		await createdPlace.save();
	} catch (err) {
		const error = new HttpError('Failed to create place', 500);
		//prevent execution of later codes
		return next(error);
	}

	res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError('لطفا اطلاعات ورودی را بررسی نمایید', 422);
	}

	const { title, description } = req.body;
	const placeId = req.params.pid; //sth u have specified in router

	const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) }; //copy as new object by ...
	const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
	updatedPlace.title = title;
	updatedPlace.description = description;

	DUMMY_PLACES[placeIndex] = updatedPlace;

	res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
	const placeId = req.params.pid;

	if (DUMMY_PLACES.find((p) => p.id === placeId)) {
		throw new HttpError('مکان موردنظر وجود ندارد', 422);
	}
	DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
	res.status(200).json({ message: 'Deleted Palce: ' + placeId });
};
//module.exports = //single object

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

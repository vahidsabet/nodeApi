const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const { validationResult } = require('express-validator');
const Place = require('../models/place');
const User = require('../models/user');

const { v4: uuidv4 } = require('uuid');
const place = require('../models/place');
const  mongoose  = require('mongoose');
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

const getPlaceById = async (req, res, next) => {
	const placeId = req.params.pid;
	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError('sth went wrong,couldnt find a place ', 500);
		return next(error);
	}
	/* DUMMY_PLACES.find((p) => {
		return p.id === placeId;
	});
	console.log('GET Req');*/

	if (!place) {
		//throw new HttpError('couldnt find place');
		const error = new HttpError('couldnt find place');
		error.code = 404;
		return next(new HttpError('couldnt find place', 404));
		//return res.status(404).json({ message: 'Not found' });
	} else {
		//console.log(place);
		res.json({
			place: place.toObject({ getters: true }),
		});
	}
};

const getPlacesByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	//let places;
	let usersPlaces;
	try {
		//use .exec() for fully-fledge (complete) promise (that is have catch and finally methods)
		//places = await Place.find({ creator: userId }); //.exec();
		usersPlaces = await User.findById( userId ).populate('places'); 
	} catch (err) {
		const error = new HttpError('sth went wrong,couldnt find a place ', 500);
		return next(error);
	}

	//find get first match ; filter return array
	/*	const place = DUMMY_PLACES.find((p) => {
		return p.creator === userId;
	});
	const places = DUMMY_PLACES.filter((p) => {
		return p.creator === userId;
	});*/
	if (!usersPlaces || usersPlaces.places.length === 0) {
		return next(new HttpError('couldnt find userid', 404));		
	}

	res.json({ places: usersPlaces.places.map((place) => place.toObject({ getters: true })),len: usersPlaces.places.length });
	//res.json({ places });
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

	//check relationship with user and user most be exist to create place
	let user;
	try {
		user = await User.findById(creator);
	} catch (err) {
		const error = new HttpError('Failed to create place' + err, 500);
		return next(error);
	}

	if (!user) {
		const error = new HttpError('کاربر پیدا نشد', 404);
		return next(error);
	}
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

		//reverse actions if new place wont save as well as  user object
		const sess= await mongoose.startSession();
		sess.startTransaction();
		await createdPlace.save({sesssion:sess});
		user.places.push(createdPlace);
		await user.save({session:sess});
		await sess.commitTransaction();

		//await createdPlace.save();
	} catch (err) {
		const error = new HttpError('Failed to create place'+err, 500);
		//prevent execution of later codes
		return next(error);
	}

	res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new HttpError('لطفا اطلاعات ورودی را بررسی نمایید', 422);
		return next(error);
	}

	const { title, description } = req.body;
	const placeId = req.params.pid; //sth u have specified in router
	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError('این مکان وجود ندارد', 500);
		return next(error);
	}
	//const updatedPlace =
	//const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) }; //copy as new object by ...
	//const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
	//updatedPlace.title = title;
	place.title = title;
	//updatedPlace.description = description;
	place.description = description;

	try {
		await place.save();
	} catch (err) {
		const error = new HttpError('مشکل در آپدیت اطلاعات', 500);
		return next(error);
	}
	//DUMMY_PLACES[placeIndex] = updatedPlace;

	res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId).populate('creator'); //ref:User in Schema populate allows to use data in another collections.  lets you reference documents in other collections 
	} catch (err) {
		const error = new HttpError('  خطا در عملیات', 500);
		return next(error);
	}

	if (!place) {
		const error = new HttpError('مکان پیدا نشد', 404);
		return next(error);
	}

	try {
		//await place.remove();

		const sess= await mongoose.startSession();
		sess.startTransaction();
		await place.remove({sesssion:sess});
		place.creator.places.pull(place);//remove the id from the user
		await place.creator.save({session:sess});
		await sess.commitTransaction();

	} catch (err) {
		const error = new HttpError('مشکل در حذف اطلاعات', 500);
		return next(error);
	}
	/*if (DUMMY_PLACES.find((p) => p.id === placeId)) {
		throw new HttpError('مکان موردنظر وجود ندارد', 422);
	}
	DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);*/
	res.status(200).json({ message: 'Deleted Palce: ' + placeId });
};
//module.exports = //single object

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

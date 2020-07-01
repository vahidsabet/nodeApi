const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const DUMMY_USERS = [
	{
		id: 'u1',
		userName: 'VAhid',
		email: 'a.a@gmail.com',
		pass: 'test',
	},
];

const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, '-password'); //'email name' or '-password'
	} catch (err) {
		const error = new HttpError('درخواست شما  انجام نشد، لطفا دوباره تلاش کنید', 422);
		return next(error);
	}
	res.json({ users: users.map(user=>user.toObject({getters:true})) });
	//res.json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
	//check express validators
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);

		const error = new HttpError('لطفا اطلاعات ورودی را بررسی نمایید', 422);
		return next(error);
	}

	const { userName, email, password } = req.body;
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });

		if (existingUser) {
			const error = new HttpError('نام کاربری قبلا توسط شخص دیگری استفاده شده است', 422);
			return next(error);
		}
	} catch (err) {
		const error = new HttpError('ثبت نام انجام نشد، لطفا دوباره تلاش کنید', 422);
		return next(error);
	}

	/*const hasUser =User.findOne(// DUMMY_USERS.find((u) => u.email === email);
	if (hasUser) {
		throw new HttpError('نام کاربری قبلا توسط شخص دیگری استفاده شده است', 422);
	}*/
	const createUser = new User({
		userName,
		email,
		image: 'https://ziplin.ir/wp-content/uploads/2020/05/Smooth-Derm.jpg',
		password,
		places:[],
	});
	/*const createUser = {
		id: uuidv4(),
		userName,
		email,
		pass,
	};*/
	try {
		await createUser.save();
	} catch (err) {
		const error = new HttpError('مشکل در ثبت نام', 500);
		//prevent execution of later codes
		return next(error);
	}

	//DUMMY_USERS.push(createUser);
	res.status(201).json({ user: createUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
	//check express validators
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new HttpError('لطفا اطلاعات ورودی را کامل نمایید', 422);
		return next(error);
	}

	const { email, password } = req.body;
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('ثبت نام انجام نشد، لطفا دوباره تلاش کنید', 422);
		return next(error);
	}

	if (!existingUser || existingUser.password !== password) {
		const error = new HttpError('اطلاعات ورودی اشتباه است', 401);
		return next(error);
	}
	/*
	const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
	if (!identifiedUser || identifiedUser.password !== password) {
		throw new HttpError('اطلاعات ورودی اشتباه است', 401);
	}*/
	res.json({ message: 'ورود' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

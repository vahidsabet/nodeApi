const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const {validationResult}=require('express-validator');

const DUMMY_USERS = [
	{
		id: 'u1',
		userName: 'VAhid',
		email: 'a.a@gmail.com',
		pass: 'test',
	},
];

const getUsers = (req, res, next) => {
	res.json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {

	//check express validators
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError('لطفا اطلاعات ورودی را بررسی نمایید', 422);
    }
    
	const { userName, email, pass } = req.body;

	const hasUser = DUMMY_USERS.find((u) => u.email === email);
	if (hasUser) {
		throw new HttpError('نام کاربری قبلا توسط شخص دیگری استفاده شده است', 422);
	}
	const createUser = {
		id: uuidv4(),
		userName,
		email,
		pass,
	};

	DUMMY_USERS.push(createUser);
	res.status(201).json({ user: createUser });
};

const login = (req, res, next) => {

    //check express validators
	const errors= validationResult(req);
	if(!errors.isEmpty()){

		throw new HttpError("لطفا اطلاعات ورودی را کامل نمایید",422);
    }
    
	const { email, pass } = req.body;

	const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
	if (!identifiedUser || identifiedUser.pass !== pass) {
		throw new HttpError('اطلاعات ورودی اشتباه است', 401);
	}
	res.json({ message: 'ورود' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

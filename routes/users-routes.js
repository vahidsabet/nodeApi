const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controller');

const router = express.Router();

//placeId
router.get('/', usersController.getUsers);

router.post('/signup',[
    check('userName').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('pass').isLength({min:6})
], usersController.signup);

router.post('/login',[
    check('email').not().isEmpty(),
    check('pass').isLength({min:6})
], usersController.login);

//export
module.exports = router;

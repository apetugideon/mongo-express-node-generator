const users = require('../controllers/{ routeName }');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/usersAuth');
const multer = require('../middlewares/{ routeName }');

router.post('/api/v1/{ routeName }/signup', { routeName }.create);
router.post('/api/v1/{ routeName }/login', { routeName }.login);
// router.post('/api/v1/{ routeName }/facebook/login', { routeName }.facebooklogin);
// router.post('/api/v1/{ routeName }/google/login', { routeName }.googlelogin);
// router.post('/api/v1/{ routeName }/check', auth, { routeName }.checkDsUser);
// router.post('/api/v1/{ routeName }/reset', { routeName }.pwdreset);
router.get('/api/v1/{ routeName }/:id', auth, { routeName }.show);
router.put('/api/v1/{ routeName }/:id', auth, multer, { routeName }.update);
router.delete('/api/v1/{ routeName }/:id', auth, { routeName }.remove);

module.exports = router;
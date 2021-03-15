const express = require('express');
const router = express.Router();
const { routeName } = require('../controllers/{ routeName }');
const auth = require('../middlewares/usersAuth');
{ fileInclude }

router.post('/api/v1/{ routeName }', auth{ multerVariable }, { routeName }.store);
router.get('/api/v1/{ routeName }', auth, { routeName }.index);
router.get('/api/v1/{ routeName }/:id', auth, { routeName }.show);
router.put('/api/v1/{ routeName }/:id', auth{ multerVariable }, { routeName }.update);
router.delete('/api/v1/{ routeName }/:id', auth, { routeName }.remove);
router.post('/api/v1/{ routeName }/edit/:id', auth, { routeName }.edit);
router.post('/api/v1/{ routeName }/create', auth, { routeName }.create);
//router.post('/{ routeName }', auth, multer, { routeName }.store);


module.exports = router;

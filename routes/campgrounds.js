const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const campgrounds = require('../controllers/campgrounds')
const {validateCampground, isLoggedIn, isCampgroundFound, isAuthor} = require('../middleware');
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, wrapAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)    

router.route('/:id')
    .get(isCampgroundFound, wrapAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, wrapAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isCampgroundFound, isLoggedIn, isAuthor, wrapAsync(campgrounds.renderEditForm))

module.exports = router;
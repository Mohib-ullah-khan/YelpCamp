const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary/index')


const ImageSchema = new Schema({
    url: String,
    filename: String
})


ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
          type: String,
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    reviews: [
        {
            type: Schema.Types.ObjectId, 
            ref: "Review"
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, opts)


CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`
})

CampgroundSchema.post('findOneAndDelete', async function(campground) {
    if (campground) {
        if (campground.reviews) {
            await Review.deleteMany({
                _id : {
                    $in: campground.reviews
                }
            })
        }

        if (campground.images) {
            for (let img of campground.images) {
                await cloudinary.uploader.destroy(img.filename);
            }
        }
    }
})




module.exports = mongoose.model('Campground', CampgroundSchema);
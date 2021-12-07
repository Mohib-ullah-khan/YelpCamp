const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("Connection Successful")
    })
    .catch(err => {
        console.log("An error occured.");
        console.log(err)
    })


const sample = arr => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async() => {
    await Campground.deleteMany({});

    const numberOfCampsToSeed = 300;
    for (let i=0; i<numberOfCampsToSeed; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        const cityInfo = cities[randomCityIndex];
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            author: "61a7a2e42953396fe913c71a",
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cityInfo.city}, ${cityInfo.state}`,
            geometry : { 
                "type" : "Point", 
                "coordinates" : [
                    cityInfo.longitude, 
                    cityInfo.latitude
                ] 
            },
            images: [
                {
                        "url" : "https://res.cloudinary.com/dn5exhmpu/image/upload/v1638795735/YelpCamp/nzxzoud5qz9hux1nolnq.jpg",
                        "filename" : "YelpCamp/nzxzoud5qz9hux1nolnq",
                },
                {
                        "url" : "https://res.cloudinary.com/dn5exhmpu/image/upload/v1638795735/YelpCamp/j5ivtbdcmu0lojwjoel8.jpg",
                        "filename" : "YelpCamp/j5ivtbdcmu0lojwjoel8",
                }
            ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi nesciunt, obcaecati optio minus nostrum laboriosam, aperiam et similique provident quod molestiae aut a id libero. Saepe in fugit deleniti amet.',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    console.log("Successful Seeding! Connection Closed");
    mongoose.connection.close();
})


const mongoose = require("mongoose");
const Campground = require("../models/campground")
const citites = require("./citites"); 
const {places, descriptors} = require("./seedHelpers");

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", ()=>{
    console.log("database connected")
});


function sample(array){
    const random = Math.floor(Math.random() * array.length);
    // console.log(random);
    return array[random];
}
const gym  = ["alu","bhalu","cinu","deena" ]; 

const seedDB = async () =>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = parseInt(Math.floor(Math.random() *20) + 10);
        const camp = new Campground({
            author : "64ab9afe4d110ad90604d478",
            location : `${citites[random1000].city}, ${citites[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}`,
            description : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel cum quae, eum magni quibusdam suscipit dolorum velit iste non repellat.",
            price : price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dgkgn6mce/image/upload/v1689153996/YelpCamp/f1wsvvtwex1piqv9aaiw.jpg',
                    filename: 'YelpCamp/f1wsvvtwex1piqv9aaiw'
                  },
                  {
                    url: 'https://res.cloudinary.com/dgkgn6mce/image/upload/v1689154000/YelpCamp/cjzm2gozkjnlliyhl2s0.jpg',
                    filename: 'YelpCamp/cjzm2gozkjnlliyhl2s0'
                  }
              
                ],
                    geometry:{type:"Point",
                    coordinates:[citites[random1000].longitude, 
                            citites[random1000].latitude
                    ]
                }
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})
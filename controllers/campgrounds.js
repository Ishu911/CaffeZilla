const Campground = require("../models/campground");
const {cloudinary} = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken : mapBoxToken});

module.exports.index = async (req, res)=>{

    const campgrounds  = await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
    // console.log(campgrounds.images[0].url)
}

module.exports.renderNewForm =  (req, res)=>{
    res.render("campgrounds/new");

}

module.exports.createCampground = async(req, res,next)=>{
    const geoData  = await geocoder.forwardGeocode({
        query : req.body.campground.location,
        limit : 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry =  geoData.body.features[0].geometry;
    campground.author = req.user._id;
    campground.images = req.files.map(f=>({
        url : f.path, filename : f.filename
    }));
    await campground.save();
    req.flash("success", "Successfully made a new Cafe!");
    res.redirect(`/cafes/${campground._id}`);
}

module.exports.showCampground = async (req, res)=>{
    const {id} = req.params;
    const campground  = await Campground.findById(id).populate({
        path : "reviews",
        populate:{
            path:"author"
        }
    }).populate("author");
    if(!campground){
        req.flash("error", " Sorry, Cafe not found!")
        return res.redirect("/cafes")
    }
    res.render("campgrounds/show", {campground});
}

module.exports.renderEditForm = async (req, res)=>{
    const {id} = req.params;
    const campground  = await Campground.findById(id);
    if(!campground){
        req.flash("error", " Sorry, Cafe not found!")
        return res.redirect("/cafes")
    }
    res.render("campgrounds/edit", {campground});
}

module.exports.updateCampground = async (req, res)=>{
    const {id} = req.params;
    const campground =  await Campground.findByIdAndUpdate(id, {...req.body.campground});
    // console.log(req.body);
    const img = req.files.map(f=>({
        url : f.path, filename : f.filename
    }));
    campground.images.push(...img);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull : {images : {filename : {$in: req.body.deleteImages}}}});
    }
    req.flash("success", "Successfully updated Cafe!");
    res.redirect(`/cafes/${campground._id}`);
}

module.exports.deleteCampground =  async (req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted Cafe!");
    res.redirect("/cafes");
}
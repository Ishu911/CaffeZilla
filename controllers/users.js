const User = require("../models/user");

module.exports.renderRegister =  (req, res)=>{
    res.render("users/register");
}

module.exports.register = async (req, res)=>{
    try {
        const {username, email, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        
        req.login(registeredUser, err =>{
            if(err) return next(err);
            req.flash("success", "Welcome to CaffeZilla!")

            res.redirect("/cafes");
        })
        }catch (error) {
        req.flash("error", error.message);
        res.redirect("register");
    }
}

module.exports.renderLogin = (req, res)=>{
    res.render("users/login")
}

module.exports.login = (req, res)=>{
    req.flash("success", "Welcome Back!");
    const redirectUrl = res.locals.returnTo || "/cafes";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next)=>{
    req.logOut(function(err){
        if(err){
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/cafes");
    });
}


const router = require("express").Router()
const User = require("../model/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Category = require("../model/categories")

router.get("/contact", (req,resp)=>{
    resp.render("contact")
})

router.get("/",async(req,resp)=>{
    resp.render("home")
})

router.get("/main", (req,resp)=>{
    resp.render("main")
})

router.get("/product-page", (req,resp)=>{
    resp.render("product-page")
})
// ---------------------------------------------------------------------------------
// FOR RAGISTRATION PAGE
router.get("/reg",(req,resp)=>{
    resp.render("registration")
})
router.post("/do_register",async(req,resp)=>{
    try {
        const data = new User(req.body)
        await data.save();
        console.log(data);
        resp.render("registration",{msg:"Registration successfully done !!!"})
    } catch (error) {
        console.log(error);
    }
    // resp.render("registration")
})
// -----------------------------------------------------------------------------------
router.get("/shopping-cart", (req,resp)=>{
    resp.render("shopping-cart")
})
// -----------------------------------------------------------------------------------
// FOR LOGIN PAGE
router.get("/login",(req,resp)=>{
    resp.render("login")
})
router.post("/do_login", async(req,resp)=>{
    try {
    const data = await User.findOne({email:req.body.email})
    // console.log(data);
    const ismatch = await bcrypt.compare(req.body.pass,data.pass)
    // console.log(ismatch);
    if(ismatch){
        const token = await jwt.sign({_id:data._id}, process.env.S_KEY)//  token genration
        console.log("token:=>",token);     
        resp.cookie("jwt",token)//  Add coockie
        resp.render("home",{currentuser:data.uname})
       }
       else{
        resp.render("login",{err: "invalid credentials"})
       } 

  } catch (error) {
    console.log(error);
    resp.render("login",{err: "invalid credentials !!!"})
  }
// resp.render("login")
})
module.exports = router
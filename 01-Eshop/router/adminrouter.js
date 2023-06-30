const router = require("express").Router()
const Admin = require("../model/admins")
const jwt = require("jsonwebtoken")
const aauth = require("../middleware/adminauth")

router.get("/admin_dashboard",aauth,(req,resp)=>{
    resp.render("admin_dashboard")
})

router.get("/Users", (req,resp)=>{
    resp.render("Users")
})

router.get("/Orders", (req,resp)=>{
    resp.render("Orders")
})
// ----------------------------------------ADMIN LOGIN------------------------------------------------
router.get("/admin_login", (req,resp)=>{
    resp.render("admin_login")
})
router.post("/do_adminlogin",async(req,resp)=>{
    try {
        const admin = await Admin.findOne({uname: req.body.uname})
        // console.log(admin);
        if(admin.pass == req.body.pass) 
        {
            const token = await jwt.sign({_id : admin._id},process.env.A_KEY)
            resp.cookie("ajwt",token)
            resp.redirect("admin_dashboard")
        }
        else
        {
            resp.render("admin_login",{err:"Invalid credentials !!!"})
        }
    } catch (error) {
        console.log(error);
        resp.render("admin_login",{err:"Invalid credentials !!!"})
    }
})
// ------------------------------------ADMIN LOGOUT-------------------------------------------------

router.get("/do_adminlogout",async(req, resp) => {
    try {
        resp.clearCookie("ajwt")
        resp.render("admin_login")
    } catch (error) {
        console.log(error);
    }
})

// -------------------------------------CATEGORY PAGE-----------------------------------------------------

const Category = require("../model/categories")

router.get("/Category",async(req,resp)=>{
    try {
        const data = await Category.find()
        // console.log(data);
        resp.render("admin_category",{catdata:data})
    } catch (error) {
        console.log(error);
    }
})
router.post("/add_category",aauth,async(req,resp)=>{
    console.log(req.body.id);
    try {
           if(req.body.id==""){
           const cat = new Category(req.body)
           await cat.save()
           console.log(cat);
           resp.redirect("category")
           }
           else
           {
           await Category.findByIdAndUpdate(req.body.id,{catname:req.body.catname})
           resp.redirect("category")
           }
    } catch (error) {
        console.log(error);
    }
})

router.get("/editcategory",async(req,resp)=>{
    try {
      const _id = req.query.catid
      const data = await Category.findOne({_id : _id})
      const catdata = await Category.find()
      resp.render("admin_category",{edata: data,catdata:catdata})
    } catch (error) {
      console.log(error); 
    }
  })

  router.get("/deletecategory",async(req,resp)=>{
    try {
      const id = req.query.catid
      const data =  await Category.findByIdAndDelete(id)
      resp.redirect("category")
    } catch (error) {
      console.log(error); 
    }
  })
// -------------------------------------------PRODUCT PAGE------------------------------------------------
const product = require ("../model/product")
const multer = require("multer")
const fs = require("fs")

const storageEngine = multer.diskStorage({
    destination: "./public/productimg",
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}--${file.originalname}`);
    },
  });
  const upload = multer({
    storage: storageEngine,
  }); 

router.get("/Product",aauth,async(req,resp)=>{
    try {
        const catdata = await Category.find()

        const data = await product.aggregate([{$lookup:{from:"categories",localField:"catid",foreignField:"_id",as:"category"}}])
        resp.render("admin_product",{pdata:data,catdata:catdata})
    } catch (error) {
        console.log(error);
    }   
    // resp.render("admin_product")
})
router.post("/add_product",upload.single("img"),async(req,resp)=>{
    
    try {
        if(req.body.id=="")
        {
            const prod = new product ({
                catid:req.body.catid,
                pname:req.body.pname,
                price:req.body.price,
                qty:req.body.qty,
                img:req.file.filename
               })
            // console.log(prod);
                const dt = await prod.save()
                // console.log(dt);
                resp.redirect("Product")
        }
        else
        {
                const dt = await product.findByIdAndUpdate(req.body.id,{
                catid:req.body.catid,
                pname:req.body.pname,
                price:req.body.price,
                qty:req.body.qty,
                img:req.file.filename
               })
            // console.log(dt);
                resp.redirect("Product")
        }
        
    } catch (error) {
        console.log(error);
    }
})

router.get("/deleteproduct",async(req,resp)=>{
    try {
        const id = req.query.pid
        const data = await product.findByIdAndDelete(id)
        fs.unlinkSync("public/productimg/"+data.img)
        resp.redirect("product")

    } catch (error) {
        console.log(error);
    }
})

router.get("/editproduct", async (req, resp) => {
    try {
        const id = req.query.pid
        const data = await product.findOne({_id:id})
        const catdata = await Category.find()
        const prod = await product.aggregate([{$lookup:{from:"categories",localField:"catid",foreignField:"_id",as:"category"}}])
        resp.render("admin_product",{edata:data,catdata:catdata,pdata:prod})
        
    } catch (error) {
        console.log(error);
    }
})




module.exports=router
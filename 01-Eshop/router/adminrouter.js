const router = require("express").Router()
const Admin = require("../model/admins")
const jwt = require("jsonwebtoken")
const aauth = require("../middleware/adminauth")

router.get("/admin_dashboard",aauth,(req,resp)=>{
    resp.render("admin_dashboard")
})

router.get("/Product", (req,resp)=>{
    resp.render("admin_product")
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
// -------------------------------------ADMIN LOGOUT----------------------------------------------------

router.get("/do_adminlogout",async(req, resp) => {
    try {
        resp.clearCookie("ajwt")
        resp.render("admin_login")
    } catch (error) {
        console.log(error);
    }
})

// -------------------------------------CATEGORY-------------------------------------------------------

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
    try {
        const cat = new Category(req.body)
        // console.log(cat);
        await cat.save()
        resp.redirect("category")
    } catch (error) {
        console.log(error);
    }
})
router.get("/editcategory",async(req,resp)=>{
    try {
      const id = req.query.catid
      console.log(id);
      const data = await Category.findOne({_id : id})
      console.log(data);
      resp.render("updatecategory",{cdata: data})
    } catch (error) {
      console.log(error); 
    }
  })
  router.post("/update_category",async (req,resp)=>{
    try {
        const id = req.body.id
        console.log(id)
        const cdata = await Category.findByIdAndUpdate(id,req.body)
        console.log(cdata);
        resp.redirect("category")
    } catch (error) {
        console.log(error);
    }
  })
  router.get("/deletecategory",async(req,resp)=>{
    try {
      const id = req.query.catid
      const data =  await Category.findByIdAndDelete(id)
    //   fs.unlinkSync("public/img/"+udata.img)
      resp.redirect("category")
    } catch (error) {
      console.log(error); 
    }
  })

module.exports=router
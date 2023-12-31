const router = require("express").Router()
const auth = require("../middleware/auth")
const Category = require("../model/categories")
const product = require("../model/product")


router.get("/contact", (req,resp)=>{
    resp.render("contact")
})

router.get("/",async(req,resp)=>{
    try {
        const catdata = await Category.find()
        const prodata = await product.find()
        // console.log(prodata);
        resp.render("home",{catdata:catdata,prodata:prodata})
    } catch (error) {
        console.log(error);
    }
})

router.get("/main", (req,resp)=>{
    resp.render("main")
})

// ----------------------------------USER RAGISTRATION -----------------------------------------------
const User = require("../model/user")
const bcrypt = require("bcryptjs")
// const jwt = require("jsonwebtoken")

router.get("/reg",(req,resp)=>{
    resp.render("registration")
})
router.post("/do_register",async(req,resp)=>{
    try {
        const data = new User(req.body)
        await data.save();
        resp.render("registration",{msg:"Registration successfully done !!!"})
    } catch (error) {
        console.log(error);
    }
})

router.get("/login",(req,resp)=>{
    resp.render("login")
})
router.post("/do_login", async (req, resp) => {
    try {

        const user = await User.findOne({ email: req.body.email })
       

         if(user.Tokens.length>=10)
         {

          resp.render("login",{err:"Max user limit reached"})
          return;
         }
        const isValid = await bcrypt.compare(req.body.pass, user.pass)

        if (isValid) {

            const token = await user.generateToken()
            resp.cookie("jwt", token)
            resp.redirect("/")
            // resp.render("/")    
        }
        else {
            resp.render("login", { err: "Invalid credentials !!!" })
        }

    } catch (error) {
        resp.render("login", { err: "Invalid credentials !!!" })
    }
})

// ---------------------------Cart Page------------------------------------------------------------
const Cart = require("../model/carts")

router.get("/shopping-cart",auth,async(req,resp)=>{
    const user = req.user
    try {
        // const cartdata = await Cart.find({uid:user._id})
        const cartdata = await Cart.aggregate([{$match:{uid:user._id}},{$lookup:{from:"products",localField:"pid",foreignField:"_id",as:"product"}}])

        var sum = 0;
        for (let i = 0; i < cartdata.length; i++) {
            // console.log(cartdata[i].Total);
            sum = sum+cartdata[i].Total
        }
        // console.log(sum);

        resp.render("shopping-cart", { currentuser: user.uname, cartdata: cartdata, sum:sum})
    } catch (error) {
        console.log(error);
    }

})

router.get("/addCart",auth,async(req,resp)=>{
    const pid = req.query.pid
    const uid = req.user._id
    try {
        const pdata = await product.findOne({_id:pid})
        const cartdata = await Cart.findOne({pid:pid})
    if(cartdata)
    {
        var qty = cartdata.qty
        qty++;
        var price = qty * pdata.price
        // console.log(price);
        await Cart.findByIdAndUpdate(cartdata._id,{qty:qty,Total:price})

    }
    else{
            
            const cart = new Cart({
                uid:uid,
                pid:pid,
                price:pdata.price,
                qty:1,
                Total:pdata.price
            })
            const dt = await cart.save()
            resp.send("Product added into cart !!!!")
        }
        } catch (error) {
            console.log(error);
        }
})
router.get("/removefromcart",async(req,resp)=>{
    try {
        const _id = req.query.pid;
        // console.log(_id);
        await Cart.findByIdAndDelete(_id)
        resp.send("Product remove from cart")
        // resp.redirect("shopping-cart")
    } catch (error) {
        console.log(error);
    }
})
router.get("/changeQty",auth,async(req,resp)=>{
    try {
            const cid = req.query.cid
            const value = req.query.value

            const cartdata = await Cart.findOne({_id:cid})
            var qty = cartdata.qty+Number(value)
            if(qty!=0)
            { 
            var price = cartdata.price*qty
            await Cart.findByIdAndUpdate(cid,{qty : qty,Total:price})
            resp.send("updated")
            }
            else
            {
                resp.send("updated")
            }
    } catch (error) {
        console.log(error);
    }
})
// ---------------------------------------Payment---------------------------------------------------------
const Razorpay = require("razorpay")
const Order = require("../model/orders")
const nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jaydabhi20002@gmail.com',
      pass: 'cxbutyyoccqzrymo'
    }
  });

router.get("/payment",(req,resp)=>{
    const amt = req.query.amt
    // console.log(amt);
    var instance = new Razorpay({
        key_id: 'rzp_test_KKlu164SWMUaIG',
        key_secret: 'mzojOTQAhXQQ7NX2o0SbhzGr',
      });

    
var options = {
    amount: Number(amt)*100,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  instance.orders.create(options, function(err, order) {
    // console.log(order);
    resp.send(order)
  });
})

router.get("/confirmorder",auth,async(req,resp)=>{
    try {
        const payid = req.query.pid
        const uid = req.user._id
    
        const cartproduct = await Cart.find({uid:uid})
        var productlist = [];
        var alltotal = 0;
        var row = "";
        for(var i=0;i<cartproduct.length;i++)
        {
          const prod = await product.findOne({_id:cartproduct[i].pid})
          
          var pname = prod.pname
          var price = prod.price
          var qty = cartproduct[i].qty
          var total = Number(price)*Number(qty)
        //   console.log(prod);

        productlist[i] = {
            pname : pname,
            price : price,
            qty : qty,
            total : total,
        }
        alltotal = alltotal+total;
        row = row+"<tr><td>"+pname+"</td><td>"+price+"</td><td>"+qty+"</td><td>"+total+"</td></tr>"
        }
        const order = new Order({
        payid:payid,
        uid:uid,
        product:productlist,
        total:alltotal,
        date : Date.now()
    })
     const dt = await order.save()
     await Cart.deleteMany({uid:uid})
    //  console.log(dt);
    
    var mailOptions = {
        from: 'jaydabhi20002@gmail.com',
        to: req.user.email,
        subject: 'Order Conformation',
        html: "<table border='1'><tr><th>ProductName</th><th>Price</th><th>Qty</th><th>Total</th></tr>"+row+"<tr><td>All Total</td><td>"+alltotal+"</td></tr></table>"
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
            resp.send("Order Confirmed !!!")
        }
      });
    } catch (error) {
        console.log(error);
    }
})

// ----------------------------------------Product Page-----------------------------------------------

router.get("/product-page",async(req,resp)=>{
    try {
        
        const id = req.query.pid
        // console.log(id);
        const prodata = await product.findOne({_id:id})
        // console.log(prodata);
        resp.render("product-page",{prodata:prodata})
    } catch (error) {
        console.log(error);
    }
})
// -----------------------------------------checkout-----------------------------------------------------
const Checkout = require("../model/checkout")
router.get("/check-out",auth,async (req,resp)=>{
    const user = req.user
    try {
        // const cartdata = await Cart.find({uid:user._id})
        const cartdata = await Cart.aggregate([{$match:{uid:user._id}},{$lookup:{from:"products",localField:"pid",foreignField:"_id",as:"product"}}])
        // console.log(cartdata[0].product[0]);
        var sum = 0;
        for (let i = 0; i < cartdata.length; i++) {
            // console.log(cartdata[i].Total);
            sum = sum+cartdata[i].Total
        }
        // console.log(sum);

        resp.render("check-out", { currentuser: user.uname, cartdata: cartdata,sum:sum})
    } catch (error) {
        console.log(error);
    }
})

router.post("/do_check",async(req,resp)=>{
    try {
        const checkout = new Checkout(req.body)
        await checkout.save()
        // console.log(checkout);
        resp.redirect("do_payment")
    } catch (error) {
        console.log(error);
    }
})

router.get("/do_payment",auth,async(req,resp)=>{
    const user = req.user
    try {
         // const cartdata = await Cart.find({uid:user._id})
         const cartdata = await Cart.aggregate([{$match:{uid:user._id}},{$lookup:{from:"products",localField:"pid",foreignField:"_id",as:"product"}}])
         // console.log(cartdata[0].product[0]);
         var sum = 0;
         for (let i = 0; i < cartdata.length; i++) {
             // console.log(cartdata[i].Total);
             sum = sum+cartdata[i].Total
         }
        resp.render("payment", { currentuser: user.uname, cartdata: cartdata,sum:sum});
        
    } catch (error) {
        console.log(error);
    }
})

module.exports = router
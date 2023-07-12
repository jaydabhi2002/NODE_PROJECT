const mongoose = require("mongoose")
const express = require("express")
const app = express()
require("dotenv").config()
const path = require("path")
const hbs = require("hbs")
const bodyParser =require("body-parser")
const cookieParser =require("cookie-parser")
const cors = require('cors')
app.use(cors())

const PORT=process.env.PORT
const DB_URL=process.env.DB_URL

app.use(express.json())
mongoose.connect(DB_URL).then(()=>{
    console.log("My DataBase Connted");
}).catch(error=>{
    console.log(error);
})
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
const publicpath = path.join(__dirname,"../public")
const viewpath = path.join(__dirname,"../templetes/views")
const partialspath = path.join(__dirname,"../templetes/partials")

app.set("view engine","hbs")
app.set("views",viewpath)
hbs.registerPartials(partialspath)
app.use(express.static(publicpath))



app.use("/",require("../router/userouter"))
app.use("/",require("../router/adminrouter"))


app.listen(PORT,()=>{
    console.log("server running on PORT : "+PORT);
})

const mongoose = require("mongoose")

const checkoutschema = new mongoose.Schema({
    f_name:{
        type:String
    },
    l_name :{
        type : String
    },
    address:{
        type:String
    },
    city : {
        type : String
    },
    state : {
        type : String
    },
    p_code : {
        type : Number
    },
    moblie_no:{
        type:Number
    }
})
module.exports = new mongoose.model("checkout",checkoutschema)
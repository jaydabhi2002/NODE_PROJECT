const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const userschema = new mongoose.Schema({
    uname:{
        type:String
    },
    email:{
        type:String
    },
    phone:{
        type:String
    },
    pass:{
        type:String
    },
    Tokens : [
        {
            token : {
                type : String
            }
        }
    ]
   
})

userschema.pre("save",async function(){
try {
    if(this.isModified("pass")){
        this.pass = await bcrypt.hash(this.pass,10)
        // console.log(this.pass);
    }
} catch (error) {
    console.log(error);
}
})

userschema.methods.generateToken = async function(){
       
    try {
        const token = await jwt.sign({_id:this._id},process.env.S_KEY)
 
        this.Tokens = this.Tokens.concat({token:token})
        this.save()
        
        return token;
    } catch (error) {
        
    }
}

module.exports=new mongoose.model("user",userschema)
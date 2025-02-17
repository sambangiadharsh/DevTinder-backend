const mongoose=require("mongoose");
const validator=require("validator");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt")
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
}
const userSchema = mongoose.Schema({
    firstName: {
        type: String,  // Correct type for a string
        required: true  // Boolean value, not a string
    },
    lastName: {
        type: String  // Correct type for a string
    },
    emailId: {
        type: String,  // Correct type for a string
        required: true,
        trim: true,  // Automatically trims spaces before and after the value
        lowercase: true,  // Automatically converts the email to lowercase
        unique: true,
        validate: {
            validator: function(value) {
                return validator.isEmail(value);
            },
            message: "Invalid email format",
        },
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
        validate: {
            validator: isValidPassword, // ✅ Now it works
            message: "Password must have at least 6 characters, including one uppercase letter, one lowercase letter, and one digit",
        },
    },
    age: {
        type: Number,
        min:8,
    },
    gender: {
        type: String ,
        validate(value){
           if(!["male","female","others"].includes(value.toLowerCase())){
            throw new Error("gender not validated");
           }
        },
    },
    photoUrl: {
        type: String,
        validate: {
            validator: function (value) {
                return validator.isURL(value, { protocols: ["http", "https"], require_protocol: true });
            },
            message: "Invalid URL format",
        },
        default:"https://dentico.co.za/dr-hendricks-with-kid-2/"
    },
    about: {
        type: String,
        default: "this is about user"  // Default value
    },
    skills: {
        type: [String]  // Correct way to define an array of strings
    }
},{
    timestamps:true
}

);

userSchema.methods.hashPassword = async function () {
    this.password = await bcrypt.hash(this.password, 10);
};
userSchema.methods.getJWT=async function(){
    const user=this;
    const token = jwt.sign({ _id: user._id },"ADHARSH123", { expiresIn: "1h" });
    return token;
}

userSchema.methods.validatepassword=async function(password){
    const user=this;
    const hashedpassword=user.password;
    console.log(hashedpassword);
    const isvalidatepassword = await bcrypt.compare(password,hashedpassword);
    return isvalidatepassword;
}


const user=mongoose.model("user",userSchema);
module.exports=user;
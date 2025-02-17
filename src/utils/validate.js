const validator=require("validator");

const validate=(req)=>{
    const {firstName,lastName,password,emailId}=req.body;
    if(!firstName ||!lastName){
        throw new Error("name is not valid");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("email is not valid");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("password is not valid");
    }

}

const validateEditData=(req)=>{
    const allowedFields=["age","gender","about","skills","photoUrl","firstName","lastName","emailId"];

    const isEditAllowed=Object.keys(req.body).every(field=>allowedFields.includes(field));

    return isEditAllowed;

}
module.exports={validate,validateEditData};
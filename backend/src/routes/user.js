import express from 'express';
import {connect,findRoleByName} from '../../database.js'
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import {check, validationResult} from 'express-validator'
import jwt from 'jsonwebtoken';
import debug from  'debug';
import { validateBody } from '../middleware/validateBody.js';
import Joi from 'joi';
import { isLoggedIn, fetchRoles, mergePermissions, hasPermission} from '@merlin4/express-auth';
import { addEditRecord } from '../services/editService.js';

const debugUser = debug('app:Users');


const router = express.Router();


const loginUserSchema = Joi.object({
  email:Joi.string().trim().email().required(),
  password:Joi.string().trim().min(6).max(50).required()
});

//token maker
async function issueAuthToken(user){
  const payload = {_id: user._id, email: user.email, fullName: user.fullName};
  const secret  = process.env.JWT_SECRET_KEY; 
  const options = {expiresIn: '5h'}; 

  const roles = await fetchRoles(user, role => findRoleByName(role));

  //debugUser(roles)

  
  const permissions = mergePermissions(user, roles);
  payload.permissions = permissions;

  //token
  const token = jwt.sign(payload,secret,options);
  return token;
}

function issueAuthCookie(res,token) {
  const  cookieOptions={
    httpOnly : true,
    maxAge: 5*60*60*1000, //5 hours in miliseconds
    sameSite:'none',
    secure:true,
  };

  res.cookie('authToken',token,cookieOptions);
}


//login route
router.post('/login', validateBody(loginUserSchema), async(req,res)=>{
  try {
    //connect to db
    const db = await connect();
    //get the user from the db
    //use email
    const user = await db.collection("users").findOne({email: req.body.email});

    //check if user exists
    if(!user){
      //make it not informative which  field is wrong for security reasons
      return res.status(401).json({message: 'Invalid Email/Password.'});
    }

    //check if password match
    const isMatch = await bcrypt.compare(req.body.password,user.password);
    
    //if  not match send error message
    //make it not informative which  field is wrong for security reasons
    if (!isMatch) {
      return res.status(401).json({message:"Invalid Email/Password."});
    }

    //if all  checks pass create a new token and save it to the cookies
    const token = await issueAuthToken(user);
    issueAuthCookie(res,token);
    
    res.status(200).json({message:`Welcome ${user.fullName}, ${user._id}, ${token}`});
  }
  catch (error) {
    debugUser(error)
    return  res.status(500).json({message: "Internal Server Error"})
  }
});


//logout route
router.post('/logout', isLoggedIn(), async (req,res) => {
  res.clearCookie('authToken');
  res.status(200).json({message:'Logged Out'});
});


//users list
router.get('/list', isLoggedIn(), hasPermission('canViewData'), async(req,res) => { 
  
  try
  {
    let {keywords, role,maxAge,minAge,sortBy, pageSize, pageNumber} = req.query;
    const match = {}; 
    const sort = {givenName:1}; // ascending by default


    //check if  there are keywords in the query string and add them to the search filter
    if(keywords){
      match.$text = {$search: keywords};
    }
    
    //check if role is  provided in the query string
    if(role){
      match.role = role;
    }

    // Check if maxAge is provided and not falsy
    if (maxAge && maxAge > 0) {
      const maxAgeInDays = parseInt(maxAge);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);
      match.creationDate = { $gte: cutoffDate };
    }

     // Check if minAge is provided and not falsy
     if (minAge && minAge > 0) {
      const minAgeInDays = parseInt(minAge);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - minAgeInDays);
      match.creationDate = { $lt: cutoffDate };
    }


    // Implement sorting based on sortBy parameter
    switch (sortBy) {
      case 'givenName':
        sort.givenName = 1;
        sort.familyName = 1;
        sort.creationDate = 1;
        break;
      case 'familyName':
        sort.familyName = 1;
        sort.givenName = 1;
        sort.creationDate = 1;
        break;
      case 'role':
        sort.role = 1;
        sort.givenName = 1;
        sort.familyName = 1;
        sort.creationDate = 1;
        break;
      case 'newest':
        sort.creationDate = -1;
        break;
      case 'oldest':
        sort.creationDate = 1;
        break;
      default:
        // Default to sorting by givenName
        sort.givenName = 1;
        sort.familyName = 1;
        sort.creationDate = 1;
    }


    //set up the pagination
    pageNumber = parseInt(pageNumber) || 1; // set the default page number to page 1
    pageSize = parseInt(pageSize) || 5;     //default the page size to 5 document if not  provided

    //process the pipeline/update the pipeline
    const pipeline = [
      {$match: match},
      {$sort: sort},
      {$skip: (pageNumber - 1) * pageSize},
      {$limit: pageSize},
      {
        $project: {
          password: 0 // exclude password
        }
      }
    ];

    const db = await connect(); //connect to the db.
    const cursor = await db.collection('users').aggregate(pipeline);
    const users = await cursor.toArray();

    //return
    return res.status(200).json(users);
  }  
  catch(error)
  {
    debugUser(error)
   return res.status(500).json({message:'Server Error'});
  }

}); 


router.get('/me', isLoggedIn(), async(req,res)=>
{
  try {
    const currentUser = req.auth; //get the current user info

    //get the user from the db
    const db = await connect();

    //get the user from db, exclude password
    const user = await db.collection("users").findOne(
      {_id : new ObjectId(currentUser._id)}, 
      {projection:{password:0}}
    );
   
    //check if found in db
    if(!user){
      return res.status(404).json({message:'User Record Not Found...'});
    }

    return res.status(200).json(user);
    
  } 
  catch (error) {
    return res.status(500).json({message: 'Internal Server Error.'});
  }
});



//get user by id
router.get(`/:userID`, isLoggedIn(),hasPermission('canViewData'),async(req,res)=>{

  try {

    //connect to the db
    const db = await connect();

    //get the user from users collection
    const user = await  db.collection("users").findOne(
      {_id : new ObjectId(req.params.userID)},
      {projection: {password: 0}} //exclude password
    );
  
    if(user){
      res.status(200).json(user);
    }
    else{
      //send error message if user isn't found
      res.status(404).json({message:'No User Found...'});
    } 
  } 
  catch (error) {
    return res.status(500).json({message: 'Internal Server Error.'});
  }

});


router.post(`/register`,
[
  check('email',  'Email is not valid').isEmail(),
  check('password','Password must be at least 6 characters long and contain a number').isLength({min:6}),
  check('fullName', 'Full Name field cannot be empty').isString(),
  check('givenName', "Given name is Required").isString(),
  check('familyName', 'Family name is required').isString(),
]
,async(req,res) => {
  
  // get the errors if there is any
  const errors = validationResult(req);
  //if errors is not empty then store the errors into json array
  if (!errors.isEmpty()) 
  {
    return res.status(400).json({message: errors.array()});
  }

  try{
    const  newUser  = req.body;
    //check if user already exists in DB/array
    const db = await connect();
    const findUser = await db.collection("users").findOne({email :newUser.email.toLowerCase()}); //convert email to lower case

    //if user exists, send message
    if(findUser)
    {
      res.status(400).json({message: 'Email is already in used.'});
    }
    else{
      newUser.email = newUser.email.toLowerCase();  //make sure to  convert email to lowercase for consistency
      newUser.role = ['Developer'];
      newUser.creationDate = new Date();
      newUser.password = await bcrypt.hash(newUser.password ,10); //encryption of password using bcrypt
      await db.collection('users').insertOne(newUser);            //add the new user to the db

      // //add record to edits collection
      await addEditRecord(
        'user',       //collection name
        'insert',     //operation
        newUser._id,  //targetId
        newUser       //update
      );
  
      res.status(201).json({message:  `New user created with the email ${newUser.email}`});
    }
  }
  catch(error){
    debugUser(error)
    return res.status(500).json({message: 'Server Error.'})
  }
});


router.put(`/me`,isLoggedIn(), async (req,res) => {
  try{
    const updatedUser = req.body;
    const currentUser = req.auth; // current user

    // check if the user id exists in the db
    const db = await connect();
    const user = await db.collection('users').findOne({_id : new ObjectId(currentUser._id)});

    //check if user exists
    if(!user){
      return res.status(404).json({ message : "No User Found With This ID!" });
    }

     // Check if user is trying to change their role
     if (updatedUser.role && updatedUser.role !== user.role) {
      return res.status(403).json({ message: "Changing user role is not allowed." });
    }

  
    //check if user wants to update its email
    if(updatedUser.newEmail !== '' ){
      const checkEmail = await db.collection('users').findOne({email: updatedUser.newEmail.toLowerCase()});

      //check if email already in use in db
      if(checkEmail){
        return res.status(409).json({ message : "This Email Is Already In Use." });
      }
      else{
        //add information on last updated
        user.lastUpdatedOn = new Date();
        user.lastUpdatedBy = currentUser;
        //add the new email to the user document
        user.email = updatedUser.newEmail;
      }
    }

    //check if user wished to change their password
    if(updatedUser.newPassword !== '' && updatedUser.currentPassword !== ''){
      //check if  the provided current password and the password in the db match
      //if matched, encrypt the new password and save it to db
      if(await bcrypt.compare(updatedUser.currentPassword, user.password)){
        //add information on last updated
        user.lastUpdatedOn = new Date();
        user.lastUpdatedBy = user;
        //hash and update the user's password
        user.password = await bcrypt.hash(updatedUser.newPassword, 10);
      }
      else{
        return res.status(403).json({ message : "Current Password Is Incorrect." });
      }
    };

    //check if givenName, familyName, fullName from updatedUser has value, if there is value  add/update them to user object
    user.givenName = updatedUser.givenName ? updatedUser.givenName : user.givenName;
    user.familyName = updatedUser.familyName ? updatedUser.familyName : user.familyName;
    user.fullName = updatedUser.fullName ? updatedUser.fullName : `${user.givenName} ${user.familyName}`;

    // Update user document in the database
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(currentUser._id) },
      { $set: user },
      { returnOriginal: false }
    );


    if (!result) {
      return res.status(200).json({ message: 'No changes made.' });
    }

    //add a record to edits  collection for tracking purposes
    await addEditRecord(
      "user",   //collection
      "update", //operation
      user._id, //targetId
      user,     //updated field
      req.auth  //author
    );

    //if all  checks pass create a new token and save it to the cookies
    const token = await issueAuthToken(user);
    issueAuthCookie(res,token);

    return res.status(200).json({message:'Updated Successfully.'});
  }
  catch(error){
    debugUser(error)
    res.status(500).json({ message: "Failed to Update User", error });
  }
});



router.put(`/:userID`,isLoggedIn(), hasPermission('canEditAnyUser'), async (req,res) => {
	
  try{
    const updatedUser = req.body;

    // check if the user id exists in the db
    const db = await connect();
    const user = await db.collection('users').findOne({_id : new ObjectId(req.params.userID)});

    //check if user exists
    if(!user){
      return res.status(404).json({ message : "No User Found With This ID!" });
    }

    //check if user wants to update its email
    if(updatedUser.newEmail !== ''){
      const checkEmail = await db.collection('users').findOne({email: updatedUser.newEmail.toLowerCase()});
      
      //check if email already in use in db
      if(checkEmail){
        return res.status(409).json({ message : "This Email Is Already In Use." });
      }
      else{
        //add information on last updated
        user.lastUpdatedOn = new Date();
        user.lastUpdatedBy = user;
        user.email = updatedUser.newEmail;
      }
    }

    //check if user wished to change their password
    if(updatedUser.password !== '' || updatedUser.currentPassword !== ''){
      //check if  the provided current password and the password in the db match
      //if matched, encrypt the new password and save it to db
      if(await bcrypt.compare(updatedUser.currentPassword, user.password)){
        //add information on last updated
        user.lastUpdatedOn = new Date();
        user.lastUpdatedBy = user;
        //hash and update user password
        user.password = await bcrypt.hash(updatedUser.password, 10);
      }
      else{
      return res.status(403).json({ message : "Current Password Is Incorrect." });
      }
    }

    const result = await db.collection("users").updateOne( { _id : user._id } ,{$set: user});

    if(result.modifiedCount !== 1){
      return res.status(400).json({message: 'No  fields were modified.'})
    }

    //add a record to edits  collection for tracking purposes
    await addEditRecord(
      "user",   //collection
      "update", //operation
      user._id, //targetId
      user,     //updated field
      req.auth  //author
    );

    return res.status(200).json({message:'Updated Successfully.'});
  }
  catch(error){
    debugUser(error)
    res.status(500).json({ message: "Failed to Update User", error });
  }
});

router.delete(`/:userID`,isLoggedIn(), hasPermission('canEditAnyUser'), async(req,res) =>{

try
{
  //connect to db
  const db = await connect();
  //check user if it exists in db
  const user  = await  db.collection('users').findOne({_id : new ObjectId(req.params.userID)} );
  if (!user)
  {
    return res.status(404).json({ message:"This user does not exist"})
  }
  else
  {
    await db.collection('users').findOneAndDelete({_id: user._id });

     //add a record to edits collection for tracking purposes
     await addEditRecord(
      "user",   //collection
      "update", //operation
      user._id, //targetId
      user,     //updated field
      req.auth  //author
    );

    return res.status(200).json("User has been deleted");
  }
}
catch(error)
{
  return  res.status(500).json({message:"Server Error", error});
}

});





export{ router as userRouter }
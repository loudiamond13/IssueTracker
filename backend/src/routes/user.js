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
import crypto from 'crypto';
import emailSender from '../utilities/emailSender.js';


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
    sameSite:'strict',
    secure:true,
  };

  res.cookie('authToken',token,cookieOptions);
}


//login route
router.post('/login', validateBody(loginUserSchema), async(req,res)=>{
  try {
    //connect to db
    const db = await connect();
    //get the user from the db (using email)
    const user = await db.collection("users").findOne({email: req.body.email});

    //check if user exists
    if(!user){
      //make it not informative, which ever field is wrong for security reasons
      return res.status(401).json({message: 'Invalid Email/Password.'});
    }

    //check if password matched
    const isMatch = await bcrypt.compare(req.body.password,user.password);
    
    //if  not matched send error message
    //make it not informative, which ever field is wrong for security reasons
    if (!isMatch) {
      return res.status(401).json({message:"Invalid Email/Password."});
    }

    //if all  checks passed, create a new token and save it to the cookies
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
//remove the authToken
router.post(`/logout`, async (req,res)=>{
  res.clearCookie('authToken')
  return res.status(200).json({message:`You have been logged out.`})
});


//users list
router.get('/list', isLoggedIn(), hasPermission('canViewData'), async(req,res) => { 
  try {
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


    //implement sorting based on sortBy parameter
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
        break;
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
      {$project: { password: 0 } }//do not include the password field
    ];

    const db = await connect(); //connect to the db.
    const totalCount = await db.collection('users').countDocuments(match);
    const cursor = await db.collection('users').aggregate(pipeline);

    const users = await cursor.toArray();

    //return
    return res.status(200).json({users, totalCount});
  }  
  catch(error)
  {
    debugUser(error)
    return res.status(500).json({message:'Server Error'});
  }
});


//gets all users for the dropdown select
router.get('/get-all-users', isLoggedIn(), async(req,res)=>{
  try {
    const db = await connect();
    
    //get all users from the users collection (do not include password)
    const users = await db.collection('users').find({},{projection: {password: 0}}).toArray();

    //check if there are users retrieved
    //if there is no users retrieved, send an error message
    if(users.length === 0){
      return res.status(404).json({message: 'No user found...'});
    }

    //send back a response with status code and json data of the users
    return res.status(200).json(users);

  } 
  catch (error) {
    return res.status(500).json({message:'Internal Server Error.'});
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
      return res.status(404).json({message:'No User Record Found...'});
    }

    return res.status(200).json(user);
    
  } 
  catch (error) {
    return res.status(500).json({message: 'Internal Server Error.'});
  }
});


//get user by id
router.get('/:userId', isLoggedIn(), hasPermission('canViewData'), async(req,res)=>{
  try {

    //connect to the db
    const db = await connect();

    //get the user from users collection
    const user = await  db.collection("users").findOne(
      {_id : new ObjectId(req.params.userId)},
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
  check('password','Password must be at least 8 characters long and contain a number').isLength({min:6}),
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
    const userToRegister = req.body;
    const  newUser = {};
    //check if user already exists in DB/array
    const db = await connect();
    const findUser = await db.collection("users").findOne({email : userToRegister.email.toLowerCase()}); //convert email to lower case

    //if user exists, send message
    if(findUser)
    {
      return res.status(400).json({message: 'Email is already in used.'});
    }
    
    newUser.fullName = `${userToRegister.givenName} ${userToRegister.familyName}`
    newUser.email = userToRegister.email.toLowerCase();  //make sure to  convert email to lowercase for consistency
    newUser.givenName = userToRegister.givenName;
    newUser.familyName = userToRegister.familyName;
    newUser.role = ['Developer'];
    newUser.creationDate = new Date();
    newUser.password = await bcrypt.hash(userToRegister.password ,10); //encryption of password using bcrypt
    newUser.isEmailVerified = false;
    await db.collection('users').insertOne(newUser);            //add the new user to the db

    //issue a token for the new registered user
    const token = await issueAuthToken(newUser);
    issueAuthCookie(res,token); 

    // //add record to edits collection
    await addEditRecord(
      'user',       //collection name
      'insert',     //operation
      newUser._id,  //targetId
      newUser       //update
    );

    
    //create email token and add it to the db (for verification porpuses)
    const emailToken = crypto.randomBytes(32).toString("hex");
    await db.collection('emailToken').insertOne({
      userID: newUser._id,
      email : newUser.email,
      token : emailToken,
    });

    //make the url for the verication
    const url = `${process.env.FRONTEND_URL || process.env.WEB}/user/${newUser._id.toString()}/verify/${emailToken}`;
    //send the email
    await emailSender(newUser.email, "Verify Email", 
      `<p>Hello ${newUser.givenName},</p>
      <br/>
      <p>Click <a href='${url}'>here</a> to verify your email. If you didn't make this request just ignore this email.</p>
      </br>
      <p>Thank you,</p>
      <p>Issue Tracker</p>`
    );


    res.status(201).json({message:  `New user created with the email ${newUser.email}`});
    
  }
  catch(error){
    debugUser(error);
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


  
    //check if user wants to update its email
    //check if the passed in email and the user email from the db matched, if it don't matched then check if the email is already in use
    if(updatedUser.email.toLowerCase() !== user.email.toLowerCase() ){
      const checkEmail = await db.collection('users').findOne({email: updatedUser.email.toLowerCase()});

      //check if email already in use in db
      if(checkEmail){
        return res.status(409).json({ message : "This Email Is Already In Use." });
      }
      else{
        //create email token and add it to the db (for verification porpuses)
        const emailToken = crypto.randomBytes(32).toString("hex");
        await db.collection('emailToken').insertOne({
          userID: new ObjectId(user._id),
          email : user.email,
          token : emailToken,
        });

         //make the url for the verication
        const url = `${process.env.FRONTEND_URL || process.env.WEB}/user/${user._id.toString()}/verify/${emailToken}`;
        //send the email
        await emailSender(user.email, "Verify Email", 
          `<p>Hello ${user.givenName},</p>
          <br/>
          <p>Click <a href='${url}'>here</a> to verify your email. If you didn't make this request just ignore this email.</p>
          </br>
          <p>Thank you,</p>
          <p>Issue Tracker</p>`
        );

        //set the isVerifiedEmail of this user to false
        newUser.isEmailVerified = false;
        //add the new email to the user document
        user.email = updatedUser.email.toLowerCase();
      }
    }

    //check if user wished to change their password
    if(updatedUser.newPassword !== '' && updatedUser.confirmNewPassword !== ''){
      //check if  the provided current password and the password in the db match
      //if matched, encrypt the new password and save it to db
      if(await bcrypt.compare(updatedUser.currentPassword, user.password)){
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
    user.fullName = `${updatedUser.givenName} ${updatedUser.familyName}`;
     //add information on last updated
     user.lastUpdatedOn = new Date();
     user.lastUpdatedBy = currentUser;

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
      user,     //updated 
      req.auth  //author
    );

    //if all  checks pass create a new token and save it to the cookies
    const token = await issueAuthToken(user);
    issueAuthCookie(res,token);

    //check if there is a bug assigned to this user
    //if so, change all bug assignedTo, to this updated user 
    const assignedToBug = await db.collection("bugs").find({"assignedTo.userId": user._id.toString()}).toArray();

 

    if(assignedToBug.length > 0){
      //update  bugs that are currently assigned to this user
      assignedToBug.forEach(async (bug)=> {
        await db.collection('bugs').updateOne( 
          {_id: bug._id},
          {$set:{assignedTo:{userId: user._id.toString() , fullName: user.fullName, email: user.email}}}
          );
      });
    }

    //check if the passed in user has created bug
    const createdBug = await db.collection('bugs').find({'createdBy.userId':user._id.toString() }).toArray();

    if(createdBug.length > 0){
      //update the 'createdBy' field for these bugs
      createdBug.forEach(async(bug) => {
        await db.collection('bugs').updateOne(
          {_id: bug._id},
          {$set:{createdBy:{userId: user._id.toString() , fullName: user.fullName, email: user.email}}}
        )
      });
    }




    return res.status(200).json({message:'Updated Successfully.'});
  }
  catch(error){
    debugUser(error)
    res.status(500).json({ message: "Failed to Update User", error });
  }
});



router.put(`/:userId`,isLoggedIn(), hasPermission('canEditAnyUser'), async (req,res) => {
	
  try{
    const updatedUser = req.body;

    // check if the user id exists in the db
    const db = await connect();
    const user = await db.collection('users').findOne({_id : new ObjectId(req.params.userId)});

    //check if user exists
    if(!user){
      return res.status(404).json({ message : "No User Found With This ID!" });
    }

    //check if user wants to update its email
    if(updatedUser.email !== user.email){
      const checkEmail = await db.collection('users').findOne({email: updatedUser.email.toLowerCase()});
      
      //check if email already in use in db
      if(checkEmail){
        return res.status(409).json({ message : "This Email Is Already In Use." });
      }
      else{
        //create email token and add it to the db (for verification porpuses)
        const emailToken = crypto.randomBytes(32).toString("hex");
        await db.collection('emailToken').insertOne({
          userID: new ObjectId(user._id),
          email : user.email,
          token : emailToken,
        });


        //make the url for the verication
        const url = `${process.env.FRONTEND_URL || process.env.WEB}/user/${newUser._id}/verify/${emailToken}`;
        //send the email
        await emailSender(user.email, "Verify Email", 
          `<p>Hello ${user.givenName},</p>
          <br/>
          <p>Click <a href='${url}'>here</a> to verify your email. If you didn't make this request just ignore this email.</p>
          </br>
          <p>Thank you,</p>
          <p>Issue Tracker</p>`
        );

        //set the isVerifiedEmail of this user to false
        newUser.isEmailVerified = false;
        user.email = updatedUser.email.toLowerCase();
      }
    }

    //check if user wished to change password
    if(updatedUser.password !== ''){
      //hash and update user password
      user.password = await bcrypt.hash(updatedUser.password, 10);
    }

    //add information on last updated
    user.lastUpdatedOn = new Date();
    user.lastUpdatedBy = req.auth;

    user.givenName = updatedUser.givenName;
    user.familyName = updatedUser.familyName;
    user.fullName = `${updatedUser.givenName} ${updatedUser.familyName}`;
    user.role = updatedUser.role;

    const result = await db.collection("users").updateOne( { _id : user._id } ,{$set: user});
    

    //check if  the update was successful or not
    if(!result.acknowledged){
      return res.status(400).json({message: 'Update Failed'});
    }

    //check if the current  logged-in user is updating his/her own
    if(req.auth._id === user._id.toString()) {
      //if current user is updating its own  profile then set token with new data
      const token = await issueAuthToken(user);
      issueAuthCookie(res,token);
    }

    //check if there is a bug assigned to this user
    //if so, change all bug assignedTo, to this updated user 
    const assignedToBugs = await db.collection("bugs").find({"assignedTo.userId": user._id.toString()}).toArray();
  
    if(assignedToBugs.length > 0){
      //update  bugs that are currently assigned to this user
      assignedToBugs.forEach(async (bug)=> {
        await db.collection('bugs').updateOne( 
          {"_id" : bug._id}, 
          {$set:{assignedTo:{userId: user._id.toString() , fullName: user.fullName, email: user.email}}}
          );
      });
    }

    //check if the passed in user has created bug
    const createdBugs = await db.collection('bugs').find({'createdBy.userId':user._id.toString() }).toArray();

    if(createdBugs.length > 0){
      //update the 'createdBy' field for these bugs 
      createdBugs.forEach(async(bug) => {
        await db.collection('bugs').updateOne(
          {_id: bug._id},
          {$set:{createdBy:{userId: user._id.toString() , fullName: user.fullName, email: user.email}}}
        )
      });
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



//deletes user by id
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

//verifies the user 
router.post('/:userID/verify/:token', async(req, res) => {
  try {

    
    //connect to db
    const db = await connect();

    //get the token from the db
    const token = await db.collection("emailToken").findOne({userID: new ObjectId(req.params.userID), token: req.params.token});

    console.log(token)

    //check if token exists
    if(!token)
    {
      console.log('null token');
      //if token do not exists, send error message
      return res.status(400).json({message: 'Invalid Link'});
    }

    //get the user from db
    const user = await db.collection("users").findOne({_id: new ObjectId(req.params.userID)});

    //check if user exists 
    if(!user)
    {
      //if user fo not exists, send error message
      return res.status(400).json({message: 'Invalid Link'}); 
    }

    //if user exists, update the user
    user.isEmailVerified = true;
    //update the user in db
    await db.collection("users").updateOne({_id: new ObjectId(req.params.userID)}, {$set: user});

    //delete the token
    await db.collection("emailToken").deleteOne({userID: new ObjectId(req.params.userID), token: req.params.token});

    //send success message
    return res.status(200).json({message: 'Email Verified'});
    

  } 
  catch (error) {
    console.log(error);
    return res.status(500).json({message: 'Internal Server Error!'});
  }
})


router.post('/resend-email-verification', isLoggedIn(), async(req,res)=> {
  try {
    const currentUser = req.auth;   

    debugUser(currentUser._id);
    const db = await connect();
    const user = await db.collection("users").findOne({_id: new ObjectId(currentUser._id)}); // find the user from db
    //check if current user exists in db
    if(!user){
      return res.status(404).json({message: "Error on getting user."});
    }

    const newEmailToken = crypto.randomBytes(32).toString('hex'); //new token
    //check if this current user has existing token
    const token = await db.collection("emailToken").findOne({userID: new ObjectId(currentUser._id)});
    if(token){
      await db.collection("emailToken").findOneAndUpdate(
        {userID: new ObjectId(currentUser._id) },
        {$set: {token: newEmailToken}}
      );
    }
    //else if there is no existing token for this user, make one/ insertOne
    else{
      await db.collection("emailToken").insertOne({
        userID: new ObjectId(user._id),
        email: user.email,
        token: newEmailToken,
      });
    }

    const url = `${process.env.FRONTEND_URL || process.env.WEB}/user/${user._id.toString()}/verify/${newEmailToken}`;
    //send the email
    await emailSender(user.email, "Verify Email", 
      `<p>Hello ${user.givenName},</p>
      <br/>
      <p>Click <a href='${url}'>here</a> to verify your email. If you didn't make this request just ignore this email.</p>
      </br>
      <p>Thank you,</p>
      <p>Issue Tracker</p>`
    );

    return res.status(200).json({message: 'Email Verification Sent.'});


  } 
  catch (error) {
    return res.status(500).json({message: 'Internal Server Error'});
  }
});



export{ router as userRouter }
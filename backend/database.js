import * as dotenv from 'dotenv';
dotenv.config();
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from 'bcryptjs';
import debug from 'debug';
const debugDB = debug('app:Database');




let _db = null ;

async function connect()
{
  if(!_db)
  {
    const connectionString = process.env.MongoDB_CONNECTION_STRING;
    const dbName = process.env.DB_NAME;
    const client = await MongoClient.connect(connectionString);
    _db = client.db(dbName);
  }

  debugDB('Connected to MongoDB')
  return _db;
}

async function ping() 
{
  const db = await connect();
  await db.command({ping:1});
  debugDB("Pinged MongoDB Server");
}


//get all users function from db
async function getAllUsers()
{
  const db = await connect();
  const users = await db.collection('users').find().toArray();
  return users;
}

//get user by id from  db
async function getUserByID(userID)
{
  const  db = await connect();
  const user = await db.collection('users').findOne({_id: userID});

  return user;
} 


//create/add user to db
async function registerUser(newUser)
{
  newUser.password =await bcrypt.hash(newUser.password, 6); //encrypt password before saving it in the database
  const db = await connect();
  const user = await db.collection('users').insertOne(newUser);
  return user;
}


//check/find user by email
async function findUserByEmail(email)
{
  const db = await connect();
  const  user = await db.collection('users').findOne({email: email});
  return user;
}


//update user
async function updateUser(userID, updatedUser)
{
  const db= await connect();

  const user  = await getUserByID(userID);

  
  const isPasswordChanged = await bcrypt.compare(updatedUser.password , user.password);
 

  if(!isPasswordChanged)
  {
    updatedUser.password = await bcrypt.hash(updatedUser.password, 6);
  }

  const result = await db.collection("users").updateOne( { _id : userID } ,{$set: updatedUser});
  
  return result;
}

//delete a user
async function deleteUser(userID)
{
  const  db =await connect() ;

  const user = await db.collection('users').findOneAndDelete({_id: userID });

  return user;

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Bug get All
async function getAllBugs()
{
  const db = await connect();
  const bugs = await db.collection('bugs').find().toArray();
  return bugs;
}

//get bug by ID
async function getBugByID(bugID)
{
  const db= await connect();
  const bug = db.collection('bugs').findOne({_id: bugID});
  return bug;
}

//create a bug
async function createBug(newBug)
{
  const db = await connect();
  const bug = await db.collection('bugs').insertOne(newBug);
  return bug.insertedId;
}

//update a bug
async function updateBug(bugID, updatedBug)
{
  const db = await connect();
  const  result = await db.collection("bugs").updateOne( { _id : bugID } , { $set: updatedBug });
  return result;
}

/////////////////////////////////////COMMENT////////////////////////////////
async function findRoleByName(name){
  const db = await connect();
  const role = await db.collection("roles").findOne({name:name});
  return role;
}


ping();


export{
  ping, connect, getAllUsers, getUserByID, registerUser, findUserByEmail, findRoleByName,
  updateUser, deleteUser, getAllBugs, getBugByID, createBug, updateBug,
}
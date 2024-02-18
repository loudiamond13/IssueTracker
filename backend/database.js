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

  const result = await db.collection("users").updateOne( { _id : userID } ,{$set: updatedUser})
  
  return result;
}

//delete a user
async function deleteUser(userID)
{
  const  db =await connect() ;

  const user = await db.collection('users').findOneAndDelete({_id: userID });

  return user;

}

ping();


export{ping, connect, getAllUsers,getUserByID,registerUser,findUserByEmail,updateUser,deleteUser}
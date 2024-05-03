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





async function findRoleByName(name){
  const db = await connect();
  const role = await db.collection("roles").findOne({name:name});
  return role;
}


ping();


export{
  ping, connect, findRoleByName,
}
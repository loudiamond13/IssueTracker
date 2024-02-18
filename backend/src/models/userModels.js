import mongoose from 'mongoose';
import { types } from 'sass';

export const UserType = 
{
  email: String,
  password: String,
  fullName: String,
  givenName: String,
  familyName: String,
  role:String,
};

const  userSchema= new mongoose.Schema({
  email: { type : String , required : true, unique: true},
  password : {type : String ,required : true },
  fullName:{type: String, required: true},
  givenName: {type: String, required: true},
  familyName: {type: String, required: true},
  role: {type: String, default:'developer'},
});

const User = mongoose.model<UserType>('User', userSchema);

export default User;
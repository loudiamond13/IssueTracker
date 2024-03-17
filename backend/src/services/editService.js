import {connect} from '../../database.js';

async function addEditRecord(collectionName, operation, targetId, data,author){
  try {
    //connect to db
    const db = await connect();
    //get the edits collection
    const editsCollection = await db.collection('edits');
    
    const editRecord = {
      timestamp: new Date(),
      col: collectionName,
      op: operation,
      target: targetId,
      update: data,
      author: author,
    }

    //insert the edit record  into the database
    await editsCollection.insertOne(editRecord);
    
    //return
    return {success: true, message: 'Edit record added successfully.'};
  } 
  catch (error) {
    return {success: false, message : 'Failed to add edit record.'};
  }
}


export {addEditRecord};
import {useQuery} from  "react-query";
import * as apiClient from '../api-client'

const Bugs =()=>
{

  const {data:bugs} = useQuery('getAllBugs',apiClient.getAllBugs,
  {
    onError:() => alert("Failed to load bugs")
  });

  if(!bugs) return <div>Loading...</div>;

  return(<>
  <div>
    {bugs && bugs.map((bug)=>
    {
      <p>Title:{bug.title}</p>
    })}
    <p>asd</p>
    </div>
  </>);
}

export default Bugs;
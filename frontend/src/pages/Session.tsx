import { useParams } from "react-router-dom"


export default function Session() {
    const {sessionId}=useParams();
    async function handleEndSession(){
        
    }
  return (
    <div>
      {sessionId}
      <br />
      <button className="bg-red-500 p-3" onClick={handleEndSession}>endSession</button>
    </div>
  )
}

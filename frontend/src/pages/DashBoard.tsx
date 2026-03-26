import { useAuth } from "@clerk/react";
import { useEffect } from "react";

 function DashBoard() {
     const { getToken, isSignedIn } = useAuth();

   
   useEffect(()=>{
    async function syncUser(){
        const token=await getToken();
        console.log(token);
    }

  
   });
   
  return (
    <div>DashBoard</div>
  )
}

export default DashBoard
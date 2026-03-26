import { useNavigate } from "react-router-dom"


function LandingPage() {
    const navigate=useNavigate();
  return (
    <div className="flex justify-center items-center h-screen">
        <button className="bg-blue-500 text-white m-2 p-3 cursor-pointer  font-bold  rounded-2xl hover:text-gray-400" onClick={()=>navigate("/login")}>
            Login
        </button>

        <button className="bg-yellow-500 text-white font-bold m-2 p-3 cursor-pointer hover:text-gray-400 rounded-2xl" onClick={()=>navigate("/signup")}>
           Signup
        </button>

        
        </div>
  )
}

export default LandingPage
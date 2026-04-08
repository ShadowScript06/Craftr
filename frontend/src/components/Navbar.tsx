import { SignOutButton } from "@clerk/react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Left: Branding */}
      <div
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <div className="bg-blue-500 text-white font-bold rounded-full h-10 w-10 flex items-center justify-center text-lg shadow-md">
          C
        </div>
        <span className="text-2xl font-bold text-gray-800">Craftr</span>
      </div>

      {/* Right: Sign Out */}
      <div>
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 hover:shadow-lg transition-all duration-200">
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}

import {SignOutButton} from "@clerk/react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Left: Branding */}
      <div className="flex items-center space-x-3">
        {/* Optional logo */}
        <div className="bg-blue-500 text-white font-bold rounded-full h-10 w-10 flex items-center justify-center text-lg shadow-md">
          C
        </div>
        <span className="text-2xl font-bold text-gray-800">Craftr</span>
      </div>

      {/* Right: Sign Out */}
      <div>
        <div
         
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 hover:shadow-lg transition-all duration-200"
        >
          <SignOutButton/>
        </div>
      </div>
    </nav>
  );
}


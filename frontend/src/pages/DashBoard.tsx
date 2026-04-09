import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";

function DashBoard() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function syncUser() {
      const token = await getToken();
      console.log(token);
      const response = await axios.post(
        "http://localhost:5000/api/auth/sync-user",
        {}, // empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status !== 200) {
        alert("Error login, Please try again");
        navigate("/login");
      }
    }

    syncUser();
  }, [getToken, navigate]);

  return (
    <div>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <Navbar />

        {/* Services Section */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Skill Finder Box */}
          <div className="bg-white shadow rounded p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-lg mb-2">Track Applications</h2>
              <p>Keep track of your job application and Make you job search journey hassle free.</p>
            </div>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" onClick={()=>navigate('/applicationtracker')}>
              Add Application
            </button>
          </div>

          {/* Job Finder Box */}
          <div className="bg-white shadow rounded p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-lg mb-2">Find Jobs</h2>
              <p>Search for jobs that match your skills and experience.</p>
            </div>
            <button
              onClick={() => navigate("/jobs")}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Go to Jobs
            </button>
          </div>

          {/* Placeholder Box for future service */}
          <div className="bg-white shadow rounded p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-lg mb-2">Coming Soon</h2>
              <p>More services will be added here.</p>
            </div>
            <button
              className="mt-4 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
              disabled
            >
              Soon
            </button>
          </div>
        </div>
      </div>
      );
    </div>
  );
}

export default DashBoard;

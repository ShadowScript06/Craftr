import { SignOutButton, useAuth } from "@clerk/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function DashBoard() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function syncUser() {
      const token = await getToken();

      const response = await fetch("http://localhost:5000/api/auth/sync-user", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        alert("Error login, Please try again");
        navigate("/login");
      }
    }

    syncUser();
  },[getToken,navigate]);

  return <div>
    <SignOutButton/>
  </div>;
}

export default DashBoard;

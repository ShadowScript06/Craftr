import { Link } from "react-router-dom";
import { SignUp } from "@clerk/react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-md bg-white rounded-3xl  p-8 sm:p-10">
        

        <SignUp
          
          appearance={{
            variables: {
              colorPrimary: "#6366f1", // Indigo-500
              colorText: "#111827", // Gray-900
            },
            layout: {
              logoPlacement: "inside", // optional if you want logo
            },
          }}
        />

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
          >
            ⬅  Home
          </Link>
        </div>
      </div>
    </div>
  );
}
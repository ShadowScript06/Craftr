import { Link } from "react-router-dom";
import { SignIn } from "@clerk/react"; // import SignIn

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10">
        
        {/* Clerk SignIn UI */}
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#6366f1",  // same primary color
              colorText: "#111827",
            },
            layout: {
              logoPlacement: "inside",
            },
          }}
        />

        {/* Back to home link */}
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
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      navigate("/"); // go to dashboard
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Google Sign-In failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white outline-none mt-4"
          onChange={(e) => setPw(e.target.value)}
        />

        <button
          onClick={handleEmailLogin}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Login with Email
        </button>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-semibold py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
        >
          <span className="text-lg">G</span>
          <span>Continue with Google</span>
        </button>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-blue-500 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

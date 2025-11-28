import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export const logoutUser = async (navigate) => {
  try {
    await signOut(auth);
    navigate("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

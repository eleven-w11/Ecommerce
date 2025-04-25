import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfile = ({ onSignOut }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {

      try {
        const response = await axios.get("http://localhost:5000/api/user/profile", { withCredentials: true });
        console.log("Full response:", response);

        // Debugging specific parts of the response
        console.log("Response data:", response.data);

        if (response.data.success === false) {
          navigate("/SignIn");
        }

        setUserData(response.data);

        setErrorMessage("");
      } catch (error) {
        console.error("Error fetching user data:", error);

        if (error.response?.status === 401) {
          console.warn("Unauthorized, redirecting to sign-in.");
          navigate("/SignIn");
        } else {
          setErrorMessage("Failed to load user data. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const handelSignOut = async () => {
    try {
      const response = await axios.delete("http://localhost:5000/api/signout", { withCredentials: true });
      if (response.data.success) {
        onSignOut();
        navigate("/signin");
      } else {
        console.error("Failed to sign out.");
      }
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };



  return (
    <div>
      <h2>User Profile</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {userData ? (
        <div>
          {userData.image && (
            <div>
              <img
                src={userData.image}
                alt="User"
                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
              />
            </div>
          )}
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <button onClick={handelSignOut}>Log Out</button>
        </div>
      ) : (
        <div>
          <p>Error fetching user data. Please sign in again.</p>
          <button onClick={handelSignOut}>Log Out</button>
        </div>
      )}
    </div>
  );

};

export default UserProfile;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/userProfile.css";


const UserProfile = ({ onSignOut }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/profile`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        },

        );
        console.log("userprofile response:", response);

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
    return (
      <div className="fp-chat">
        <div className="fp-loader-container">
          <div className="loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }
  const handelSignOut = async () => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/signout`,
        { withCredentials: true });
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
    <div className="user-profile-container">
      <h2>User Profile</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {userData ? (
        <div>
          {userData.image && (
            <div className="user-profile-image">
              <img
                src={userData.image}
                alt="User"
              />
            </div>
          )}
          <div className="user-profile-details">
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
          </div>
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












// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODFiMTE2ZDcxYjEzM2U3NTExNDQ1ZDYiLCJpYXQiOjE3NDg5MjE1MTcsImV4cCI6MTc0ODkyNTExN30.qkN0Aobxz7BoVLkgIzuQuKO-XzJg30T3tAtyacp9weM
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODFiMTE2ZDcxYjEzM2U3NTExNDQ1ZDYiLCJpYXQiOjE3NDg5MjE1NzAsImV4cCI6MTc0ODkyNTE3MH0.KcJu_OpJ4-3-tZ5ML3hbdOBa3xTzHHvGDtGm1SmDX4Q
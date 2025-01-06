import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie library
import "./styles/UserLocation.css"; // Importing CSS file

const UserLocation = () => {
    const [country, setCountry] = useState(""); // Initial state is an empty string
    const [manualCountry, setManualCountry] = useState("");
    const [error, setError] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);

    // Check for country in cookie when component mounts
    useEffect(() => {
        const countryFromCookie = Cookies.get("country"); // Fetch country from cookie
        if (countryFromCookie) {
            console.log("Country from cookie:", countryFromCookie); // Log cookie value for debugging
            setCountry(countryFromCookie);
            setIsDisabled(true); // Disable all inputs if country is already in the cookie
        } else {
            console.log("No country found in cookie.");
        }
    }, []); // Empty dependency array ensures this runs once on component mount

    // Fetch country by coordinates using Nominatim API
    const fetchCountryByCoords = async (lat, lng) => {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

        try {
            const response = await axios.get(url);
            if (response.data && response.data.address && response.data.address.country) {
                const countryName = response.data.address.country;
                setCountry(countryName);
                setError("");
                setIsDisabled(true); // Disable inputs and buttons once a country is fetched

                // Store country name in a cookie for 15 days
                Cookies.set("country", countryName, { expires: 15 });
            } else {
                setError("Country not found in the API response.");
            }
        } catch (err) {
            console.error("Error fetching country information:", err);
            setError("Failed to fetch country information.");
        }
    };

    // Get location based on the user's current geolocation
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchCountryByCoords(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    setError("Location access denied. Please add the country name manually.");
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

    // Handle the manual submission of the country name
    const handleManualCountrySubmit = () => {
        if (manualCountry.trim()) {
            const countryName = manualCountry.trim();
            setCountry(countryName);
            setError("");
            setIsDisabled(true); // Disable inputs and buttons once a country is submitted

            // Store country name in a cookie for 15 days
            Cookies.set("country", countryName, { expires: 15 });
        } else {
            setError("Please enter a valid country name.");
        }
    };

    return (
        <div className="container">
            <h2 className="title">Get User's Country</h2>
            {/* If country is found in cookie, show country name and disable all options */}
            {country ? (
                <div>
                    <p className="success">Country: {country}</p>
                </div>
            ) : (
                <div>
                    {/* Options to get country automatically or manually */}
                    <button
                        className="button"
                        onClick={getLocation}
                        disabled={isDisabled}
                    >
                        Get Location Automatically
                    </button>

                    {/* Manual input for country name */}
                    <div className="manual-input">
                        <p>Add Country Name</p>
                        <input
                            type="text"
                            placeholder="Enter Country Name"
                            value={manualCountry}
                            onChange={(e) => setManualCountry(e.target.value)}
                            className="input"
                            disabled={isDisabled}
                        />
                        <button
                            className="button"
                            onClick={handleManualCountrySubmit}
                            disabled={isDisabled}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}

            {/* Display error if any */}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default UserLocation;

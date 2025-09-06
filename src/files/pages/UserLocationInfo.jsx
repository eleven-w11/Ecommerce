import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie library
import "../styles/UserLocation.css"; // Importing CSS file

const UserLocation = () => {
    const [country, setCountry] = useState(""); // Initial state is an empty string
    const [manualCountry, setManualCountry] = useState("");
    const [error, setError] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);

    // Check for country in cookie when component mounts
    // useEffect(() => {
    //     const countryFromCookie = Cookies.get("country"); // Fetch country from cookie
    //     if (countryFromCookie) {
    //         console.log("Country from cookie:", countryFromCookie); // Log cookie value for debugging
    //         setCountry(countryFromCookie);
    //         setIsDisabled(true); // Disable all inputs if country is already in the cookie
    //     } else {
    //         console.log("No country found in cookie.");
    //     }
    // }, []); // Empty dependency array ensures this runs once on component mount

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

    useEffect(() => {
        const setLocationHeight = () => {
            const height = window.innerHeight - 60;
            const locationElement = document.querySelector(".location");

            if (locationElement) {
                locationElement.style.height = `${height}px`;
            }
        };

        // Set on mount
        setLocationHeight();

        // Update on window resize
        window.addEventListener("resize", setLocationHeight);

        // Cleanup
        return () => window.removeEventListener("resize", setLocationHeight);
    }, []);

    return (
        <div className="location">
            <div className="country-container">
                <h2 className="country-title">Your Country</h2>

                {country ? (
                    <div className="country-success">
                        <p>Your Country: <span>{country}</span></p>
                    </div>
                ) : (
                    <div className="country-actions">
                        <button
                            className="country-button"
                            onClick={getLocation}
                            disabled={isDisabled}
                        >
                            Detect Country Automatically
                        </button>

                        <div className="manual-country-section">
                            <p className="manual-instruction">Or Enter Manually:</p>
                            <input
                                type="text"
                                placeholder="Enter Your Country"
                                value={manualCountry}
                                onChange={(e) => setManualCountry(e.target.value)}
                                className="country-input"
                                disabled={isDisabled}
                            />
                            <button
                                className="country-button"
                                onClick={handleManualCountrySubmit}
                                disabled={isDisabled}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}

                {error && <p className="country-error">{error}</p>}
            </div>
        </div>

    );
};

export default UserLocation;

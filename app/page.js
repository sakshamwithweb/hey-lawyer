"use client";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    omiUserId: "",
    profession: "",
    otherProfession: "",
    age: "",
    race: "",
    otherRace: "",
    nationality: "",
    otherNationality: "",
    gender: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      omiUserId: formData.omiUserId,
      profession:
        formData.profession === "other" ? formData.otherProfession : formData.profession,
      age: formData.age,
      race: formData.race === "other" ? formData.otherRace : formData.race,
      nationality:
        formData.nationality === "other" ? formData.otherNationality : formData.nationality,
      gender: formData.gender,
    };
    const request = await fetch("/api/frontend/registerUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const response = await request.json();
    if(response.success) alert("User registered successfully")
    else alert(response.error)
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-200 py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Hey! Lawyer</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white shadow-lg rounded-lg px-8 pt-6 pb-8"
      >
        {/* Name */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Enter your name"
          />
        </div>

        {/* OMI User ID */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="omiUserId">
            OMI User ID
          </label>
          <input
            id="omiUserId"
            name="omiUserId"
            type="text"
            value={formData.omiUserId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Enter your OMI User ID"
          />
        </div>

        {/* Profession */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="profession">
            Profession
          </label>
          <select
            id="profession"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          >
            <option value="">Select your profession</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="lawyer">Lawyer</option>
            <option value="engineer">Engineer</option>
            <option value="doctor">Doctor</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Other Profession Input */}
        {formData.profession === "other" && (
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="otherProfession">
              Please specify your profession
            </label>
            <input
              id="otherProfession"
              name="otherProfession"
              type="text"
              value={formData.otherProfession}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              placeholder="Enter your profession"
            />
          </div>
        )}

        {/* Age */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="age">
            Age
          </label>
          <select
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          >
            <option value="">Select your age range</option>
            <option value="under-18">Under 18</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55-64">55-64</option>
            <option value="65+">65+</option>
          </select>
        </div>

        {/* Race */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="race">
            Race
          </label>
          <select
            id="race"
            name="race"
            value={formData.race}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          >
            <option value="">Select your race</option>
            <option value="asian">Asian</option>
            <option value="black">Black</option>
            <option value="hispanic">Hispanic</option>
            <option value="white">White</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Other Race Input */}
        {formData.race === "other" && (
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="otherRace">
              Please specify your race
            </label>
            <input
              id="otherRace"
              name="otherRace"
              type="text"
              value={formData.otherRace}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              placeholder="Enter your race"
            />
          </div>
        )}

        {/* Nationality */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="nationality">
            Nationality
          </label>
          <select
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          >
            <option value="">Select your nationality</option>
            <option value="american">American</option>
            <option value="canadian">Canadian</option>
            <option value="british">British</option>
            <option value="indian">Indian</option>
            <option value="chinese">Chinese</option>
            <option value="other">Other</option>
          </select>
        </div>

        {formData.nationality === "other" && (
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="otherNationality">
              Please specify your nationality
            </label>
            <input
              id="otherNationality"
              name="otherNationality"
              type="text"
              value={formData.otherNationality}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              placeholder="Enter your nationality"
            />
          </div>
        )}

        {/* Gender */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          >
            <option value="">Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-Binary</option>
            <option value="prefer-not-to-say">Prefer Not to Say</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
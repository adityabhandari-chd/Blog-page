import React, { useState } from "react";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function register(event) {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Handle the response as needed
      console.log(response);
    } catch (error) {
      // Handle any error that occurred during the request
      console.error("Error:", error);
    }
  }

  return (
    <div>
      <form action="" className="register" onSubmit={register}>
        <h1>Register</h1>
        <input
          onChange={(event) => setUsername(event.target.value)}
          type="text"
          value={username}
          placeholder="username"
        ></input>
        <input
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
          placeholder="password"
        ></input>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;

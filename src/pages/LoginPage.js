import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);
  async function Login(event) {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (response.ok) {
        response.json().then((userInfo) => {
          setUserInfo(userInfo);
          setRedirect(true);
        });
      } else {
        alert("Wrong credentials");
      }
      // Handle the response as needed
      console.log(response);
    } catch (error) {
      // Handle any error that occurred during the request
      console.error("Error:", error);
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <div>
      <form className="login" onSubmit={Login}>
        <h1>Login</h1>
        <input
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          value={username}
          placeholder="username"
        ></input>
        <input
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          value={password}
          placeholder="password"
        ></input>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;

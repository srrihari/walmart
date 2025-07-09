import axios from "axios";
import React, { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const passwordRef = useRef(null);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    setUser((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/login", user);
      if (response.status === 200) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("userId", response.data.user.id);
        login(response.data.user); // This sets localStorage and updates context
        // <-- Update global context
        navigate(`/`);
      }
    } catch (error) {
      if (error?.response?.data?.error === "No user Found") {
        alert("User does not Exist, Please Create an Account");
        navigate("/register", {
          state: { email: user.email, password: user.password },
        });
      } else if (error?.response?.data?.error === "Incorrect Password") {
        alert("Incorrect Password");
        passwordRef.current?.focus();
        setUser((pre) => ({ ...pre, password: "" }));
      }
    }
  }

  return (
    <div className="login-container">
      <h2 className="login-heading">
        Sign in to your <span className="highlight">Walmart</span> account
      </h2>
      <div className="form-container">
        <form onSubmit={handleLogin}>
          <label className="label">Email Address</label>
          <input
            type="email"
            name="email"
            className="input"
            value={user.email}
            onChange={handleChange}
            required
          />

          <label className="label">Password</label>
          <input
            type="password"
            name="password"
            className="input"
            value={user.password}
            onChange={handleChange}
            ref={passwordRef}
            required
          />

          <button type="submit" className="submit-button">
            Sign in
          </button>

          <Link to="/register" className="register-link">
            register
          </Link>
        </form>
      </div>
    </div>
  );
}

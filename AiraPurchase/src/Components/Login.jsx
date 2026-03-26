import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5181";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("text-danger");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data } = await axios.post(`${API}/api/login`, {
        userName: username,     // keep keys as your backend expects
        passWord: password,
      });

      // accept many common response shapes
      const user = data?.user ?? data?.User ?? data?.data ?? data ?? {};
      const userId = toNum(user?.userId ?? user?.UserId ?? user?.id ?? user?.Id);

      if (userId != null) {
        // write to BOTH storages so Sidebar (and anything else) will find it
        const idStr = String(userId);
        localStorage.setItem("userId", idStr);
        sessionStorage.setItem("userId", idStr);

        // you can still remember the preference, if you want it later
        localStorage.setItem("rememberMe", rememberMe ? "1" : "0");

        setMessageColor("text-success");
        setMessage("Login successful");
        navigate("/dashboard", { replace: true });
        return;
      }

      setMessageColor("text-danger");
      setMessage("Login succeeded but no user ID returned");
    } catch (error) {
      const status = error?.response?.status;
      const errMsg =
        status === 401
          ? "Invalid username or password"
          : `Server error${status ? ` [${status}]` : ""}. Please try again.`;
      setMessageColor("text-danger");
      setMessage(errMsg);
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left image section */}
        <div
          className="col-12 col-md-8 d-flex align-items-center justify-content-center p-0"
          style={{
            backgroundImage: 'url("src/assets/Img/SUZIK.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
          }}
        />

        {/* Right form section */}
        <div className="col-12 col-md-4 d-flex align-items-center justify-content-center">
          <div className="w-75">
            <div className="mb-4">
              <img src="src/assets/Img/aira.png" alt="Logo" style={{ width: "100px" }} />
            </div>

            <h2 className="mb-4 text-center">Login</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  id="username"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>
                <a href="/forgot-password" className="text-decoration-none">
                  Forgot Password?
                </a>
              </div>

              {message && <div className={`mb-3 ${messageColor}`}>{message}</div>}

              <button type="submit" className="btn btn-primary w-100">
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

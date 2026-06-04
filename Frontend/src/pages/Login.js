// src/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  LogIn, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Calendar,
  ChevronRight,
  Globe,
  HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import campusBg from "../assets/campus-bg.png";

const Login = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/signup";

    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await axios.post(url, payload);
      const { user, token, message } = res.data;

      if (!user || !token) {
        toast.error("Invalid response from server");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(message || "Success!");
      
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper" style={{ backgroundImage: `url(${campusBg})` }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Top Navigation */}
      <nav className="login-navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Calendar className="logo-icon" size={24} />
            <span className="logo-text">SCHEDULIFY</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#support">Support</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </nav>

      <main className="login-main-content">
        <div className="login-content-inner">
          {/* Header Message */}
          <header className="login-welcome-header">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Welcome to Schedulify Generator
            </motion.h1>
            <motion.p 
              className="subtitle"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Educational Institution Portal
            </motion.p>
            <motion.p 
              className="tagline"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Simplify Academic Planning with AI
            </motion.p>
          </header>

          {/* Auth Card */}
          <motion.div 
            className="modern-auth-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="card-header">
              <div className="card-logo">
                <Calendar className="logo-icon" size={32} />
                <div className="logo-labels">
                  <h3>SCHEDULIFY</h3>
                  <p>Automatic Schedule Generator</p>
                </div>
              </div>
              <h2>{isLogin ? "Sign In" : "Sign Up"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="modern-auth-form">
              {!isLogin && (
                <div className="modern-input-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <User className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="modern-input-group">
                <label>Username or Email Address</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="Enter your username or email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modern-input-group">
                <div className="label-with-action">
                  <label>Password</label>
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember Me
                </label>
                <a href="#reset" className="forgot-link">Forgot Password?</a>
              </div>

              <button type="submit" className="modern-submit-btn" disabled={loading}>
                {loading ? "AUTHENTICATING..." : isLogin ? "SIGN IN" : "SIGN UP"}
              </button>

              <div className="social-divider">
                <span>Or continue with:</span>
              </div>

              <div className="social-buttons">
                <button type="button" className="social-btn google">
                  <Globe size={18} className="social-icon" />
                  Sign in with Google
                </button>
                <button type="button" className="social-btn microsoft">
                  <HelpCircle size={18} className="social-icon" />
                  Sign in with Microsoft
                </button>
              </div>
            </form>

            <div className="modern-auth-footer">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
                  {isLogin ? " Contact your Administrator" : " Go to Login"}
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="page-footer">
        <div className="footer-content">
          <p>© 2024 Schedulify, Inc. All rights reserved. | <a href="#privacy">Privacy Policy</a> | <a href="#terms">Terms of Service</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
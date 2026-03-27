import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="home">
      <h1>Skill Matching Platform</h1>
      <p>Connect clients with the right freelancers based on skills. Post projects, upload resumes, and find your match.</p>

      <div className="home-btns">
        <button className="btn-primary" onClick={() => navigate("/register")}>Get Started</button>
        <button className="btn-outline" onClick={() => navigate("/login")}>Login</button>
      </div>

      <div className="home-features">
        <div className="feature-box">
          <h3>For Freelancers</h3>
          <p>Upload your resume, set your skills, and get matched to relevant projects automatically.</p>
        </div>
        <div className="feature-box">
          <h3>For Clients</h3>
          <p>Post your project with required skills and find freelancers who are the best fit.</p>
        </div>
        <div className="feature-box">
          <h3>Smart Matching</h3>
          <p>Our algorithm ranks freelancers and projects by skill overlap percentage.</p>
        </div>
      </div>

      <div className="home-footer">Mini Project &copy; 2026</div>
    </div>
  );
}

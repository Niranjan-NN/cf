import { FaUserCircle, FaShoppingCart, FaBell, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = ({ searchQuery = "", setSearchQuery }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");

  const handleCartClick = () => navigate("/cart");
  const handleProfileClick = () => navigate(token ? "/profile" : "/login");

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/")}>CORE FOUR</div>

      
      <div className="navbar-icons">
        <FaHome onClick={() => navigate("/")} />
        <FaShoppingCart onClick={handleCartClick} />
        <FaBell />
        {token ? (
          <FaUserCircle onClick={handleProfileClick} />
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="btn btn-outline-primary btn-sm"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

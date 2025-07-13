import React, { useState, useEffect, useContext } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, useLocation } from "react-router-dom";
import { FiGrid } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import DropdownItem from "./DropdownItem";
import { AuthContext } from "../auth";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch } from "react-icons/fa";

function NavBar() {
  const loc = useLocation();
  const [activeNav, setActiveNav] = useState("");
  const isActive = (path) => loc.pathname === path;
  const { user, isAuthenticated } = useContext(AuthContext);

  const [expanded, setExpanded] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [visible, setVisible] = useState(true);
  const [prevScroll, setPrevScroll] = useState(window.scrollY);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (expanded) {
      setShowLogo(false);
    } else {
      const timer = setTimeout(() => setShowLogo(true), 300);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setVisible(currentScroll < 10 || currentScroll < prevScroll);
      setPrevScroll(currentScroll);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScroll]);

  useEffect(() => {
    // Automatically highlight nav item based on path
    const path = loc.pathname;
    if (path.includes("cart")) setActiveNav("cart");
    else if (path.includes("familydashboard")) setActiveNav("family");
    else if (path.includes("about")) setActiveNav("about");
    else if (path.includes("prodgest")) setActiveNav("search");
    else setActiveNav("");
  }, [loc.pathname]);

  const handleNavClick = (id = "") => {
    setExpanded(false);
    setDropdownOpen(false);
    setActiveNav(id);
  };

  return (
    <Navbar
      expand="sm"
      variant="dark"
      expanded={expanded}
      onToggle={() => setExpanded((prev) => !prev)}
      className="position-fixed w-100"
      style={{
        backgroundColor: "#2563eb",
        top: visible ? "0" : "-80px",
        transition: "top 0.3s",
        zIndex: 999,
      }}
    >
      <Container fluid>
        {showLogo && (
          <Navbar.Brand
            as={Link}
            to="/"
            onClick={() => handleNavClick("")}
            style={{
              color: "white",
              fontSize: "x-large",
              fontFamily: "Anta, sans-serif",
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Walmart
            <img src="image1.png" width={"25px"} alt="logo" />
          </Navbar.Brand>
        )}

        <Navbar.Toggle aria-controls="navbarScroll" />

        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="w-100 d-flex justify-content-evenly align-items-center text-center"
            style={{ gap: "10px" }}
            navbarScroll
          >
            {/* Departments */}
            <div style={{ minWidth: "110px" }}>
              <NavDropdown
                title={
                  <span
                    style={{
                      color: isActive("/departments") ? "orange" : "white",
                    }}
                  >
                    <FiGrid style={{ paddingBottom: "2px" }} /> Departments
                  </span>
                }
                id="nav-dropdown"
                menuVariant="light"
                show={dropdownOpen}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <NavDropdown.ItemText
                  style={{ fontSize: "large", fontWeight: "600" }}
                >
                  All Departments
                </NavDropdown.ItemText>

                {/* Add DropdownItems here like before */}
                {/* ... */}
                {/* Electronics */}
                <DropdownItem
                  label="Electronics"
                  to="/electronics"
                  submenu={[
                    {
                      label: "Audio Devices",
                      to: "/electronics?category=Audio Devices",
                    },
                    {
                      label: "Computer Accessories",
                      to: "/electronics?category=Computer Accessories",
                    },
                    { label: "Gaming", to: "/electronics?category=Gaming" },
                    {
                      label: "Home Appliances",
                      to: "/electronics?category=Home Appliances",
                    },
                    {
                      label: "Laptops & PCs",
                      to: `/electronics?category=${encodeURIComponent(
                        "Laptops & PCs"
                      )}`,
                    },
                    {
                      label: "Mobiles & Accessories",
                      to: `/electronics?category=${encodeURIComponent(
                        "Mobiles & Accessories"
                      )}`,
                    },
                    {
                      label: "Smart Devices",
                      to: "/electronics?category=Smart Devices",
                    },
                  ]}
                  onClick={handleNavClick}
                />

                <DropdownItem
                  label="Foods & Groceries"
                  to="/foodgroceries"
                  submenu={[
                    { label: "Chinese", to: "/foodgroceries?category=Chinese" },
                    {
                      label: "International",
                      to: "/foodgroceries?category=International",
                    },
                    {
                      label: "Japanese",
                      to: "/foodgroceries?category=Japanese",
                    },
                    { label: "Juices", to: "/foodgroceries?category=Juices" },
                    {
                      label: "North Indian",
                      to: "/foodgroceries?category=North Indian",
                    },
                    {
                      label: "South Indian",
                      to: "/foodgroceries?category=South Indian",
                    },
                  ]}
                  onClick={handleNavClick}
                />

                <DropdownItem
                  label="Household"
                  to="/household"
                  submenu={[
                    {
                      label: "Air Fresheners",
                      to: "/household?category=Air%20Fresheners",
                    },
                    {
                      label: "Bathroom Supplies",
                      to: "/household?category=Bathroom%20Supplies",
                    },
                    {
                      label: "Cleaning Supplies",
                      to: "/household?category=Cleaning%20Supplies",
                    },
                    {
                      label: "Home Storage",
                      to: "/household?category=Home%20Storage",
                    },
                    {
                      label: "Kitchen Essentials",
                      to: "/household?category=Kitchen%20Essentials",
                    },
                    {
                      label: "Laundry & Detergents",
                      to: "/household?category=Laundry%20%26%20Detergents",
                    },
                  ]}
                  onClick={handleNavClick}
                />

                <DropdownItem
                  label="Vehicle Care"
                  to="/vehiclecare"
                  submenu={[
                    {
                      label: "Automobile Care",
                      to: "/vehiclecare?category=Automobile%20Care",
                    },
                    {
                      label: "Bike Care",
                      to: "/vehiclecare?category=Bike%20Care",
                    },
                  ]}
                  onClick={handleNavClick}
                />

                <DropdownItem
                  label="Body Care & Diet"
                  to="/bodycarediet"
                  submenu={[
                    {
                      label: "Diet & Nutrition",
                      to: "/bodycarediet?category=Diet%20%26%20Nutrition",
                    },
                    {
                      label: "Lotions & Creams",
                      to: "/bodycarediet?category=Lotions%20%26%20Creams",
                    },
                  ]}
                  onClick={handleNavClick}
                />

                <DropdownItem
                  label="Clothing, Handbags, Watches & Accessories"
                  to="/cloth"
                  submenu={[
                    { label: "Bags", to: "/cloth?category=Bags" },
                    { label: "Kids", to: "/cloth?category=Kids" },
                    { label: "Men", to: "/cloth?category=Men" },
                    {
                      label: "Unisex Accessories",
                      to: "/cloth?category=Unisex%20Accessories",
                    },
                    { label: "Women", to: "/cloth?category=Women" },
                  ]}
                  onClick={handleNavClick}
                />

                <DropdownItem
                  label="Pets"
                  to="/pet"
                  submenu={[
                    {
                      label: "Pet Accessories",
                      to: "/pet?category=Pet Accessories",
                    },
                    { label: "Pet Beds", to: "/pet?category=Pet Beds" },
                    { label: "Pet Food", to: "/pet?category=Pet Food" },
                    { label: "Pet Grooming", to: "/pet?category=Pet Grooming" },
                    {
                      label: "Pet Health & Care",
                      to: "/pet?category=Pet Health & Care",
                    },
                    { label: "Pet Toys", to: "/pet?category=Pet Toys" },
                  ]}
                  onClick={handleNavClick}
                />

                <DropdownItem
                  label="School Utensils"
                  to="/schoolutensils"
                  submenu={[
                    {
                      label: "Accessories",
                      to: "/schoolutensils?category=Accessories",
                    },
                    {
                      label: "Stationery",
                      to: "/schoolutensils?category=Stationery",
                    },
                  ]}
                  onClick={handleNavClick}
                />
              </NavDropdown>
            </div>

            {/* About */}
            <div style={{ minWidth: "90px" }}>
              <Nav.Link
                as={Link}
                to="/about"
                onClick={handleNavClick}
                style={{ color: isActive("/about") ? "orange" : "white" }}
              >
                About
              </Nav.Link>
            </div>

            {/* Family Dashboard */}
            <div style={{ minWidth: "100px" }}>
              <Nav.Link
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                  transition: "background-color 0.3s ease",
                }}
                className="nav-hover"
                to="/familydashboard"
                as={Link}
              >
                <MdFamilyRestroom style={{ fontSize: "1.2rem" }} />
                <span style={{ fontSize: "0.85rem" }}>Family Dashboard</span>
              </Nav.Link>
            </div>

            {/* Profile or Login */}
            <div style={{ minWidth: "100px" }}>
              {isAuthenticated ? (
                <Nav.Link
                  as={Link}
                  to="/profile"
                  onClick={handleNavClick}
                  style={{
                    display: "flex",
                    color: "white",
                    borderRadius: "20px",
                    flexDirection: "row",
                  }}
                >
                  <img
                    src="image.png"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border: "2px solid #ddd",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "medium",
                      fontWeight: "bolder",
                      alignSelf: "center",
                      marginLeft: "3px",
                    }}
                  >
                    Hello, <span style={{ color: "orange" }}>{user.name}</span>
                  </div>
                </Nav.Link>
              ) : (
                <Nav.Link
                  as={Link}
                  to="/login"
                  onClick={handleNavClick}
                  style={{
                    color: "white",
                    backgroundColor: "#FE7743",
                    borderRadius: "20px",
                    padding: "0 20px 3px 20px",
                  }}
                >
                  {loc.pathname === "/register" ? "Login" : "Sign In"}
                </Nav.Link>
              )}
            </div>

            {/* Cart */}
            <div style={{ minWidth: "90px" }}>
              <Nav.Link
                as={Link}
                to="/cart"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                }}
              >
                <FaShoppingCart style={{ fontSize: "1.2rem" }} />
                <span style={{ fontSize: "0.85rem" }}>Cart</span>
              </Nav.Link>
            </div>
          </Nav>
          <Nav.Link
            as={Link}
            to="/prodgest"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
            }}
          >
            <FaSearch
              style={{
                color: "white",
                fontSize: "1.5rem",
                marginRight: "20px",
              }}
            />
          </Nav.Link>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;

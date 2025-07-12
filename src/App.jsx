import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import NavBar from "./components/NavBar";
import "./App.css";
import Electronics from "./pages/Electronics";
import Home from "./pages/Home";
import FoodGroceries from "./pages/FoodGroceries";
import Household from "./pages/Household";
import VehicleCare from "./pages/VehicleCare";
import BodyCareDiet from "./pages/BodyCareDiet";
import ClothAccessories from "./pages/ClothAccessories";
import Pet from "./pages/Pet";
import SchoolUtensils from "./pages/SchoolUtensils";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { AuthProvider } from "./auth.jsx"; // Import AuthProvider
import Profile from "./pages/Profile.jsx";
import Cart from "./components/Cart.jsx";
import Orders from "./pages/Orders.jsx";
import ProductViewPg from "./pages/ProductViewPg.jsx";
import Call from "./pages/Call.jsx";
import CallIframe from "./pages/CallIframe";
import FamilyDashboard from "./pages/FamilyDashboard.jsx";
import TastiAi from "./pages/TastiAi.jsx";
import ProdGest from "./pages/ProdGest.jsx";
import ProDoubt from "./pages/ProDoubt.jsx";
import ImagoMart from "./pages/ImagoMart.jsx";

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/electronics/:subcategory?" element={<Electronics />} />
          <Route
            path="/foodgroceries/:subcategory?"
            element={<FoodGroceries />}
          />
          <Route path="/household/:subcategory?" element={<Household />} />
          <Route path="/vehiclecare/:subcategory?" element={<VehicleCare />} />
          <Route
            path="/bodycarediet/:subcategory?"
            element={<BodyCareDiet />}
          />
          <Route path="/cloth/:subcategory?" element={<ClothAccessories />} />
          <Route path="/pet/:subcategory?" element={<Pet />} />
          <Route
            path="/schoolutensils/:subcategory?"
            element={<SchoolUtensils />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/call" element={<CallIframe />} />
          <Route path="/product/:category/:id" element={<ProductViewPg />} />
          <Route path="/familydashboard" element={<FamilyDashboard />} />
          <Route path="/tastiai" element={<TastiAi />} />
          <Route path="/prodgest" element={<ProdGest />} />
          <Route path="/product/:category/:id/faq" element={<ProDoubt />} />

          <Route path="/imagomart" element={<ImagoMart />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { Container } from "reactstrap";
import { SearchProvider } from "views/examples/SearchContext"; 

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import klijentRoutes from "routes/klijentRoutes";
import terapeutRoutes from "routes/terapeutRoutes";
import guestRoutes from "routes/guestRoutes";

const Admin = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  const role = localStorage.getItem("role");
  let routes;
  if (role === "Klijent") {
    routes = klijentRoutes;
  } else if (role === "Terapeut") {
    routes = terapeutRoutes;
  } else {
    routes = guestRoutes;
  }

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      } else {
        return null;
      }
    });
  };

  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (
        props?.location?.pathname.indexOf(routes[i].layout + routes[i].path) !==
        -1
      ) {
        return routes[i].name;
      }
    }
    return "Brand";
  };

  return (
    <SearchProvider>
     <div className="admin-layout-container">
        <Sidebar
          {...props}
          routes={routes}
          logo={{
            innerLink: "/admin/index",
            imgSrc: require("../assets/img/brand/LogoMT.png"),
            imgAlt: "...",
          }}
        />
        <div className="main-content" ref={mainContent}>
          <AdminNavbar
            {...props}
            location={location}
            brandText={getBrandText(location.pathname)}
          />
          <Routes>
            {getRoutes(routes)}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
          
          <Container fluid className="footer-container">
            <AdminFooter />
          </Container>
        </div>
      </div>
    </SearchProvider>
  );
};

export default Admin;

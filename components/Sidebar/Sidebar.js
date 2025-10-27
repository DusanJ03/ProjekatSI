import React, { useContext, useState } from "react";
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
import { SearchContext } from "views/examples/SearchContext"; 
import { PropTypes } from "prop-types";
import guestRoutes from "routes/guestRoutes.js";
import klijentRoutes from "routes/klijentRoutes.js";
import terapeutRoutes from "routes/terapeutRoutes";

import {
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Media,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
} from "reactstrap";

const Sidebar = (props) => {

  const [collapseOpen, setCollapseOpen] = useState();
  const profileImage = localStorage.getItem("profileImage");
  const baseUrl = "http://localhost:5006";
  const { setSearchTerm } = useContext(SearchContext);

  /*const activeRoute = (routeName) => {
    return props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };*/
  
  const toggleCollapse = () => {
    setCollapseOpen((data) => !data);
  };
  const closeCollapse = () => {
    setCollapseOpen(false);
  };
  const createLinks = (routes) => {
    return routes.filter(route => !route.hideInSidebar)
    .map((prop, key) => {
      return (
        <NavItem key={key}>
          <NavLink
            to={prop.layout + prop.path}
            tag={NavLinkRRD}
            onClick={closeCollapse}
          >
            <i className={prop.icon} />
            {prop.name}
          </NavLink>
        </NavItem>
      );
    });
  };

  const { logo } = props;
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  let selectedRoutes = [];

  if (!token) {
    selectedRoutes = guestRoutes;
  } else if (userRole === "Klijent") {
    selectedRoutes = klijentRoutes;
  } else if (userRole === "Terapeut") {
    selectedRoutes = terapeutRoutes;
  }


  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
    };
  }

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        <div className="mobile-navbar-container d-md-none">
          <div className="mobile-navbar-left">
            <button
              className="navbar-toggler"
              type="button"
              onClick={toggleCollapse}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>
          <div className="mobile-navbar-center">
            {logo ? (
              <NavbarBrand className="pt-0" {...navbarBrandProps}>
                <img
                  alt={logo.imgAlt}
                  className="navbar-brand-img"
                  src={logo.imgSrc}
                />
              </NavbarBrand>
            ) : null}
          </div>
          <div className="mobile-navbar-right">
            <Nav className="align-items-center" navbar>
              {!token ? (
                <div className="guest-nav-icons">
                  <Link to="/auth/choose-register" className="nav-link-guest">
                    <i className="ni ni-circle-08" />
                  </Link>
                  <Link to="/auth/login" className="nav-link-guest">
                    <i className="ni ni-key-25" />
                  </Link>
                </div>
              ) : (
                <UncontrolledDropdown nav>
                  <DropdownToggle className="pr-0" nav>
                    <Media className="align-items-center mr-3">
                      <span className="avatar avatar-sm rounded-circle">
                        <img
                          alt="slika"
                          src={profileImage ? `${baseUrl}${profileImage}` : require("../../assets/img/theme/nema_slike.png")}
                        />
                      </span>
                    </Media>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-arrow" right>
                    <DropdownItem to="/admin/my-profile" tag={Link}>
                      <i className="ni ni-single-02" />
                      <span>Moj profil</span>
                    </DropdownItem>
                    <DropdownItem to="/admin/kalendar-termina" tag={Link}>
                      <i className="ni ni-calendar-grid-58" />
                      <span>Kalendar aktivnosti</span>
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem
                      href="#pablo"
                      onClick={(e) => {
                        e.preventDefault();
                        localStorage.clear();
                        window.location.href = "/admin/dashboard";
                      }}
                    >
                      <i className="ni ni-user-run" />
                      <span>Logout</span>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>
          </div>
        </div>

        {logo ? (
            <NavbarBrand className="pt-0 d-none d-md-block" {...navbarBrandProps}>
            <img
                alt={logo.imgAlt}
                className="navbar-brand-img"
                src={logo.imgSrc}
            />
            </NavbarBrand>
        ) : null}
        
        {/* Collapse */}
        <Collapse navbar isOpen={collapseOpen}>
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo ? (
                <Col className="collapse-brand" xs="6">
                  {logo.innerLink ? (
                    <Link to={logo.innerLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </Link>
                  ) : (
                    <a href={logo.outterLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </a>
                  )}
                </Col>
              ) : null}
              <Col className="collapse-close" xs="6">
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={toggleCollapse}
                >
                  <span />
                  <span />
                </button>
              </Col>
            </Row>
          </div>
          {/* Form */}
          <Form className="mt-4 mb-3 d-md-none">
            <InputGroup className="input-group-rounded input-group-merge">
              <Input
                aria-label="Search"
                className="form-control-rounded form-control-prepended"
                placeholder="Search"
                type="search"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <span className="fa fa-search" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Form>
          <Nav navbar>{createLinks(selectedRoutes)}</Nav>
          <Nav className="mb-md-3" navbar>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = {
  routes: [{}],
};

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string.isRequired,
    imgAlt: PropTypes.string.isRequired,
  }),
};

export default Sidebar;
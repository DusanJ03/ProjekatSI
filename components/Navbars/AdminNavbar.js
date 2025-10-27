import { useLocation, Link } from "react-router-dom";
import { SearchContext } from "views/examples/SearchContext"; 
import React, { useContext } from "react"; 
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";

const AdminNavbar = (props) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const hideProfileRoutes = ["/auth/login", "/auth/choose-register", "/auth/choose-role", 
    "/register-client", "/register-therapist", "/admin/user-profile"];
  const hideProfile = hideProfileRoutes.includes(location.pathname);
  const userName = localStorage.getItem("userName") || "Nepoznat korisnik";
  const profileImage = localStorage.getItem("profileImage");
  const baseUrl = "http://localhost:5006";
  const { setSearchTerm } = useContext(SearchContext);

return (
    <>
      <Navbar className="navbar-top navbar-light"
              expand="md"
              id="navbar-main">
        <Container fluid>
          <Link
            className="h4 mb-0 text-dark text-uppercase d-none d-lg-inline-block"
            to="/"
          >
            {props.brandText}
          </Link>
          <Form className="navbar-search navbar-search-light form-inline mr-3 d-none d-md-flex ml-lg-auto">
            <FormGroup className="mb-0">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fas fa-search" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input placeholder="Search" type="text" 
                onChange={(e) => setSearchTerm(e.target.value)} />
              </InputGroup>
            </FormGroup>
          </Form>
          <Nav className="align-items-center d-none d-md-flex" navbar>
            {!hideProfile && (
              !token ? (
              <Nav>
                <Link to="/auth/choose-register" className="nav-link">
                  <i className="ni ni-circle-08" /> Register
                </Link>
                <Link to="/auth/login" className="nav-link">
                  <i className="ni ni-key-25" /> Login
                </Link>
              </Nav>
            ) : (
                <UncontrolledDropdown nav>
                  <DropdownToggle className="pr-0" nav>
                    <Media className="align-items-center">
                      <span className="avatar avatar-sm rounded-circle">
                        <img
                          alt="slika"
                          src={`${baseUrl}${profileImage}` || require("../../assets/img/theme/nema_slike.png")}
                        />
                      </span>
                      <Media className="ml-2 d-none d-lg-block">
                        <span className="mb-0 text-sm font-weight-bold">
                          {userName}
                        </span>
                      </Media>
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
                    <DropdownItem href="#pablo" onClick={(e) => {
                      e.preventDefault();
                      localStorage.clear();
                      window.location.href = "/admin/dashboard";
                    }}>
                      <i className="ni ni-user-run" />
                      <span>Logout</span>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )
            )}
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;

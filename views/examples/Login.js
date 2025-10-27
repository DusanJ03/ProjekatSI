import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
} from "reactstrap";

const Login = () => {
  const [Email, setEmail] = useState("");         // cuvamo vrednosti inputa
  const [Password, setPassword] = useState("");
  const navigate = useNavigate();                // za preusmerenje

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5006/api/users/login", {
        Email,
        Password,
      });

      const { token, role, id, userName, profileImage } = res.data;
      if (!token || !role || !id) {
        toast.error("Neispravan odgovor servera.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userName", userName);
      localStorage.setItem("userId", id);
      if (res.data.slug) {
        localStorage.setItem("slug", res.data.slug);
      }
      localStorage.setItem("profileImage", profileImage);

      toast.success("Uspešna prijava!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Pogrešan email ili lozinka!");
      console.error(error);
    }
  };

  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <h5 className="text-muted text-center mb-4">
                Sign in to your account</h5>
            </div>
            <Form role="form">
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email"
                    type="email"
                    autoComplete="new-email"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Password"
                    type="password"
                    autoComplete="new-password"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </InputGroup>
              </FormGroup>
              <div className="text-center">
                <Button className="my-3" color="primary" type="button" onClick={handleLogin}>
                  Sign in
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
        <Row className="mt-3 justify-content-center">
          <Col xs="auto">
            <Button color="info" size="sm" tag={Link} to="/auth/choose-register">
              Create new account
            </Button>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default Login;

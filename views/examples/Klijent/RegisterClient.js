import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Col,
} from "reactstrap";

const RegisterClient = () => {
  const [formData, setFormData] = useState({
    Name: "",
    surname: "",
    UserName: "",
    Email: "",
    Password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post(`http://localhost:5006/api/klijenti/register`, {
        ...formData,
        role: "Klijent",
      });
      toast.success("Uspešna registracija!");
    } catch (err) {
      toast.error("Greška pri registraciji");
      console.error(err);
    }
  };

  return (
    <Col lg="6" md="8">
      <Card className="bg-secondary shadow border-0">
        <CardHeader className="bg-transparent pb-3">
          <div className="text-muted text-center mt-2">
            <h5 className="text-muted text-center">
              Registruj se kao klijent</h5>
          </div>
        </CardHeader>
        <CardBody className="px-lg-5 py-lg-5">
          <Form role="form">
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-hat-3" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Ime"
                  type="text"
                  name="name"
                  onChange={handleChange}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-hat-3" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Prezime"
                  type="text"
                  name="surname"
                  onChange={handleChange}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-circle-08" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Korisničko ime"
                  type="text"
                  name="username"
                  onChange={handleChange}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-email-83" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Email"
                  type="email"
                  name="email"
                  onChange={handleChange}
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
                  placeholder="Šifra"
                  type="password"
                  name="password"
                  onChange={handleChange}
                />
              </InputGroup>
            </FormGroup>
            <div className="text-center">
              <Button className="mt-4" color="primary" type="button" onClick={handleRegister}>
                Registruj se
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Col>
  );
};

export default RegisterClient;
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
    Card, 
    CardBody, 
    Button, 
    Col
} from "reactstrap";

const ChooseRegister = () => {
  const navigate = useNavigate();

  const handleChoice = (role) => {
    switch (role) {
      case "klijent":
        navigate("/auth/register-client");
        break;
      case "psihoterapeut":
        navigate("/auth/register-therapist");
        break;
      default:
        break;
    }
  };

  return (
    <Col lg="5" md="7" className="choose-register-card">
        <Card className="bg-secondary shadow border-0">
            <CardBody className="px-lg-5 py-lg-5">
            <h5 className="text-muted mb-4">
                Izaberite tip registracije
            </h5>

            <Button
                color="primary"
                type="button"
                onClick={() => handleChoice("klijent")}
            >
                Registruj se kao klijent
            </Button>

            <Button
                color="success"
                type="button"
                onClick={() => handleChoice("psihoterapeut")}
            >
                Registruj se kao psihoterapeut
            </Button>
            </CardBody>
        </Card>
    </Col>

  );
};

export default ChooseRegister;

import React from "react";
import { Button, Card, CardBody, Container, Row, Col } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";

const GuestDashboard = ({ therapists }) => {
  //const navigate = useNavigate();
  
  return (
    <Container className="pt-7">
      <h1 className="mb-4">Dobrodošli!</h1>

      <h4>Preporučeni terapeuti</h4>
      <Row>
        {therapists.length > 0 ? (
          therapists.map((t) => (
            <Col md="4" key={t.id}>
              <Card className="shadow-sm mb-3">
                  <CardBody>
                    <h5>{t.name} {t.surname} </h5>
                    <p>{t.specijalizacija} | {t.staz}</p>
                    <Button color="primary" size="sm" tag={Link} to={`/admin/terapeuti/${t.slug}`}>
                        Pogledaj profil
                    </Button>
                  </CardBody>
                </Card>
            </Col>
          ))
        ) : (
          <p className="m-2">Nema preporučenih terapeuta.</p>
        )}
      </Row>
      <div className="text-center mt-4 mb-5">
        <Button color="info" tag={Link} to="/admin/svi-terapeuti">
          Prikaži sve terapeute
        </Button>
      </div>
    </Container>
  );
};

export default GuestDashboard;

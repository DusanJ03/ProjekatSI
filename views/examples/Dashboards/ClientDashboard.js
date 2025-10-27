import React from "react";
import { Button, Card, CardBody, Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

const ClientDashboard = ({ data, therapists }) => {
  const nextSession = data?.nextSession;
  return (
    <Container className="pt-7">
      <h2 className="mb-4">Dobrodošli nazad!</h2>

      <h4 className="mb-3">Vaša sledeća sesija</h4>
      {nextSession ? (
        <Card className="mb-5 shadow border-primary">
          <CardBody>
            <Row>
              <Col>
                <p className="mb-0 fs-5">
                  <strong>Datum:</strong>{' '}
                  {new Date(nextSession.datum).toLocaleDateString("sr-Latn-RS", {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })} u {new Date(nextSession.datum).toLocaleTimeString("sr-Latn-RS", {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <p className="mb-0 fs-5">
                  <strong>Terapeut:</strong> {nextSession.terapeutIme}
                </p>
              </Col>
              <Col xs="auto" className="d-flex align-items-center">
                <Button color="info" size="sm" tag={Link} to={`/admin/terapeuti/${nextSession.terapeutSlug}`}>
                  Pogledaj profil terapeuta
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      ) : (
        <p className="mb-5">Trenutno nemate zakazanih sesija.</p>
      )}

      <h4>Preporučeni terapeuti</h4>
      <Row>
        {therapists.length > 0 ? (
          therapists.map((t) => (
            <Col md="4" key={t.id}>
              <Card className="shadow-sm mb-3">
                  <CardBody>
                    <h5>{t.name} {t.surname} </h5>
                    <p>{t.specijalizacija} | {t.staz}</p>
                    <Button color="primary" size="sm" href={`/admin/terapeuti/${t.slug}`}>
                        Pogledaj profil
                    </Button>
                  </CardBody>
                </Card>
            </Col>
          ))
        ) : (
          <p>Nema preporučenih terapeuta.</p>
        )}
      </Row>

      <div className="text-center mt-4">
        <Button color="info" tag={Link} to="/admin/svi-terapeuti">Prikaži sve terapeute</Button>
      </div>
    </Container>
  );
};

export default ClientDashboard;

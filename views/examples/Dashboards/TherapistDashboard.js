import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardText,
  Container,
  Row,
  Col,
} from "reactstrap";

const TherapistDashboard = ({ data }) => {
  if (!data) {
    return <p>Nema podataka za prikaz.</p>;
  }

  return (
    <Container className="pt-7">
      <h2 className="mb-4">Vaš Terapeut Panel</h2>
      <Row>
        {/* Sledeci termin */}
        <Col lg="4" md="6" className="mb-4">
          <Card className="shadow h-100">
            <CardHeader className="bg-primary text-white">
              Sledeći termin
            </CardHeader>
            <CardBody className="d-flex flex-column">
              {data.nextSession ? (
                <div>
                  <CardTitle tag="h4">{data.nextSession.klijentIme}</CardTitle>
                  <CardText>
                    <strong>Datum:</strong>{" "}
                    {new Date(data.nextSession.datum).toLocaleDateString("sr-Latn-RS")}
                  </CardText>
                  <CardText>
                    <strong>Vreme:</strong>{" "}
                    {new Date(data.nextSession.datum).toLocaleTimeString("sr-Latn-RS", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardText>
                </div>
              ) : (
                <p className="my-auto">Nemate zakazanih termina.</p>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Statistika */}
        <Col lg="4" md="6" className="mb-4">
          <Card className="shadow h-100">
            <CardHeader className="bg-success text-white">Statistika</CardHeader>
            <CardBody>
              <CardTitle tag="h5">Prosečna ocena</CardTitle>
              <p className="display-4">{data.prosecnaOcena} / 5</p>
              <hr />
              <CardTitle tag="h5">Predstojeći termini</CardTitle>
              <p className="display-4">{data.upcomingAppointmentsCount}</p>
            </CardBody>
          </Card>
        </Col>

        {/* Poslednje recenzije */}
        <Col lg="4" md="12" className="mb-4">
          <Card className="shadow h-100">
            <CardHeader className="bg-info text-white">
              Poslednje recenzije
            </CardHeader>
            <CardBody>
              {data.recentReviews && data.recentReviews.length > 0 ? (
                data.recentReviews.map((review, index) => (
                  <div key={index} className="mb-3">
                    <strong>{review.klijentIme}</strong>
                    <p className="mb-0">Ocena: {(review.ocena)}/5</p>
                    <p className="text-muted fst-italic">"{review.komentar}"</p>
                    {index < data.recentReviews.length - 1 && <hr />}
                  </div>
                ))
              ) : (
                <p>Još uvek nemate recenzija.</p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TherapistDashboard;
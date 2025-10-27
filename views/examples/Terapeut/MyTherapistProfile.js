import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Spinner,
  CardHeader,
  CardTitle,
  CardText,
} from "reactstrap";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const MyTherapistProfile = () => {
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState([]);
  const n=1;
  const [visibleReviews, setVisibleReviews] = useState(n);
  const navigate = useNavigate();
  const baseUrl = "http://localhost:5006";

  useEffect(() => {
    const fetchProfileAndSlots = async () => {
      try {
        const token = localStorage.getItem("token");
        const id = localStorage.getItem("userId");

        const [profileRes, slotsRes] = await Promise.all([
          axios.get("http://localhost:5006/api/terapeuti/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5006/api/terapeuti/${id}/termini`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("Dohvaćeni profil:", profileRes.data);
        setTherapist(profileRes.data);
        setDates(slotsRes.data);
      } catch (error) {
        toast.error("Greška pri učitavanju podataka.");
        console.error("Greška pri učitavanju profila ili termina:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndSlots();
  }, []);

  if (loading) return <Spinner color="primary" className="m-5" />;
  if (!therapist) return <p className="m-3">Nema podataka o profilu.</p>;

  return (
    <div className="container-fluid p-4">
      <Row className="mt-6 justify-content-center">
        {/* DESNO - profilna kartica */}
        <Col md="4" lg="4" xl="3" className="order-1 order-md-2 mb-4 mb-md-0">
          <div style={{ maxWidth: '380px', margin: '0 auto' }}>
            <Card className="card-profile text-center">
              <div className="cover-photo" style={{
              backgroundImage: `url(${baseUrl}${therapist.profileImage})`}}
              />
              <div style={{ marginTop: "-60px", marginBottom: "1rem" }}>
                <div className="profile-avatar-wrapper">
                  <img
                    src={`${baseUrl}${therapist.profileImage}` || require("../../../assets/img/theme/nema_slike.png")}
                    alt="slika"
                    className="profile-avatar"
                  />
                </div>
                <div className="text-center">
                  <h3 className="mt-1 mb-0">{therapist.name} {therapist.surname}</h3>
                </div>
              </div>
              <CardBody className="pt-2">
                <CardTitle tag="small" className="text-muted mb-0">
                  Specijalizacija
                </CardTitle>
                <CardText tag="h4" className="mt-1">
                  {therapist.specijalizacija || "Nije uneta specijalizacija"}
                </CardText>
                <hr className="my-4" />
                <Button
                  color="primary"
                  block
                  onClick={() => navigate("/admin/edit-therapist-profile")}
                >
                  Uredi profil
                </Button>
                <Button
                  tag={Link}
                  to="/admin/kalendar-termina"
                  color="success"
                  block
                  className="ml-0"
                >
                  Moji termini
                </Button>
              </CardBody>
            </Card>
          </div>
        </Col>

        {/* LEVO - info */}
        <Col md="7" lg="8" xl="7" className="order-2 order-md-1">
          <Card className="mb-4">
            <CardHeader className="bg-white border-0">
              <h3 className="mb-0">O meni</h3>
            </CardHeader>
            <CardBody>
              <p className="pl-lg-4">
                {therapist.opis || "Niste uneli opis."}
              </p>
            </CardBody>
          </Card>
          <Card className="mb-4">
            <CardHeader className="bg-white border-0">
              <h3 className="mb-0">Osnovne informacije</h3>
            </CardHeader>
            <CardBody>
              <div className="pl-lg-4">
                <Row>
                  <Col lg="6" className="mb-3">
                    <span className="terapeut-labela">Email</span>
                    <span className="terapeut-vrednost">{therapist.email}</span>
                  </Col>
                  <Col lg="6" className="mb-3">
                    <span className="terapeut-labela">Korisničko ime</span>
                    <span className="terapeut-vrednost">{therapist.userName}</span>
                  </Col>
                  <Col lg="6" className="mb-3">
                    <span className="terapeut-labela">Grad</span>
                    <span className="terapeut-vrednost">{therapist.grad || "-"}</span>
                  </Col>
                  <Col lg="6" className="mb-3">
                    <span className="terapeut-labela">Fakultet</span>
                    <span className="terapeut-vrednost">{therapist.faks || "-"}</span>
                  </Col>
                  <Col lg="6" className="mb-3">
                    <span className="terapeut-labela">Staž</span>
                    <span className="terapeut-vrednost">{therapist.staz || 0} godine</span>
                  </Col>
                </Row>
              </div>
            </CardBody>
          </Card>

          {/* termini */}
          <Card className="mb-4">
            <CardHeader className="bg-white border-0">
              <h3 className="mb-0">Slobodni termini</h3>
            </CardHeader>
            <CardBody>
              <ul className="pl-lg-4">
                {(() => {
                  const slobodniTermini = dates.filter(slot => 
                    !slot.klijentID || slot.klijentID.trim() === ''
                  );

                  if (slobodniTermini.length === 0) {
                    return <p>Trenutno nema slobodnih termina.</p>;
                  }

                  return slobodniTermini
                    .sort((a, b) => new Date(a.datum) - new Date(b.datum))
                    .slice(0, 5)
                    .map((slot, index) => {
                      const dateObj = new Date(slot.datum);
                      
                      if (isNaN(dateObj)) {
                        return null;
                      }

                      return (
                        <li key={index}>
                          {dateObj.toLocaleDateString("sr-Latn-RS", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}{" u "}
                          {dateObj.toLocaleTimeString("sr-Latn-RS", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </li>
                      );
                    });
                })()}
              </ul>
            </CardBody>
          </Card>

          {/* recenzije */}
          <Card>
            <CardHeader className="bg-white border-0">
              <h3 className="mb-0">Recenzije klijenata</h3>
            </CardHeader>
            <CardBody>
              <div className="pl-lg-4">
                {therapist.recenzije?.length > 0 ? (
                  therapist.recenzije
                    .slice(0, visibleReviews)
                    .map((recenzija, index) => (
                      <div key={recenzija.id || index} className="mb-3">
                        <strong>{recenzija.imeKlijenta}</strong>
                        <p className="mb-0">Ocena: {recenzija.ocena}/5</p>
                        <p className="text-muted">{recenzija.komentar}</p>
                        {index < therapist.recenzije.length - 1 && <hr />}
                      </div>
                    ))
                ) : (
                  <p>Još uvek nemate recenzija.</p>
                )}
              </div>
              {visibleReviews < (therapist.recenzije?.length || 0) && (
                <div className="text-center mt-3">
                  <Button
                    color="secondary"
                    size="md"
                    onClick={() => setVisibleReviews((prev) => prev + n)}
                  >
                    Prikaži još
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MyTherapistProfile;
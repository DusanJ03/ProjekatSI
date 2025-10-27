import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Row,
  Col,
  Button,
  Spinner,
  CardHeader,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import axios from "axios";
import { useParams, Link } from "react-router-dom"; 
import { toast } from "react-toastify";

const TherapistProfile = () => {
  const { slug } = useParams(); 
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState([]);
  const [newReview, setNewReview] = useState({ ocena: 5, komentar: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [canUserReview, setCanUserReview] = useState(false);
  const n = 1; // Broj recenzija koje se prikazuju klikom na prikazi jos
  const [visibleReviews, setVisibleReviews] = useState(n);

  const userRole = localStorage.getItem("role");
  const currentUserId = localStorage.getItem("userId");
  const baseUrl = "http://localhost:5006";  

  const fetchPublicProfile = async () => {
  if (!slug) {
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    const profileRes = await axios.get(
      `http://localhost:5006/api/terapeuti/slug/${slug}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const therapistData = profileRes.data;

    const therapistId = therapistData.id;
    const slotsRes = await axios.get(
      `http://localhost:5006/api/terapeuti/${therapistId}/termini`
    );

    setTherapist(therapistData);
    setDates(slotsRes.data);

    const alreadyReviewed = therapistData.recenzije?.some(
      (rec) => String(rec.klijentID) === String(currentUserId)
    );
    setCanUserReview(!alreadyReviewed);

  } catch (error) {
    toast.error("Greška: Profil nije moguće učitati.");
    setTherapist(null);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchPublicProfile();
}, [slug, currentUserId, userRole]);

const handleReviewChange = (e) => {
  setNewReview({ ...newReview, [e.target.name]: e.target.value });
};

const handleSubmitReview = async (e) => {
  e.preventDefault();
  setIsSubmittingReview(true);
  try {
    const token = localStorage.getItem("token");

    const requestBody = {
      terapeutID: therapist.id,
      ocena: parseInt(newReview.ocena, 10),
      komentar: newReview.komentar,
    };

    const url = `http://localhost:5006/api/klijenti/ostavi-recenziju`;
    await axios.post(url, requestBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success("Hvala na recenziji!");
    
    await fetchPublicProfile();
    setCanUserReview(false);
    setNewReview({ ocena: 5, komentar: "" });

  } catch (error) {
    const errorMessage =
      error.response?.data?.Message || "Greška prilikom slanja recenzije.";
    toast.error(errorMessage);
  } finally {
    setIsSubmittingReview(false);
  }
};

  if (loading) return <Spinner color="primary" className="m-5" />;
  if (!therapist) return <p className="m-3 text-center">Profil terapeuta nije pronađen.</p>;

   return (
    <div className="container-fluid p-4 pt-7">
      <Row className="justify-content-center">
        {/* DESNO */}
        <Col md="5" lg="4" className="order-1 order-md-2 mb-4 mb-md-0">
          <Card className="card-profile text-center shadow-sm mb-4">
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
              <div className="text-center mt-1 mb-2">
                <h3 className="mb-0">{therapist.name} {therapist.surname}</h3>
              </div>
            </div>
            <CardBody className="pt-0">
              <CardTitle tag="small" className="text-muted mb-0">
                Specijalizacija
              </CardTitle>
              <CardText tag="h4" className="mt-1">
                {therapist.specijalizacija || "Nije uneta specijalizacija"}
              </CardText>
              <hr className="my-4" />
              {userRole === 'Klijent' ? (
                <Button
                  tag={Link}
                  to={`/admin/terapeuti/available-slots/${slug}`}
                  color="primary"
                  block
                >
                  Zakaži termin
                </Button>
              ) : (
                <p className="text-muted small">
                  {'Prijavite se kao klijent da biste zakazali termin'}
                </p>
              )}
            </CardBody>
          </Card>

          {canUserReview && userRole === 'Klijent' &&(
            <Card className="shadow-sm">
              <CardHeader className="bg-white border-0">
                <h3 className="mb-0">Ostavi recenziju</h3>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmitReview}>
                  <FormGroup>
                    <Label for="ocena" className="small">Ocena</Label>
                    <Input bsSize="sm" type="select" name="ocena" id="ocena" value={newReview.ocena} onChange={handleReviewChange}>
                      <option value="5">5 (Odlično)</option>
                      <option value="4">4 (Vrlo dobro)</option>
                      <option value="3">3 (Dobro)</option>
                      <option value="2">2 (Loše)</option>
                      <option value="1">1 (Veoma loše)</option>
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label for="komentar" className="small">Komentar</Label>
                    <Input bsSize="sm" type="textarea" name="komentar" id="komentar" value={newReview.komentar} onChange={handleReviewChange} required placeholder="Podelite vaše iskustvo..." />
                  </FormGroup>
                  <Button color="success" type="submit" disabled={isSubmittingReview} block>
                    {isSubmittingReview ? <Spinner size="sm" /> : "Pošalji recenziju"}
                  </Button>
                </Form>
              </CardBody>
            </Card>
          )}
          {userRole === 'Klijent' && !canUserReview && !loading && (
             <Card className="shadow-sm mt-4">
               <CardBody className="text-center">
                 <p className="mb-0 text-muted">Hvala! Već ste ostavili recenziju za ovog terapeuta.</p>
               </CardBody>
             </Card>
          )}
          
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
                    <span className="terapeut-labela">Grad</span>
                    <span className="terapeut-vrednost">{therapist.grad || "-"}</span>
                  </Col>
                  <Col lg="6" className="mb-3">
                    <span className="terapeut-labela">Fakultet</span>
                    <span className="terapeut-vrednost">{therapist.faks || "-"}</span>
                  </Col>
                  <Col lg="6" className="mb-3">
                    <span className="terapeut-labela">Godine iskustva</span>
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
                {(() => { // POGLEDAAAAAAAAAAAAAAJ OVOOOOOOOO DOLE TO MOZE STATUSOM
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
                  therapist.recenzije.slice(0, visibleReviews).map((recenzija, index) => {
                    const isMyReview = String(recenzija.klijentID) === String(currentUserId);
                    return (
                      <div key={recenzija.id || index} className="mb-0">
                        <strong>
                          {isMyReview ? "Vaša recenzija" : recenzija.imeKlijenta}
                        </strong>
                        <p className="mb-0">Ocena: {recenzija.ocena}/5</p>
                        <p className="text-muted">{recenzija.komentar}</p>
                        {index < therapist.recenzije.length - 1 && <hr />}
                      </div>
                    );
                  })
                ) : (
                  <p>Još uvek nemate recenzija.</p>
                )}
              </div>
            </CardBody>
          </Card>
          {visibleReviews < therapist.recenzije.length && (
            <div className="text-center mt-3">
              <Button
                color="secondary"
                size="md"
                onClick={() => setVisibleReviews(prev => prev + n)}
              >
                Prikaži još
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TherapistProfile;
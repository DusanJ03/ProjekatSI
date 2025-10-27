import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
  Alert,
} from "reactstrap";
import axios from "axios";

const EditTherapistProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    userName: "",
    email: "",
    opis: "",
    specijalizacija: "",
    grad: "",
    faks: "",
    staz: "",
    profileImage: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [gradovi, setGradovi] = useState([]);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");
  const baseUrl = "http://localhost:5006"; 
  const profileImage = localStorage.getItem("profileImage");

  // Ucitaj podatke terapeuta pri otvaranju stranice
  useEffect(() => {
     axios
    .get("http://localhost:5006/api/users/gradovi")
    .then((res) => setGradovi(res.data))
    .catch(() => console.error("Greška pri učitavanju gradova"));

    axios
      .get("http://localhost:5006/api/terapeuti/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFormData({
          name: res.data.name || "",
          surname: res.data.surname || "",
          userName: res.data.userName || "",
          email: res.data.email || "",
          opis: res.data.opis || "",
          specijalizacija: res.data.specijalizacija || "",
          grad: res.data.grad || "",
          faks: res.data.faks || "",
          staz: res.data.staz ? res.data.staz.toString() : "",
          profileImage: res.data.profileImage || "",
        });
      })
      .catch(() => setError("Greška pri učitavanju profila."));
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      name: formData.name,
      surname: formData.surname,
      userName: formData.userName,
      email: formData.email,
      opis: formData.opis,
      specijalizacija: formData.specijalizacija,
      grad: formData.grad,
      faks: formData.faks,
      staz: Number(formData.staz) || 0,
      profileImage: formData.profileImage,
    };

    axios
    .put("http://localhost:5006/api/terapeuti/update", payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => setMessage("Profil uspešno ažuriran."))
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.errors) {
        const errors = Object.values(err.response.data.errors)
          .flat()
          .join(" ");
        setError(errors);
      } else {
        setError("Greška pri ažuriranju profila.");
      }
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5006/api/users/slika-profila",
        data,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      setFormData((prev) => ({ ...prev, profileImage: res.data.fileUrl }));
      localStorage.setItem("profileImage", res.data.fileUrl);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="mt-2">
      <Row>
        <Col md="8" className="mx-auto">
          <Card className="shadow mt-7">
            <CardBody>
              <h3 className="mb-4">Edit Therapist Profile</h3>

              {message && <Alert color="success">{message}</Alert>}
              {error && <Alert color="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <label>Profilna slika</label>
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                      {formData.profileImage && (
                        <img
                          src={`${baseUrl}${profileImage}`}
                          alt="Profilna slika"
                          style={{ width: "100px", marginTop: "10px" }}
                        />
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <label>Ime</label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label>Prezime</label>
                      <Input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <FormGroup>
                      <label>Username</label>
                      <Input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label>Email</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <label>Opis</label>
                  <Input
                    type="textarea"
                    name="opis"
                    value={formData.opis}
                    onChange={handleChange}
                  />
                </FormGroup>

                <Row>
                  <Col md="6">
                    <FormGroup>
                      <label>Specijalizacija</label>
                      <Input
                        type="text"
                        name="specijalizacija"
                        value={formData.specijalizacija}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label>Grad</label>
                      <Input
                        type="select"
                        name="grad"
                        value={formData.grad}
                        onChange={handleChange}
                      >
                        <option value="">Izaberite grad</option>
                        {gradovi.map((g, index) => (
                          <option key={index} value={g}>
                            {g}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <FormGroup>
                      <label>Fakultet</label>
                      <Input
                        type="text"
                        name="faks"
                        value={formData.faks}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label>Staž</label>
                      <Input
                        type="number"
                        name="staz"
                        value={formData.staz}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Button color="primary" type="submit">
                  Save Changes
                </Button>
              </Form>
            </CardBody>ai
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EditTherapistProfile;
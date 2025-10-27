import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  CardHeader,
  CardTitle,
  CardText,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const MyClientProfile = () => {
  const [client, setClient] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    profileimage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const baseUrl = "http://localhost:5006";

  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5006/api/klijenti/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClient({
          name: res.data.name || "",
          surname: res.data.surname || "",
          username: res.data.username || "",
          email: res.data.email || "",
          password: "",
          profileimage: res.data.profileimage
            ? `${baseUrl}${res.data.profileimage}`
            : null
        });
      } catch (err) {
        toast.error("Greška pri učitavanju profila");
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, []);

  const handleChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5006/api/klijenti/update",
        {
          name: client.name,
          surname: client.surname,
          username: client.username,
          email: client.email,
          profileimage: client.profileimage !== "" ? client.profileimage : undefined,
          password: client.password !== "" ? client.password : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profil uspešno ažuriran");
      setClient((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      toast.error("Greška pri čuvanju profila");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5006/api/users/slika-profila",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setClient((prev) => ({
        ...prev,
        profileimage: res.data.fileUrl.startsWith("http")
          ? res.data.fileUrl
          : `${baseUrl}${res.data.fileUrl}`
      }));
      localStorage.setItem("profileImage", res.data.fileUrl);
      toast.success("Slika uspešno ažurirana");
    } catch (err) {
      toast.error("Greška pri uploadu slike");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Spinner color="primary" className="m-5" />;

  return (
    <div className="container-fluid p-4">
      <Row className="mt-6">
        {/* DESNO - Profilna kartica */}
        <Col md="4" className="order-1 order-md-2 mb-4 mb-md-0">
          <Card className="card-profile text-center">
            <CardBody>
              <div className={{ marginTop: "-75px", marginBottom: "1rem" }}>
                <div className="profile-avatar-wrapper">
                  <img
                    src={client.profileimage || require("../../../assets/img/theme/nema_slike.png")}
                    alt="slika"
                    className="profile-avatar"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="profile-avatar-input"
                    accept="image/*"
                  />
                  {uploading && <Spinner size="sm" className="profile-avatar-spinner" />}
                </div>
              </div>
              <CardTitle tag="h5" className="mb-0">{`${client.name} ${client.surname}`}</CardTitle>
              <CardText className="text-muted mt-1">{client.email}</CardText>
              <hr className="my-4" />
              <Button tag={Link} to="/admin/kalendar-termina" color="primary" block>
                Moji termini
              </Button>
            </CardBody>
          </Card>
        </Col>

        {/* LEVO - forma */}
        <Col md="8" className="order-2 order-md-1">
          <Card>
            <CardHeader className="bg-white border-0">
              <h3 className="mb-0">Edit Profile</h3>
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <h6 className="heading-small text-muted mb-4">
                  User information
                </h6>
                <div className="pl-lg-4">
                  <Row>
                    <Col lg="6">
                      <FormGroup>
                        <Label for="username">Korisničko ime</Label>
                        <Input
                          type="text"
                          name="username"
                          id="username"
                          value={client.username}
                          onChange={handleChange}
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col lg="6">
                      <FormGroup>
                        <Label for="email">Email adresa</Label>
                        <Input
                          type="email"
                          name="email"
                          id="email"
                          value={client.email}
                          onChange={handleChange}
                          required
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg="6">
                      <FormGroup>
                        <Label for="name">Ime</Label>
                        <Input
                          type="text"
                          name="name"
                          id="name"
                          value={client.name}
                          onChange={handleChange}
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col lg="6">
                      <FormGroup>
                        <Label for="surname">Prezime</Label>
                        <Input
                          type="text"
                          name="surname"
                          id="surname"
                          value={client.surname}
                          onChange={handleChange}
                          required
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for="password">Nova lozinka</Label>
                        <Input
                          type="password"
                          name="password"
                          id="password"
                          value={client.password}
                          onChange={handleChange}
                          placeholder="Ostavite prazno ako ne menjate"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
                <hr className="my-4" />
                <div className="text-right">
                  <Button type="submit" color="success" disabled={saving}>
                    {saving ? <Spinner size="sm" /> : "Sačuvaj izmene"}
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MyClientProfile;
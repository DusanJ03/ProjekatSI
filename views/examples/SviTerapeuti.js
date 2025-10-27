import React, { useEffect, useState, useContext  } from "react";
import { Link } from "react-router-dom";
import { SearchContext } from "views/examples/SearchContext"; 
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

const SviTerapeuti = () => {
  const [gradovi, setGradovi] = useState([]);
  const [izabraniGrad, setIzabraniGrad] = useState("");
  const [terapeuti, setTerapeuti] = useState([]);
  const [loadingGradovi, setLoadingGradovi] = useState(false);
  const [loadingTerapeuti, setLoadingTerapeuti] = useState(false);
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const [sortOption, setSortOption] = useState("default");
  const [aktivnoSortiranje, setAktivnoSortiranje] = useState("default");

  useEffect(() => {
    const fetchGradovi = async () => {
      setLoadingGradovi(true);
      try {
        const res = await axios.get("http://localhost:5006/api/users/gradovi");
        setGradovi(res.data);
      } catch (error) {
        toast.error("Greška pri učitavanju gradova");
      } finally {
        setLoadingGradovi(false);
      }
    };

    fetchGradovi();
  }, []);

  useEffect(() => {
    return () => {
      setSearchTerm('');
    };
  }, [setSearchTerm]);

  useEffect(() => {
    const fetchSviTerapeuti = async () => {
      setLoadingTerapeuti(true);
      const params = {};
      if (izabraniGrad) {
        params.grad = izabraniGrad;
      }
      try {
        const res = await axios.get("http://localhost:5006/api/terapeuti/pretraga",
            { params })

        setTerapeuti(res.data);
      } catch (error) {
        toast.error("Greška pri učitavanju terapeuta");
      } finally {
        setLoadingTerapeuti(false);
      }
    };

    fetchSviTerapeuti();
  }, []);

  const pretraziTerapeute = async () => {
    if (!izabraniGrad) {
      try {
        setLoadingTerapeuti(true);
        const res = await axios.get("http://localhost:5006/api/terapeuti/pretraga?grad=");
        setTerapeuti(res.data);
        setAktivnoSortiranje(sortOption);
      } catch (error) {
        toast.error("Greška pri učitavanju terapeuta");
      } finally {
        setLoadingTerapeuti(false);
      }
      return;
    }

    setLoadingTerapeuti(true);
    try {
      const res = await axios.get(
        `http://localhost:5006/api/terapeuti/pretraga?grad=${izabraniGrad}`
      );
      setTerapeuti(res.data);
    } catch (error) {
      toast.error("Greška pri pretrazi terapeuta");
    } finally {
      setLoadingTerapeuti(false);
    }
  };

  const prikazaniTerapeuti = terapeuti
    .filter(terapeut => {
      const imeTerapeuta = `${terapeut.name} ${terapeut.surname}`.toLowerCase();
      const specijalizacija = terapeut.specijalizacija ? terapeut.specijalizacija.toLowerCase() : '';
      const unos = searchTerm.toLowerCase();
      return imeTerapeuta.includes(unos) || specijalizacija.includes(unos);
    })
    .sort((a, b) => {
      if (aktivnoSortiranje === "ocena-desc") {
        return (b.prosecnaOcena || 0) - (a.prosecnaOcena || 0);
      }
      if (aktivnoSortiranje === "ocena-asc") {
        return (a.prosecnaOcena || 0) - (b.prosecnaOcena || 0);
      }
      return 0;
    });

  return (
    <Container className="pt-5">
      <h3 className="mb-4 mt-5">Svi terapeuti</h3>

      {loadingGradovi ? (
        <Spinner />
      ) : (
        <Row className="mb-3 align-items-center">
          <Col md="4">
            <Input
              type="select"
              value={izabraniGrad}
              onChange={(e) => setIzabraniGrad(e.target.value)}
            >
              <option value="">Izaberite grad</option>
              {gradovi.map((grad) => (
                <option key={grad} value={grad}>
                  {grad}
                </option>
              ))}
            </Input>
          </Col>
          <Col md="4">
            <Input
              type="select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Sortiraj po</option>
              <option value="ocena-desc">Oceni (najviša prva)</option>
              <option value="ocena-asc">Oceni (najniža prva)</option>
            </Input>
          </Col>
          <Col md="2">
            <Button
              color="primary"
              onClick={pretraziTerapeute}
              disabled={loadingTerapeuti}
            >
              Pretraži
            </Button>
          </Col>
        </Row>
      )}

      <Row>
        {loadingTerapeuti && <Spinner />}
        {!loadingTerapeuti && terapeuti.length === 0 && (
          <p>Nema terapeuta za izabrani grad.</p>
        )}
        {prikazaniTerapeuti.map((terapeut) => (
          <Col md="4" key={terapeut.username} className="mb-3">
            <Card>
              <CardBody>
                <h4>
                  {terapeut.name} {terapeut.surname}
                </h4>
                <p className="small">
                  {terapeut.specijalizacija}
                  <br />
                  Ocena: {terapeut.prosecnaOcena ? terapeut.prosecnaOcena.toFixed(1) : "Nema ocene"}
                  <br />
                  Staž: {terapeut.staz} godina</p>
                <Button color="primary" size="sm" 
                  tag={Link} to={`/admin/terapeuti/${terapeut.slug}`}>
                    Pogledaj profil
                </Button>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SviTerapeuti;
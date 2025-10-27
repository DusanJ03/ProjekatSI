import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GuestDashboard from "./Dashboards/GuestDashboard";
import ClientDashboard from "./Dashboards/ClientDashboard";
import TherapistDashboard from "./Dashboards/TherapistDashboard";
import { toast } from "react-toastify";
import { SearchContext } from "views/examples/SearchContext"; 

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const [therapists, setTherapists] = useState([]);
  const [therapistData, setTherapistData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const { searchTerm } = useContext(SearchContext);

  useEffect(() => {
    const savedRole = localStorage.getItem("role") || "guest";
    setRole(savedRole);
    const token = localStorage.getItem("token");

    if (savedRole === "Klijent") {
      const fetchClientData = async () => {
        try {
          const [dashboardRes, therapistsRes] = await Promise.all([
            axios.get("http://localhost:5006/api/klijenti/dashboard", {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get("http://localhost:5006/api/terapeuti/recommended", {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);
          
          setClientData(dashboardRes.data);
          setTherapists(therapistsRes.data);
        } catch (error) {
          console.error("Greška pri učitavanju podataka za klijenta:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchClientData();
    } else if (savedRole === "Terapeut") {
      const fetchTherapistData = async () => {
        try {
          const res = await axios.get("http://localhost:5006/api/terapeuti/dashboard", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTherapistData(res.data); 

        } catch (error) {
          console.error("Greška pri učitavanju podataka za terapeuta:", error);
          toast.error("Nije moguće učitati podatke za dashboard.");
        } finally {
          setLoading(false);
        }
      };
      fetchTherapistData();
      
    } else { // guest
      const fetchGuestData = async () => {
        try {
          const res = await axios.get("http://localhost:5006/api/terapeuti/recommended");
          setTherapists(res.data);
        } catch (error) {
          console.error("Greška pri učitavanju podataka za gosta:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchGuestData();
    }
  }, []);

   const filtriraniTerapeuti = therapists.filter(terapeut => {
    if (!searchTerm) {
      return true;
    }
    const imeTerapeuta = `${terapeut.name} ${terapeut.surname}`.toLowerCase();
    const specijalizacija = terapeut.specijalizacija ? terapeut.specijalizacija.toLowerCase() : '';
    const unos = searchTerm.toLowerCase();

    return imeTerapeuta.includes(unos) || specijalizacija.includes(unos);
  });

  if (loading) return <div>Učitavanje...</div>;

  if (role === "Klijent") {
    return <ClientDashboard data={clientData} therapists={filtriraniTerapeuti} />;
  }
  if (role === "Terapeut") {
    return <TherapistDashboard data={therapistData} />;
  }
  return <GuestDashboard therapists={filtriraniTerapeuti} />;
};

export default Dashboard;
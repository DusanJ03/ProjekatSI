import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "reactstrap";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import { toast } from "react-toastify";

const TherapistAvailableSlots = () => {
  const { slug } = useParams(); 
  const localizer = momentLocalizer(moment);
  const [loading, setLoading] = useState(true);
  const [therapistInfo, setTherapistInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const profileRes = await axios.get(`http://localhost:5006/api/terapeuti/slug/${slug}`);
        setTherapistInfo(profileRes.data);
        
        const therapistId = profileRes.data.id;
        const slotsRes = await axios.get(`http://localhost:5006/api/terapeuti/${therapistId}/termini`);
      
        const availableSlots = slotsRes.data
          .filter(slot => !slot.klijentID|| slot.klijentID.trim() === '')
          .map((slot, index) => {
            const start = new Date(slot.datum);
            return {
              id: index,
              title: "Slobodno",
              start: start,
              end: new Date(start.getTime() + 60 * 60000),
              resource: slot,
            };
          });
        setEvents(availableSlots);

        console.log("d termini", availableSlots);

      } catch (err) {
        toast.error("Greška pri učitavanju podataka");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [slug]);

  const toggleReserveModal = () => setReserveModalOpen(!reserveModalOpen);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    toggleReserveModal();
  };
  
  const handleReserveAppointment = async () => {
    if (!selectedEvent || !therapistInfo) return;

    try {
      const token = localStorage.getItem("token");
      
      const requestBody = {
        therapistId: therapistInfo.id,
        datum: selectedEvent.resource.datum,
      };
      
      await axios.put(`http://localhost:5006/api/klijenti/zakazi-termin`, requestBody, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Termin uspešno rezervisan!");
      toggleReserveModal();
      
      setEvents(prevEvents => prevEvents.filter(e => e.id !== selectedEvent.id));

    } catch (err) {
      toast.error(err.response?.data || "Greška pri rezervaciji termina. Možda je zauzet.");
    }
  };

  const eventStyleGetter = () => ({
    style: { backgroundColor: "#2dce89", color: "white", border: 'none', borderRadius: '5px' }
  });

  if (loading) return <Spinner color="primary" className="m-5" />;

  return (
    <Container className="pt-7">
      <h2 className="mb-4">Slobodni termini kod: {therapistInfo?.name} {therapistInfo?.surname}</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        messages={{
            next: "Sledeći",
            previous: "Prethodni",
            today: "Danas",
            month: "Mesec",
            week: "Nedelja",
            day: "Dan"
        }}
      />

      <Modal isOpen={reserveModalOpen} toggle={toggleReserveModal}>
        <ModalHeader toggle={toggleReserveModal}>Potvrda rezervacije</ModalHeader>
        <ModalBody>
          Da li ste sigurni da želite da rezervišete termin?
          <br />
          <strong>
            {selectedEvent ? moment(selectedEvent.start).format("dddd, DD.MM.YYYY. u HH:mm") : ""}
          </strong>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleReserveAppointment}>
            Potvrdi
          </Button>
          <Button color="secondary" onClick={toggleReserveModal}>
            Otkaži
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default TherapistAvailableSlots;
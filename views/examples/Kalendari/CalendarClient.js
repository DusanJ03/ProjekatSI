import React, { useState, useEffect } from "react";
import {
  Container,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody
} from "reactstrap";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import { toast } from "react-toastify";

const CalendarClient = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const token = localStorage.getItem("token");
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    fetchClientAppointments();
  }, []);

   const fetchClientAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5006/api/klijenti/termini", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formattedEvents = res.data.map((app) => {
        const start = new Date(app.datum); 
        
        let eventStatus = "nepoznat";
        let title = `Termin kod: ${app.terapeutIme}`;

        if ((app.status === "Zakazan" || app.status === 0) && start < new Date()) {
            eventStatus = "zavrsen";
            title = `Završen termin: ${app.terapeutIme}`;
        } else {
            switch (app.status) {
                case "Zakazan":
                case 0:
                    eventStatus = "zakazan";
                    break;
                case "OtkazanOdStraneKlijenta":
                case 1:
                case "OtkazanOdStraneTerapeuta":
                case 2:
                    eventStatus = "otkazan";
                    title = `OTKAZAN termin: ${app.terapeutIme}`;
                    break;
                case "Zavrsen":
                case 3:
                    eventStatus = "zavrsen";
                    title = `Završen termin: ${app.terapeutIme}`;
                    break;
            }
        }
        
        return {
          id: start.toISOString(), 
          title,
          start,
          end: new Date(start.getTime() + 60 * 60000),
          status: eventStatus,
          resource: app 
        };
      });
      setEvents(formattedEvents);
    } catch (err) {
      toast.error("Greška pri učitavanju zakazanih termina.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3182ce"; 
    if (event.status === "otkazan") backgroundColor = "#848484";
    if (event.status === "zavrsen") backgroundColor = "#2dce89";

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        color: "white",
        border: "0px",
        display: "block",
        padding: "2px 5px"
      }
    };
  };

   const handleCancelAppointment = async () => {
    if (!selectedEvent) return;
    
    setIsCancelling(true);
    try {
      const requestBody = {
        datum: selectedEvent.resource.datum,
      };

      await axios.post(
        `http://localhost:5006/api/termini/otkazi`, 
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Termin je uspešno otkazan!");
      toggleModal();
      fetchClientAppointments();
    } catch (error) {
      const errorMessage = error.response?.data?.Message || "Greška pri otkazivanju termina.";
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center p-5">
        <Spinner color="primary" />
        <p>Učitavanje termina...</p>
      </Container>
    );
  }

  return (
    <Container className="p-4">
      <h3 className="mb-4 mt-6">Moji zakazani termini</h3>
      <Card>
        <CardBody>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "60vh" }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            messages={{
              next: "Sledeći",
              previous: "Prethodni",
              today: "Danas",
              month: "Mesec",
              week: "Nedelja",
              day: "Dan",
            }}
          />
        </CardBody>
      </Card>

      {/* prikaz detalja termina */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Detalji termina</ModalHeader>
        {selectedEvent && (
          <ModalBody>
            <p><strong>Terapeut:</strong> {selectedEvent.resource.terapeutIme}</p>
            <p><strong>Datum:</strong> {moment(selectedEvent.start).format("DD.MM.YYYY.")}</p>
            <p><strong>Vreme:</strong> {moment(selectedEvent.start).format("HH:mm")}h</p>
            <p><strong>Status:</strong> <span style={{textTransform: 'capitalize'}}>{selectedEvent.status}</span></p>
          </ModalBody>
        )}
         <ModalFooter>
          {selectedEvent && selectedEvent.start > new Date() && selectedEvent.status === 'zakazan' && (
             <Button color="danger" onClick={handleCancelAppointment} disabled={isCancelling}>
               {isCancelling ? <Spinner size="sm" /> : "Otkaži termin"}
             </Button>
          )}
          <Button color="secondary" onClick={toggleModal}>
            Zatvori
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default CalendarClient;
import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Spinner,
} from "reactstrap";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import { toast } from "react-toastify";

const localizer = momentLocalizer(moment);

const CalendarTherapist = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false); 

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const token = localStorage.getItem("token");
  const Id = localStorage.getItem("userId"); 

  useEffect(() => {
    if (Id) {
      fetchAppointments();
    }
  }, [Id]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`http://localhost:5006/api/terapeuti/${Id}/termini`);
      
      const formattedEvents = res.data.map((termin, index) => {
        const start = new Date(termin.datum);
        const isBooked = termin.klijentIme && termin.klijentIme.trim() !== "";
        let eventStatus = "slobodan";
        let title = "Slobodan termin";

      if (isBooked) {
          if ((termin.status === "Zakazan" || termin.status === 0) && start < new Date()) {
             eventStatus = "zavrsen";
             title = `Završeno: ${termin.klijentIme}`;
          } else {
            switch (termin.status) {
              case "Zakazan":
              case 0: 
                eventStatus = "zakazan";
                title = `Zakazano: ${termin.klijentIme}`;
                break;
              case "OtkazanOdStraneKlijenta":
              case 1:
              case "OtkazanOdStraneTerapeuta":
              case 2:
                eventStatus = "otkazan";
                title = `OTKAZANO: ${termin.klijentIme}`;
                break;
              case "Zavrsen":
              case 3:
                eventStatus = "zavrsen";
                title = `Završeno: ${termin.klijentIme}`;
                break;
              default:
                eventStatus = "nepoznat";
                title = `Nepoznato: ${termin.klijentIme}`;
                break;
            }
          }
        }
        
        return {
          id: index,
          title: title,
          start: start,
          end: new Date(start.getTime() + 60 * 60000),
          status: eventStatus,
          clientName: isBooked ? termin.klijentIme : "",
          resource: termin,
        };
      });
      setEvents(formattedEvents);
    } catch (err) {
      toast.error("Greška pri učitavanju termina");
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);
  const toggleDeleteModal = () => setDeleteModalOpen(!toggleDeleteModal);
  const toggleViewModal = () => setViewModalOpen(!viewModalOpen);

  const handleAddAppointment = async () => {
    if (!date || !time) {
      toast.error("Popunite datum i vreme");
      return;
    }

    const startDate = new Date(`${date}T${time}`);
    if (startDate < new Date()) {
      toast.error("Ne možete dodati termin u prošlosti");
      return;
    }

    const noviTermin = {
      datum: startDate.toISOString(),
      klijentId: "", 
    };

    try {
      await axios.post(`http://localhost:5006/api/terapeuti/${Id}/termini`, noviTermin);
      toast.success("Termin uspešno dodat");
      fetchAppointments(); 
      toggleModal();
    } catch (err) {
      toast.error("Greška pri dodavanju termina");
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedEvent) return;
    
    if (selectedEvent.status !== "slobodan") {
      toast.error("Ne možete obrisati zakazani termin");
      toggleDeleteModal();
      return;
    }

    const terminZaBrisanje = selectedEvent.resource;

    try {
      await axios.delete(`http://localhost:5006/api/terapeuti/${Id}/termini`, {
        data: terminZaBrisanje,
      });

      toast.success("Termin obrisan");
      fetchAppointments();
      toggleDeleteModal();
    } catch (err) {
      toast.error("Greška pri brisanju termina");
    }
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
      toggleViewModal();
      fetchAppointments();
    } catch (error) {
      const errorMessage = error.response?.data || "Greška pri otkazivanju termina.";
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = "#4caf50";
    if (event.status === "zakazan") backgroundColor = "#ff6b6b"; 
    if (event.status === "otkazan") backgroundColor = "#848484"; 
    if (event.status === "zavrsen") backgroundColor = "#3498db";

    const style = {
      backgroundColor,
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
      paddingLeft: "5px",
    };
    return {style}
  };
  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);

    if (event.status === "slobodan") {
      setDeleteModalOpen(true);
    } else {
      setViewModalOpen(true);
    }
};

  return (
    <>
      <div>
        <Button className="ml-3 mt-7" color="primary" onClick={toggleModal}>
          Dodaj termin
        </Button>
      </div>

      <Calendar
        className="ml-3 mr-3"
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, marginTop: 20 }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
      />

      {/* dodavanje termina */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Novi termin</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="date">Datum</Label>
            <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label for="time">Vreme</Label>
            <Input
              type="select"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              <option value="">Izaberi vreme</option>
              {Array.from({ length: 12 }, (_, i) => { // 9 AM to 8 PM
                const hour = (i + 9).toString().padStart(2, "0");
                return (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00
                  </option>
                );
              })}
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddAppointment}>
            Sačuvaj
          </Button>{" "}
          <Button color="secondary" onClick={toggleModal}>
            Otkaži
          </Button>
        </ModalFooter>
      </Modal>

      {/* potvrda brisanja termina */}
      <Modal isOpen={deleteModalOpen} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal}>Obriši termin</ModalHeader>
        <ModalBody>
          Da li ste sigurni da želite da obrišete ovaj termin?
          <br />
          <strong>
            {selectedEvent
              ? `Termin: ${moment(selectedEvent.start).format("DD.MM.YYYY HH:mm")}`
              : ""}
          </strong>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDeleteAppointment}>
            Obriši
          </Button>{" "}
          <Button color="secondary" onClick={toggleDeleteModal}>
            Otkaži
          </Button>
        </ModalFooter>
      </Modal>

      {/* prikaz zakazanog termina */}
      <Modal isOpen={viewModalOpen} toggle={toggleViewModal}>
        <ModalHeader toggle={toggleViewModal}>Detalji zakazanog termina</ModalHeader>
        <ModalBody>
          {selectedEvent && (
            <>
              <p>
                <strong>Klijent:</strong> {selectedEvent.clientName}
              </p>
              <p>
                <strong>Datum:</strong>{" "}
                {moment(selectedEvent.start).format("dddd, DD.MM.YYYY.")}
              </p>
              <p>
                <strong>Vreme:</strong> {moment(selectedEvent.start).format("HH:mm")}
              </p>
              <p><strong>Status: </strong> 
                <span style={{textTransform: 'capitalize'}}>
                {selectedEvent.status}</span>
              </p>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {selectedEvent && selectedEvent.start > new Date() && 
           selectedEvent.resource.status==="Zakazan" &&(
            <Button color="danger" onClick={handleCancelAppointment} disabled={isCancelling}>
              {isCancelling ? <Spinner size="sm" /> : "Otkaži termin"}
            </Button>
          )}
          <Button color="secondary" onClick={toggleViewModal}>
            Zatvori
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CalendarTherapist;
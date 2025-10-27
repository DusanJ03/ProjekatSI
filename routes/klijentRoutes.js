import Dashboard from "views/examples/Dashboard.js";
import SviTerapeuti from "views/examples/SviTerapeuti";
import TherapistAvailableSlots from "views/examples/Kalendari/TherapistAvailableSlots";
import TherapistProfile from "views/examples/Terapeut/TherapistProfile.js";
import MyClientProfile from "views/examples/Klijent/MyClientProfile";
import CalendarClient from "views/examples/Kalendari/CalendarClient.js";

var klijentRoutes  = [
  {
    path: "/dashboard",
    name: "Početna",
    icon: "ni ni-shop text-primary",
    component: <Dashboard />, 
    layout: "/admin"
  },
  {
    path: "terapeuti/available-slots/:slug",
    name: "Slobodni termini",
    icon: "",  
    component: <TherapistAvailableSlots/>,
    layout: "/admin",
    hideInSidebar: true, 
  },
  {
    path: "/terapeuti/:slug",
    name: "Profil terapeuta",
    component: <TherapistProfile />, 
    layout: "/admin",
    hideInSidebar: true, 
  },
  {
    path: "/my-profile",
    name: "Moj profil",
    icon: "ni ni-single-02 text-yellow",
    component: <MyClientProfile />,
    layout: "/admin",
  },
  {
    path: "/kalendar-termina",
    name: "Moj kalendar",
    icon: "ni ni-calendar-grid-58 text-primary",
    component: <CalendarClient />,
    layout: "/admin",
  },
  {
    path: "/svi-terapeuti",
    name: "Svi terapeuti",
    icon: "ni ni-collection text-yellow",
    component: <SviTerapeuti/>,
    layout: "/admin",
  }
];

export default klijentRoutes;
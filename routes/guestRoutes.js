import Dashboard from "views/examples/Dashboard.js";
import RegisterClient from "views/examples/Klijent/RegisterClient.js";
import RegisterTherapist from "views/examples/Terapeut/RegisterTherapist.js";
import Login from "views/examples/Login.js";
import ChooseRegister from "views/examples/ChooseRegister.js";
import SviTerapeuti from "views/examples/SviTerapeuti";
import TherapistProfile from "views/examples/Terapeut/TherapistProfile.js";
import TherapistAvailableSlots from "views/examples/Kalendari/TherapistAvailableSlots"; 

var guestRoutes = [
  {
    path: "/dashboard",
    name: "Početna",
    icon: "ni ni-shop text-primary",
    component: <Dashboard />, 
    layout: "/admin"
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
    hideInSidebar: true, 
  },
  {
    path: "/register-client",
    name: "Registruj se kao klijent",
    icon: "ni ni-circle-08 text-yellow",
    component: <RegisterClient />,
    layout: "/auth",
  },
  {
    path: "/register-therapist",
    name: "Registruj se kao terapeut",
    icon: "ni ni-circle-08 text-primary",
    component: <RegisterTherapist />,
    layout: "/auth",
  },
  {
    path: "/choose-register",
    name: "Choose Register",
    icon: "",
    component: <ChooseRegister />,
    layout: "/auth",
    hideInSidebar: true, 
  },
  {
    path: "/svi-terapeuti",
    name: "Svi terapeuti",
    icon: "ni ni-collection text-yellow",  // primer ikone
    component: <SviTerapeuti/>,
    layout: "/admin",
  },
  {
    path: "/terapeuti/:slug",
    name: "Profil terapeuta",
    component: <TherapistProfile />, 
    layout: "/admin",
    hideInSidebar: true, 
  },
  {
    path: "/terapeuti/available-slots/:slug",
    name: "Slobodni termini",
    component: <TherapistAvailableSlots />,
    layout: "/admin",
    hideInSidebar: true,
  }
];
export default guestRoutes;

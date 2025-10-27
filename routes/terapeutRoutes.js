import Dashboard from "views/examples/Dashboard.js";
import CalendarTherapist from "views/examples/Kalendari/CalendarTherapist.js";
import MyTherapistProfile from "views/examples/Terapeut/MyTherapistProfile";
import EditTherapistProfile from "views/examples/Terapeut/EditTherapistProfile.js";
import SviTerapeuti from "views/examples/SviTerapeuti";
import TherapistProfile from "views/examples/Terapeut/TherapistProfile";

const terapeutRoutes = [
  {
    path: "/dashboard",
    name: "Početna",
    icon: "ni ni-shop text-primary",
    component: <Dashboard />, 
    layout: "/admin"
  },
  {
    path: "/kalendar-termina",
    name: "Kalendar termina",
    icon: "ni ni-calendar-grid-58 text-yellow",
    component: <CalendarTherapist />,
    layout: "/admin",
  },
  {
    path: "/my-profile",
    name: "Moj profil",
    icon: "ni ni-single-02 text-blue",
    component: <MyTherapistProfile />,
    layout: "/admin",
  },
  {
    path: "/edit-therapist-profile",
    name: "Edit Therapist Profile",
    icon: "ni ni-single-02 text-primary",
    component: <EditTherapistProfile/>,
    layout: "/admin",
    hideInSidebar: true,
  },
  {
    path: "/svi-terapeuti",
    name: "Svi terapeuti",
    icon: "ni ni-collection text-primary",
    component: <SviTerapeuti/>,
    layout: "/admin",
  },
  {
    path: "/terapeuti/:slug",
    name: "Profil terapeuta",
    component: <TherapistProfile />, 
    layout: "/admin",
    hideInSidebar: true, 
  }
];

export default terapeutRoutes;
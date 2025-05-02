import { lazy } from "react";

const Footer =  lazy(()=>import("@/components/Footer")) ;
const HeaderSection = lazy(()=>import("@/components/HeaderSection")) ;
const Admin_sidebar = lazy(()=>import("@/components/Admin.sidebar")) ;
const Not_found = lazy(()=>import("@/components/Not_found")) ;

export default {Footer,HeaderSection,Admin_sidebar,Not_found};



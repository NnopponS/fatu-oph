import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useActivities, useVenues } from "@/data/content";
import { realms, type RealmKey } from "@/lib/realms";

export function useGuardianRealm():RealmKey {
  const location=useLocation();const venues=useVenues();const activities=useActivities();
  const [chosen,setChosen]=useState(()=>sessionStorage.getItem("fatu_chosen_realm") || "azure-dragon");
  useEffect(()=>{function changed(){setChosen(sessionStorage.getItem("fatu_chosen_realm")||"azure-dragon");}window.addEventListener("fatu_realm_changed",changed);return()=>window.removeEventListener("fatu_realm_changed",changed);},[]);
  const venueId=location.pathname.startsWith("/venue/")?location.pathname.split("/")[2]:location.pathname.startsWith("/activity/")?activities.items.find(item=>item.id===location.pathname.split("/")[2]||item.slug===location.pathname.split("/")[2])?.venueId:undefined;
  const active=venues.items.find(item=>item.id===venueId)?.visualIdentityKey || chosen;
  return active in realms?active as RealmKey:"azure-dragon";
}

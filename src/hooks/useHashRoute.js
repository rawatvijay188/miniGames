import { useEffect, useState } from "react";

function getRoute() {
  return window.location.hash.replace(/^#\/?/, "") || "home";
}

export function useHashRoute() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

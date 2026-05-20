export function navigateTo(route) {
  window.location.hash = route === "home" ? "" : `/${route}`;
}

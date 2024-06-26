const { VITE_API_URL: apiUrl, VITE_ACCESS_KEY: accessKey } = import.meta.env;

async function fetchUsers() {
  const url = `${apiUrl}?key=1b4b1f7c3e5444808593a860ac283ef9`;
  try {
    const response = await fetch(url);
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

// Llamar a la función y manejar la promesa correctamente
fetchUsers().then(result => console.log(result));

export { fetchUsers };

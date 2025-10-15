const URL_API = "http://www.raydelto.org/agenda.php";

// Elementos del DOM
const formulario = document.getElementById("formularioContacto");
const listaContactos = document.getElementById("listaContactos");
const mensajeFormulario = document.getElementById("mensajeFormulario");
const botonAgregar = document.getElementById("botonAgregar");
const buscador = document.getElementById("buscador");
const contadorContactos = document.getElementById("contadorContactos");

let todosLosContactos = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarContactos();
});

function mostrarSeccion(seccion) {
  const seccionAgregar = document.getElementById("seccionAgregar");
  const seccionLista = document.getElementById("seccionLista");

  seccionAgregar.classList.remove("activa");
  seccionLista.classList.remove("activa");

  if (seccion === "agregar") {
    seccionAgregar.classList.add("activa");
  } else if (seccion === "lista") {
    seccionLista.classList.add("activa");
    cargarContactos();
  }
}

async function cargarContactos() {
  listaContactos.innerHTML =
    '<div class="cargando">Cargando contactos...</div>';

  try {
    const timestamp = new Date().getTime();
    const respuesta = await fetch(`${URL_API}?t=${timestamp}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
    }

    const contactos = await respuesta.json();
    todosLosContactos = contactos;
    mostrarContactos(contactos);
  } catch (error) {
    listaContactos.innerHTML = `<div class="mensaje mensaje-error">Error al cargar contactos: ${error.message}</div>`;
  }
}

function mostrarContactos(contactos) {
  if (!contactos || contactos.length === 0) {
    listaContactos.innerHTML =
      '<div class="sin-contactos">No hay contactos registrados aún. ¡Agrega tu primer contacto!</div>';
    contadorContactos.textContent = "(0 contactos)";
    return;
  }

  contadorContactos.textContent = `(${contactos.length} contactos)`;

  let htmlContactos = '<div class="lista-contactos">';

  contactos.forEach((contacto) => {
    htmlContactos += `
                    <div class="contacto">
                        <div class="contacto-nombre">${contacto.nombre} ${contacto.apellido}</div>
                        <div class="contacto-telefono">${contacto.telefono}</div>
                    </div>
                `;
  });

  htmlContactos += "</div>";
  listaContactos.innerHTML = htmlContactos;
}

buscador.addEventListener("input", (e) => {
  const textoBusqueda = e.target.value.toLowerCase();

  if (textoBusqueda === "") {
    mostrarContactos(todosLosContactos);
    return;
  }

  const contactosFiltrados = todosLosContactos.filter((contacto) => {
    const nombreCompleto =
      `${contacto.nombre} ${contacto.apellido}`.toLowerCase();
    const telefono = contacto.telefono.toLowerCase();

    return (
      nombreCompleto.includes(textoBusqueda) || telefono.includes(textoBusqueda)
    );
  });

  mostrarContactos(contactosFiltrados);
});

function mostrarMensaje(texto, tipo) {
  const clase = tipo === "exito" ? "mensaje-exito" : "mensaje-error";
  mensajeFormulario.innerHTML = `<div class="mensaje ${clase}">${texto}</div>`;

  setTimeout(() => {
    mensajeFormulario.innerHTML = "";
  }, 4000);
}

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  if (!nombre || !apellido || !telefono) {
    mostrarMensaje("Por favor completa todos los campos", "error");
    return;
  }

  botonAgregar.disabled = true;
  botonAgregar.textContent = "Agregando...";

  try {
    const respuesta = await fetch(URL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombre,
        apellido: apellido,
        telefono: telefono,
      }),
    });

    if (!respuesta.ok) {
      throw new Error("Error al agregar el contacto");
    }

    mostrarMensaje(
      'Contacto agregado exitosamente. Ve a "Ver Lista" para verlo.',
      "exito"
    );
    formulario.reset();
  } catch (error) {
    mostrarMensaje(`Error al agregar contacto: ${error.message}`, "error");
  } finally {
    botonAgregar.disabled = false;
    botonAgregar.textContent = "Agregar Contacto";
  }
});

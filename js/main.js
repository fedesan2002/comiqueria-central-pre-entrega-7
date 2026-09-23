const NOMBRE_TIENDA = "Comiquería Central";

let carrito = [];
let categoriaSeleccionada = "Todos";
let textoBusqueda = "";

let productosGrid;
let mensajeBusqueda;
let mensajeEstado;
let categoriaFiltro;
let buscarInput;
let buscarBtn;
let formularioProducto;
let nombreProducto;
let precioProducto;
let categoriaProducto;
let stockProducto;
let cantidadCarrito;
let carritoContenido;
let totalCarrito;
let carritoPanel;
let carritoOverlay;


const calcularSubtotal = (cantidad, precio) => cantidad * precio;


function calcularDescuento(cantidad, subtotal) {
    if (cantidad >= 3) {
        return subtotal * 0.10;
    }

    if (cantidad === 2) {
        return subtotal * 0.05;
    }

    return 0;
}


function escaparHTML(valor) {
    const elementoTemporal = document.createElement("div");
    elementoTemporal.textContent = valor;

    return elementoTemporal.innerHTML;
}


function seleccionarElementosDOM() {
    productosGrid = document.getElementById("productosGrid");
    mensajeBusqueda = document.getElementById("mensajeBusqueda");
    mensajeEstado = document.getElementById("mensajeEstado");
    categoriaFiltro = document.getElementById("categoriaFiltro");
    buscarInput = document.getElementById("buscarInput");
    buscarBtn = document.getElementById("buscarBtn");
    formularioProducto = document.querySelector("#formularioProducto");
    nombreProducto = document.getElementById("nombreProducto");
    precioProducto = document.getElementById("precioProducto");
    categoriaProducto = document.getElementById("categoriaProducto");
    stockProducto = document.getElementById("stockProducto");
    cantidadCarrito = document.getElementById("cantidadCarrito");
    carritoContenido = document.getElementById("carritoContenido");
    totalCarrito = document.getElementById("totalCarrito");
    carritoPanel = document.getElementById("carritoPanel");
    carritoOverlay = document.getElementById("carritoOverlay");
}


function mostrarMensaje(texto, tipo = "ok") {
    mensajeEstado.textContent = texto;
    mensajeEstado.className = "status-message " + tipo;
}


function obtenerProductosVisibles() {
    const productosPorCategoria = filtrarProductosPorCategoria(
        categoriaSeleccionada
    );

    return filtrarProductosPorTexto(textoBusqueda, productosPorCategoria);
}


function renderizarCatalogo(lista = obtenerProductosVisibles()) {
    if (lista.length === 0) {
        productosGrid.innerHTML = `
            <p class="empty-catalog">
                No encontramos títulos con esos filtros.
            </p>
        `;

        return;
    }

    productosGrid.innerHTML = lista.map(function (producto) {
        const indicePortada = (producto.id - 1) % 6;
        const sinStock = producto.stock === 0;
        const nombreSeguro = escaparHTML(producto.nombre);
        const categoriaSegura = escaparHTML(producto.categoria);

        return `
            <article class="product-card" id="producto-${producto.id}">
                <div class="product-cover cover-${indicePortada}">
                    <span>${nombreSeguro}</span>
                </div>

                <div class="product-info">
                    <span class="product-category">${categoriaSegura}</span>
                    <h3>${nombreSeguro}</h3>
                    <p class="price">${formatearPrecio(producto.precio)}</p>
                    <p class="stock-text">Stock disponible: ${producto.stock}</p>

                    <div class="product-actions">
                        <button
                            class="add-cart-btn"
                            type="button"
                            data-accion="agregar-carrito"
                            data-id="${producto.id}"
                            ${sinStock ? "disabled" : ""}
                        >
                            ${sinStock ? "Sin stock" : "Agregar al carrito"}
                        </button>

                        <button
                            class="delete-product-btn"
                            type="button"
                            data-accion="eliminar-producto"
                            data-id="${producto.id}"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}


function actualizarResumenCatalogo(lista) {
    const filtrosActivos =
        categoriaSeleccionada !== "Todos" || textoBusqueda !== "";

    if (lista.length === 0) {
        mensajeBusqueda.textContent =
            "No hay títulos que coincidan con la búsqueda.";
        mensajeBusqueda.className = "search-message error";
        return;
    }

    const palabra = lista.length === 1 ? "título" : "títulos";
    const detalleFiltro = filtrosActivos
        ? " que coinciden con los filtros actuales."
        : " disponibles en el catálogo.";

    mensajeBusqueda.textContent =
        "Mostrando " + lista.length + " " + palabra + detalleFiltro;
    mensajeBusqueda.className = "search-message ok";
}


function actualizarVistaCatalogo() {
    const listaVisible = obtenerProductosVisibles();

    renderizarCatalogo(listaVisible);
    actualizarResumenCatalogo(listaVisible);
}


function contarProducto(idProducto) {
    return carrito.filter(function (productoDelCarrito) {
        return productoDelCarrito === idProducto;
    }).length;
}


function obtenerProductosUnicosDelCarrito() {
    return carrito.filter(function (idProducto, indice) {
        return carrito.indexOf(idProducto) === indice;
    });
}


function calcularTotalCarrito() {
    return carrito.reduce(function (total, idProducto) {
        const producto = obtenerProductoPorId(idProducto);

        return producto === null ? total : total + producto.precio;
    }, 0);
}


function renderizarCarrito() {
    cantidadCarrito.textContent = carrito.length;
    totalCarrito.textContent = formatearPrecio(calcularTotalCarrito());

    if (carrito.length === 0) {
        carritoContenido.innerHTML = `
            <p class="empty-cart">
                Todavía no agregaste ningún producto.
            </p>
        `;

        return;
    }

    const productosUnicos = obtenerProductosUnicosDelCarrito();

    carritoContenido.innerHTML = productosUnicos.map(function (idProducto) {
        const producto = obtenerProductoPorId(idProducto);

        if (producto === null) {
            return "";
        }

        const cantidad = contarProducto(idProducto);
        const subtotal = calcularSubtotal(cantidad, producto.precio);
        const nombreSeguro = escaparHTML(producto.nombre);

        return `
            <article class="cart-item">
                <div>
                    <h3>${nombreSeguro}</h3>
                    <p class="cart-item-price">
                        ${formatearPrecio(producto.precio)} c/u
                    </p>
                    <p class="cart-item-price">
                        Stock disponible: ${producto.stock}
                    </p>
                </div>

                <strong class="cart-subtotal">
                    ${formatearPrecio(subtotal)}
                </strong>

                <div class="cart-item-controls">
                    <button
                        class="quantity-btn"
                        type="button"
                        data-accion="quitar-unidad"
                        data-id="${producto.id}"
                        aria-label="Quitar una unidad de ${nombreSeguro}"
                    >
                        −
                    </button>

                    <span class="quantity">${cantidad}</span>

                    <button
                        class="quantity-btn"
                        type="button"
                        data-accion="agregar-carrito"
                        data-id="${producto.id}"
                        ${producto.stock === 0 ? "disabled" : ""}
                        aria-label="Agregar una unidad de ${nombreSeguro}"
                    >
                        +
                    </button>

                    <button
                        class="remove-btn"
                        type="button"
                        data-accion="eliminar-carrito"
                        data-id="${producto.id}"
                    >
                        Quitar todo
                    </button>
                </div>
            </article>
        `;
    }).join("");
}


function agregarAlCarrito(idProducto) {
    const producto = obtenerProductoPorId(idProducto);

    if (producto === null) {
        mostrarMensaje("No se encontró el producto seleccionado.", "error");
        return;
    }

    const resultadoVenta = producto.vender(1);

    if (!resultadoVenta.exito) {
        mostrarMensaje(resultadoVenta.mensaje, "warning");
        return;
    }

    carrito.push(producto.id);

    actualizarVistaCatalogo();
    renderizarCarrito();
    mostrarMensaje(resultadoVenta.mensaje, "ok");
}


function quitarUnaUnidad(idProducto) {
    const posicion = carrito.indexOf(idProducto);

    if (posicion === -1) {
        return;
    }

    carrito.splice(posicion, 1);

    const producto = obtenerProductoPorId(idProducto);

    if (producto !== null) {
        producto.reponer(1);
        mostrarMensaje(
            "Se quitó una unidad de " + producto.nombre + " del carrito.",
            "ok"
        );
    }

    actualizarVistaCatalogo();
    renderizarCarrito();
}


function eliminarProductoDelCarrito(idProducto) {
    const cantidadEliminada = contarProducto(idProducto);

    if (cantidadEliminada === 0) {
        return;
    }

    carrito = carrito.filter(function (productoDelCarrito) {
        return productoDelCarrito !== idProducto;
    });

    const producto = obtenerProductoPorId(idProducto);

    if (producto !== null) {
        producto.reponer(cantidadEliminada);
        mostrarMensaje(
            "Se quitaron " + cantidadEliminada + " unidad(es) de " +
            producto.nombre + " del carrito.",
            "ok"
        );
    }

    actualizarVistaCatalogo();
    renderizarCarrito();
}


function eliminarProductoDelCatalogo(idProducto) {
    const posicion = catalogo.findIndex(function (producto) {
        return producto.id === idProducto;
    });

    if (posicion === -1) {
        mostrarMensaje("El producto ya no se encuentra en el catálogo.", "error");
        return;
    }

    const producto = catalogo[posicion];
    const unidadesEnCarrito = contarProducto(idProducto);

    carrito = carrito.filter(function (productoDelCarrito) {
        return productoDelCarrito !== idProducto;
    });

    catalogo.splice(posicion, 1);

    actualizarVistaCatalogo();
    renderizarCarrito();

    const detalleCarrito = unidadesEnCarrito > 0
        ? " También se quitaron sus unidades del carrito."
        : "";

    mostrarMensaje(
        producto.nombre + " se eliminó del catálogo." + detalleCarrito,
        "warning"
    );
}


function devolverProductosAlStock() {
    carrito.forEach(function (idProducto) {
        const producto = obtenerProductoPorId(idProducto);

        if (producto !== null) {
            producto.reponer(1);
        }
    });
}


function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarMensaje("El carrito ya está vacío.", "warning");
        return;
    }

    devolverProductosAlStock();
    carrito = [];

    actualizarVistaCatalogo();
    renderizarCarrito();
    mostrarMensaje("El carrito se vació y el stock fue restaurado.", "ok");
}


function finalizarCompra() {
    if (carrito.length === 0) {
        mostrarMensaje(
            "Agregá al menos un producto antes de finalizar la compra.",
            "warning"
        );
        return;
    }

    const cantidadProductos = carrito.length;
    const total = calcularTotalCarrito();
    const descuento = calcularDescuento(cantidadProductos, total);
    const totalFinal = total - descuento;

    carrito = [];

    renderizarCarrito();
    cerrarCarrito();
    mostrarMensaje(
        "Compra simulada en " + NOMBRE_TIENDA + ": " +
        cantidadProductos + " producto(s), total " +
        formatearPrecio(totalFinal) + ".",
        "ok"
    );
}


function abrirCarrito() {
    carritoPanel.classList.add("open");
    carritoOverlay.classList.add("visible");
    carritoPanel.setAttribute("aria-hidden", "false");
    carritoOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
}


function cerrarCarrito() {
    carritoPanel.classList.remove("open");
    carritoOverlay.classList.remove("visible");
    carritoPanel.setAttribute("aria-hidden", "true");
    carritoOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
}


function actualizarBusquedaDesdeInput() {
    textoBusqueda = buscarInput.value.trim();
    actualizarVistaCatalogo();
}


function buscarDesdeWeb() {
    actualizarBusquedaDesdeInput();

    if (textoBusqueda === "") {
        mostrarMensaje("Mostrando todo el catálogo.", "ok");
        return;
    }

    const coincidencias = obtenerProductosVisibles().length;

    if (coincidencias === 0) {
        mostrarMensaje(
            "No encontramos títulos para “" + textoBusqueda + "”.",
            "warning"
        );
        return;
    }

    mostrarMensaje(
        "Encontramos " + coincidencias + " resultado(s) para “" +
        textoBusqueda + "”.",
        "ok"
    );
}


function agregarProductoDesdeFormulario(evento) {
    evento.preventDefault();

    const nombre = nombreProducto.value.trim();
    const precio = Number(precioProducto.value);
    const categoria = categoriaProducto.value;
    const stock = Number(stockProducto.value);

    if (nombre.length < 2) {
        mostrarMensaje(
            "Escribí un nombre de al menos 2 caracteres para el título.",
            "error"
        );
        nombreProducto.focus();
        return;
    }

    if (!Number.isFinite(precio) || precio <= 0) {
        mostrarMensaje("Ingresá un precio válido mayor a 0.", "error");
        precioProducto.focus();
        return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
        mostrarMensaje(
            "El stock debe ser un número entero igual o mayor a 0.",
            "error"
        );
        stockProducto.focus();
        return;
    }

    const existeNombre = catalogo.some(function (producto) {
        return normalizarTexto(producto.nombre) === normalizarTexto(nombre);
    });

    if (existeNombre) {
        mostrarMensaje(
            "Ya existe un título con ese nombre en el catálogo.",
            "warning"
        );
        nombreProducto.focus();
        return;
    }

    const nuevoProducto = new Producto(
        obtenerSiguienteId(),
        nombre,
        precio,
        categoria,
        stock
    );

    catalogo.push(nuevoProducto);
    formularioProducto.reset();
    categoriaSeleccionada = "Todos";
    categoriaFiltro.value = "Todos";
    textoBusqueda = "";
    buscarInput.value = "";

    actualizarVistaCatalogo();
    mostrarMensaje(
        nombre + " se agregó al catálogo correctamente.",
        "ok"
    );
    nombreProducto.focus();
}


function manejarAccionesCatalogo(evento) {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton || !productosGrid.contains(boton)) {
        return;
    }

    const idProducto = Number(boton.dataset.id);

    if (boton.dataset.accion === "agregar-carrito") {
        agregarAlCarrito(idProducto);
    }

    if (boton.dataset.accion === "eliminar-producto") {
        eliminarProductoDelCatalogo(idProducto);
    }
}


function manejarAccionesCarrito(evento) {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton || !carritoContenido.contains(boton)) {
        return;
    }

    const idProducto = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    if (accion === "agregar-carrito") {
        agregarAlCarrito(idProducto);
    }

    if (accion === "quitar-unidad") {
        quitarUnaUnidad(idProducto);
    }

    if (accion === "eliminar-carrito") {
        eliminarProductoDelCarrito(idProducto);
    }
}


function registrarEventos() {
    buscarBtn.addEventListener("click", buscarDesdeWeb);

    buscarInput.addEventListener("keyup", actualizarBusquedaDesdeInput);

    buscarInput.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            buscarInput.value = "";
            actualizarBusquedaDesdeInput();
            mostrarMensaje("Se limpió la búsqueda.", "ok");
        }
    });

    categoriaFiltro.addEventListener("change", function () {
        categoriaSeleccionada = categoriaFiltro.value;
        actualizarVistaCatalogo();

        const mensaje = categoriaSeleccionada === "Todos"
            ? "Se muestran todas las categorías."
            : "Filtro aplicado: " + categoriaSeleccionada + ".";

        mostrarMensaje(mensaje, "ok");
    });

    formularioProducto.addEventListener("submit", agregarProductoDesdeFormulario);
    productosGrid.addEventListener("click", manejarAccionesCatalogo);
    carritoContenido.addEventListener("click", manejarAccionesCarrito);

    document
        .getElementById("abrirCarritoBtn")
        .addEventListener("click", abrirCarrito);

    document
        .getElementById("navCarritoBtn")
        .addEventListener("click", abrirCarrito);

    document
        .getElementById("cerrarCarritoBtn")
        .addEventListener("click", cerrarCarrito);

    carritoOverlay.addEventListener("click", cerrarCarrito);

    document
        .getElementById("vaciarCarritoBtn")
        .addEventListener("click", vaciarCarrito);

    document
        .getElementById("finalizarCompraBtn")
        .addEventListener("click", finalizarCompra);
}


function iniciarAplicacion() {
    seleccionarElementosDOM();
    actualizarVistaCatalogo();
    renderizarCarrito();
    registrarEventos();
}


document.addEventListener("DOMContentLoaded", iniciarAplicacion);

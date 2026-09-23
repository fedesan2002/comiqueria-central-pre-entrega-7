class Producto {
    constructor(id, nombre, precio, categoria, stock) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.stock = stock;
    }

    vender(cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return {
                exito: false,
                mensaje: "La cantidad debe ser un número entero mayor a 0."
            };
        }

        if (cantidad > this.stock) {
            return {
                exito: false,
                mensaje: "No hay stock suficiente de " + this.nombre + "."
            };
        }

        this.stock -= cantidad;

        return {
            exito: true,
            mensaje:
                "Se agregaron " + cantidad + " unidad(es) de " +
                this.nombre + " al carrito."
        };
    }

    reponer(cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return {
                exito: false,
                mensaje: "La cantidad a reponer debe ser mayor a 0."
            };
        }

        this.stock += cantidad;

        return {
            exito: true,
            mensaje:
                "Se repusieron " + cantidad + " unidad(es) de " +
                this.nombre + "."
        };
    }
}


const productosIniciales = [
    {
        id: 1,
        nombre: "Batman",
        precio: 8500,
        categoria: "Cómic",
        stock: 6
    },
    {
        id: 2,
        nombre: "Spider-Man",
        precio: 9000,
        categoria: "Cómic",
        stock: 5
    },
    {
        id: 3,
        nombre: "Jujutsu Kaisen",
        precio: 7500,
        categoria: "Manga",
        stock: 8
    },
    {
        id: 4,
        nombre: "Vinland Saga",
        precio: 11000,
        categoria: "Manga",
        stock: 4
    },
    {
        id: 5,
        nombre: "One Piece",
        precio: 7200,
        categoria: "Manga",
        stock: 10
    },
    {
        id: 6,
        nombre: "Kagurabachi",
        precio: 7800,
        categoria: "Manga",
        stock: 7
    },
    {
        id: 7,
        nombre: "Dandadan",
        precio: 7600,
        categoria: "Manga",
        stock: 5
    },
    {
        id: 8,
        nombre: "Daredevil",
        precio: 12000,
        categoria: "Cómic",
        stock: 3
    },
    {
        id: 9,
        nombre: "Chainsaw Man",
        precio: 7900,
        categoria: "Manga",
        stock: 6
    }
];


const catalogo = productosIniciales.map(function (datosProducto) {
    return new Producto(
        datosProducto.id,
        datosProducto.nombre,
        datosProducto.precio,
        datosProducto.categoria,
        datosProducto.stock
    );
});


function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-AR");
}


function normalizarTexto(texto) {
    return String(texto).trim().toLocaleLowerCase("es");
}


function filtrarProductosPorCategoria(categoria, lista = catalogo) {
    return lista.filter(function (producto) {
        return categoria === "Todos" || producto.categoria === categoria;
    });
}


function filtrarProductosPorTexto(texto, lista = catalogo) {
    const busqueda = normalizarTexto(texto);

    if (busqueda === "") {
        return lista;
    }

    return lista.filter(function (producto) {
        return normalizarTexto(producto.nombre).includes(busqueda);
    });
}


function obtenerProductoPorId(idProducto) {
    const productoEncontrado = catalogo.find(function (producto) {
        return producto.id === idProducto;
    });

    return productoEncontrado || null;
}


function obtenerSiguienteId() {
    const ultimoId = catalogo.reduce(function (mayorId, producto) {
        return Math.max(mayorId, producto.id);
    }, 0);

    return ultimoId + 1;
}

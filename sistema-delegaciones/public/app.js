// Variables globales
let paginaActual = 1;
const elementosPorPagina = 50;
let filtrosActivos = {};
const socket = io();

// Tipos de institución
const tiposInstitucion = ['Hospital', 'Centro de Salud', 'Jurisdicción', 'Clínica', 'Centro Comunitario', 'Otros'];

// Colores para badges
const coloresTipo = {
    'Hospital': '#dc3545',
    'Centro de Salud': '#28a745',
    'Jurisdicción': '#007bff',
    'Clínica': '#ffc107',
    'Centro Comunitario': '#17a2b8',
    'Otros': '#6c757d'
};

// ============= INICIALIZACIÓN =============
document.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticas();
    cargarPersonas();
    crearBotonesDelegaciones();
    crearBotonesTipos();
    agregarEventosListen();
});

// ============= ESCUCHAR CAMBIOS EN TIEMPO REAL =============
socket.on('persona-nueva', (datos) => {
    mostrarNotificacion('Nueva persona agregada: ' + datos.nombre, 'success');
    cargarPersonas();
});

socket.on('persona-actualizada', (datos) => {
    mostrarNotificacion('Persona actualizada: ' + datos.nombre, 'success');
    cargarPersonas();
});

socket.on('persona-eliminada', (datos) => {
    mostrarNotificacion('Persona eliminada', 'warning');
    cargarPersonas();
});

socket.on('datos-importados', (datos) => {
    mostrarNotificacion(`${datos.insertados} registros importados de ${datos.total}`, 'success');
    cargarPersonas();
    cargarEstadisticas();
});

socket.on('disconnect', () => {
    document.getElementById('estado-conexion').textContent = 'Desconectado';
    document.querySelector('.conectado').style.background = '#dc3545';
});

socket.on('connect', () => {
    document.getElementById('estado-conexion').textContent = 'Conectado';
    document.querySelector('.conectado').style.background = '#28a745';
});

// ============= CARGAR ESTADÍSTICAS =============
async function cargarEstadisticas() {
    try {
        const response = await fetch('/api/estadisticas');
        const data = await response.json();

        if (data.success) {
            let html = `
                <div class="stat-card">
                    <h6>Total de Personas</h6>
                    <div class="numero">${data.total}</div>
                </div>
            `;

            data.porTipo.forEach(item => {
                html += `
                    <div class="stat-card">
                        <h6>${item.tipo_institucion}</h6>
                        <div class="numero">${item.cantidad}</div>
                    </div>
                `;
            });

            document.getElementById('estadisticas-container').innerHTML = html;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ============= CARGAR PERSONAS =============
async function cargarPersonas(pagina = 1) {
    try {
        let query = `/api/personas?pagina=${pagina}&limite=${elementosPorPagina}`;

        if (filtrosActivos.curp) query += `&curp=${filtrosActivos.curp}`;
        if (filtrosActivos.rfc) query += `&rfc=${filtrosActivos.rfc}`;
        if (filtrosActivos.numero_empleado) query += `&numero_empleado=${filtrosActivos.numero_empleado}`;
        if (filtrosActivos.nombre) query += `&nombre=${filtrosActivos.nombre}`;
        if (filtrosActivos.delegacion) query += `&delegacion=${filtrosActivos.delegacion}`;
        if (filtrosActivos.tipo_institucion) query += `&tipo_institucion=${filtrosActivos.tipo_institucion}`;

        const response = await fetch(query);
        const data = await response.json();

        if (data.success) {
            renderizarTabla(data.datos);
            renderizarPaginacion(data.totalPaginas, pagina);
            paginaActual = pagina;
        } else {
            mostrarNotificacion('Error cargando datos', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error en la conexión', 'error');
    }
}

// ============= RENDERIZAR TABLA =============
function renderizarTabla(personas) {
    if (personas.length === 0) {
        document.getElementById('tabla-personas').innerHTML = `
            <tr>
                <td colspan="9" class="text-center p-4">
                    <i class="fas fa-inbox" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                    <p style="color: #999;">No hay datos que mostrar</p>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    personas.forEach(persona => {
        const color = coloresTipo[persona.tipo_institucion] || '#6c757d';
        const estadoBadge = persona.estado === 'activo' 
            ? '<span class="badge" style="background: #28a745;">Activo</span>' 
            : '<span class="badge" style="background: #dc3545;">Inactivo</span>';

        html += `
            <tr>
                <td><code>${persona.curp}</code></td>
                <td>${persona.rfc || '-'}</td>
                <td>${persona.numero_empleado || '-'}</td>
                <td>${persona.nombre} ${persona.apellido_paterno || ''} ${persona.apellido_materno || ''}</td>
                <td>${persona.delegacion || '-'}</td>
                <td><span class="badge" style="background: ${color};">${persona.tipo_institucion}</span></td>
                <td>${persona.correo || '-'}</td>
                <td>${estadoBadge}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editarPersona(${persona.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarPersona(${persona.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById('tabla-personas').innerHTML = html;
}

// ============= RENDERIZAR PAGINACIÓN =============
function renderizarPaginacion(totalPaginas, paginaActual) {
    let html = '';

    if (paginaActual > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarPersonas(1)">Primera</a></li>`;
        html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarPersonas(${paginaActual - 1})">Anterior</a></li>`;
    }

    for (let i = Math.max(1, paginaActual - 2); i <= Math.min(totalPaginas, paginaActual + 2); i++) {
        html += `
            <li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cargarPersonas(${i})">${i}</a>
            </li>
        `;
    }

    if (paginaActual < totalPaginas) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarPersonas(${paginaActual + 1})">Siguiente</a></li>`;
        html += `<li class="page-item"><a class="page-link" href="#" onclick="cargarPersonas(${totalPaginas})">Última</a></li>`;
    }

    document.getElementById('paginacion').innerHTML = html;
}

// ============= CREAR BOTONES DE DELEGACIONES =============
function crearBotonesDelegaciones() {
    const delegaciones = ['CDMX', 'Jalisco', 'Monterrey', 'Guadalajara', 'Puebla', 'Cancún', 'Mérida'];
    let html = '';

    delegaciones.forEach(delegacion => {
        html += `
            <button class="btn btn-filter" onclick="filtrarPor('delegacion', '${delegacion}', this)">
                ${delegacion}
            </button>
        `;
    });

    document.getElementById('delegaciones-container').innerHTML = html;
}

// ============= CREAR BOTONES DE TIPOS =============
function crearBotonesTipos() {
    let html = '';

    tiposInstitucion.forEach(tipo => {
        html += `
            <button class="btn btn-filter" onclick="filtrarPor('tipo_institucion', '${tipo}', this)">
                ${tipo}
            </button>
        `;
    });

    document.getElementById('tipos-container').innerHTML = html;
}

// ============= FILTRAR POR =============
function filtrarPor(campo, valor, elemento) {
    elemento.classList.toggle('active');

    if (elemento.classList.contains('active')) {
        filtrosActivos[campo] = valor;
    } else {
        delete filtrosActivos[campo];
    }

    cargarPersonas(1);
}

// ============= AGREGAR EVENTOS DE ESCUCHA =============
function agregarEventosListen() {
    document.getElementById('buscar-curp').addEventListener('keyup', () => {
        filtrosActivos.curp = document.getElementById('buscar-curp').value;
        cargarPersonas(1);
    });

    document.getElementById('buscar-rfc').addEventListener('keyup', () => {
        filtrosActivos.rfc = document.getElementById('buscar-rfc').value;
        cargarPersonas(1);
    });

    document.getElementById('buscar-numero').addEventListener('keyup', () => {
        filtrosActivos.numero_empleado = document.getElementById('buscar-numero').value;
        cargarPersonas(1);
    });

    document.getElementById('buscar-nombre').addEventListener('keyup', () => {
        filtrosActivos.nombre = document.getElementById('buscar-nombre').value;
        cargarPersonas(1);
    });

    document.getElementById('limpiar-filtros').addEventListener('click', () => {
        filtrosActivos = {};
        document.getElementById('buscar-curp').value = '';
        document.getElementById('buscar-rfc').value = '';
        document.getElementById('buscar-numero').value = '';
        document.getElementById('buscar-nombre').value = '';
        document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
        cargarPersonas(1);
    });
}

// ============= GUARDAR PERSONA =============
async function guardarPersona() {
    const datos = {
        curp: document.getElementById('curp').value.toUpperCase(),
        rfc: document.getElementById('rfc').value.toUpperCase(),
        numero_empleado: document.getElementById('numero_empleado').value,
        nombre: document.getElementById('nombre').value,
        apellido_paterno: document.getElementById('apellido_paterno').value,
        apellido_materno: document.getElementById('apellido_materno').value,
        delegacion: document.getElementById('delegacion').value,
        tipo_institucion: document.getElementById('tipo_institucion').value,
        correo: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        creado_por: 'usuario'
    };

    if (!datos.curp || !datos.nombre || !datos.tipo_institucion) {
        mostrarNotificacion('Completa todos los campos obligatorios', 'error');
        return;
    }

    try {
        const response = await fetch('/api/personas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const result = await response.json();

        if (result.success) {
            mostrarNotificacion('Persona agregada exitosamente', 'success');
            document.getElementById('formulario-agregar').reset();
            bootstrap.Modal.getInstance(document.getElementById('modalAgregar')).hide();
            cargarPersonas();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(result.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al guardar', 'error');
    }
}

// ============= EDITAR PERSONA =============
async function editarPersona(id) {
    try {
        const response = await fetch(`/api/personas/${id}`);
        const data = await response.json();

        if (data.success) {
            const p = data.datos;
            document.getElementById('editar-id').value = id;
            document.getElementById('editar-curp').value = p.curp;
            document.getElementById('editar-nombre').value = p.nombre;
            document.getElementById('editar-apellido-paterno').value = p.apellido_paterno || '';
            document.getElementById('editar-delegacion').value = p.delegacion || '';
            document.getElementById('editar-tipo').value = p.tipo_institucion;
            document.getElementById('editar-correo').value = p.correo || '';
            document.getElementById('editar-telefono').value = p.telefono || '';
            document.getElementById('editar-estado').value = p.estado;

            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditar')).show();
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar datos', 'error');
    }
}

// ============= GUARDAR EDICIÓN =============
async function guardarEdicion() {
    const id = document.getElementById('editar-id').value;
    const datos = {
        nombre: document.getElementById('editar-nombre').value,
        apellido_paterno: document.getElementById('editar-apellido-paterno').value,
        delegacion: document.getElementById('editar-delegacion').value,
        tipo_institucion: document.getElementById('editar-tipo').value,
        correo: document.getElementById('editar-correo').value,
        telefono: document.getElementById('editar-telefono').value,
        estado: document.getElementById('editar-estado').value,
        actualizado_por: 'usuario'
    };

    try {
        const response = await fetch(`/api/personas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const result = await response.json();

        if (result.success) {
            mostrarNotificacion('Persona actualizada exitosamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
            cargarPersonas();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(result.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al actualizar', 'error');
    }
}

// ============= ELIMINAR PERSONA =============
async function eliminarPersona(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta persona?')) return;

    try {
        const response = await fetch(`/api/personas/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eliminado_por: 'usuario' })
        });

        const result = await response.json();

        if (result.success) {
            mostrarNotificacion('Persona eliminada exitosamente', 'success');
            cargarPersonas();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(result.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al eliminar', 'error');
    }
}

// ============= IMPORTAR EXCEL =============
async function importarExcel() {
    const archivo = document.getElementById('archivo-excel').files[0];

    if (!archivo) {
        mostrarNotificacion('Selecciona un archivo', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
        const response = await fetch('/api/importar-excel', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            mostrarNotificacion(`${result.insertados} registros importados exitosamente`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalImportar')).hide();
            document.getElementById('archivo-excel').value = '';
            cargarPersonas();
            cargarEstadisticas();
        } else {
            mostrarNotificacion('Error al importar: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error en la importación', 'error');
    }
}

// ============= MOSTRAR NOTIFICACIÓN =============
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    
    let icono = '✅';
    if (tipo === 'error') icono = '❌';
    if (tipo === 'warning') icono = '⚠️';

    notificacion.innerHTML = `${icono} ${mensaje}`;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

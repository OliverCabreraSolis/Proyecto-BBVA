# 🏦 BBVA Perú — Home Banking

Proyecto académico que simula el portal de Banca por Internet del BBVA Perú.
Desarrollado para el curso de Desarrollo de Aplicaciones Web — Semana 9.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite |
| Backend | Django + Django REST Framework |
| Base de datos | PostgreSQL (Supabase) |
| Autenticación | JWT (SimpleJWT) |
| Estilos | CSS Modules + Heroicons |

---

## 📁 Estructura del proyecto
BBVA/
├── frontend/          → React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── BancaPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   └── services/
│   │       └── authService.js
│   └── package.json
│
└── backend/ → Django REST API
├── autenticacion/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── bbva_backend/
│   ├── settings.py
│   └── urls.py
└── manage.py

---

## 🗄️ Base de datos (Supabase)

### Tabla: `usuarios`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Clave primaria |
| nombre | TEXT | Nombre del usuario |
| apellido | TEXT | Apellido del usuario |
| dni | TEXT | Documento único (8 dígitos) |
| email | TEXT | Correo electrónico |
| password_hash | TEXT | Contraseña encriptada |
| created_at | TIMESTAMPTZ | Fecha de registro |

### Tabla: `cuentas`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Clave primaria |
| usuario_id | UUID | Referencia al usuario |
| tipo | TEXT | corriente / ahorro |
| numero_cuenta | TEXT | Número de cuenta |
| saldo | DECIMAL | Saldo disponible |
| moneda | TEXT | PEN por defecto |
| created_at | TIMESTAMPTZ | Fecha de apertura |

### Tabla: `transacciones`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Clave primaria |
| usuario_id | UUID | Referencia al usuario |
| cuenta_id | UUID | Referencia a la cuenta |
| tipo | TEXT | debito / credito |
| descripcion | TEXT | Descripción del movimiento |
| monto | DECIMAL | Monto de la transacción |
| fecha | TIMESTAMPTZ | Fecha del movimiento |

---

## 📋 Reglas de negocio BBVA

### Contraseña
- Máximo 6 caracteres
- Solo letras y números
- Sin espacios
- Sin símbolos ($, %, &, /, etc.)

### Documento de identidad (Perú)
- **DNI:** exactamente 8 dígitos numéricos
- **Carné de Extranjería:** entre 9 y 12 caracteres
- **Pasaporte:** entre 6 y 12 caracteres

### Cuenta
- Al registrarse se crea automáticamente una cuenta de ahorros
- Número de cuenta con formato: `019-XXXXXXX`
- Moneda por defecto: PEN (Soles)

---

## 🚀 Cómo levantar el proyecto

### Backend (Django)

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

Corre en: `http://localhost:8000`

### Frontend (React)

```bash
cd frontend
npm run dev
```

Corre en: `http://localhost:5173`

---

## 🔗 Endpoints API

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/registro/` | Registro de nuevo usuario |
| POST | `/api/auth/login/` | Login y obtención de JWT |

### Ejemplo registro:
```json
{
    "nombre": "Oliver",
    "apellido": "Cabrera",
    "tipo_documento": "DNI",
    "dni": "12345678",
    "email": "oliver@bbva.pe",
    "password": "123456"
}
```

### Ejemplo login:
```json
{
    "dni": "12345678",
    "password": "123456"
}
```

---

## 📱 Flujo de la aplicación
[1] Home (Landing)
↓ "Banca por Internet"
[2] Pantalla Zona Segura
↓ "Ingresar"
[3] Login (DNI + Contraseña)
↓ credenciales correctas
[4] Dashboard (saldo, movimientos)
↓ credenciales incorrectas
Mensaje de error (permanece en login)

---

## 👨‍💻 Autor

- **Nombre:** Oliver Aaron Cabrera Solis
- **Curso:** Desarrollo de Aplicaciones Web
- **Sección:** 3 | NRC: 29691
- **Ciclo:** 2026
- **Entidad asignada:** BBVA Perú — Tier 1
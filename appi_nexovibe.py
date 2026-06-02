from flask import Flask, request, jsonify
from flask_cors import CORS
import pg8000.dbapi as psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Habilitar CORS para permitir peticiones desde el frontend Next.js (por defecto en el puerto 3000)
CORS(app)

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.environ.get("DB_HOST", "localhost"),
            port=int(os.environ.get("DB_PORT", "5432")),
            database=os.environ.get("DB_NAME", "nexovibe_bd"),
            user=os.environ.get("DB_USER", "postgres"),
            password=os.environ.get("DB_PASSWORD", "dAG172005%")
        )
        return conn
    except Exception as e:
        print("Error de conexión a la base de datos:", e)
        return None

@app.route('/', methods=['GET'])
def index():
    try:
        conn = get_db_connection()
        if not conn:
            raise Exception("No se pudo obtener la conexión")
        conn.close()
        return jsonify({
            "status": "success", 
            "message": "¡API de NexoVibe funcionando correctamente! Conexión a la base de datos PostgreSQL exitosa."
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": f"API de NexoVibe funcionando, pero hay un problema al conectar con la base de datos PostgreSQL. Detalle: {str(e)}"
        }), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    
    # La contraseña se ignora por ahora ya que no existe en la base de datos según la solicitud del usuario
    # password = data.get('password')

    if not email:
        return jsonify({"success": False, "message": "Email es requerido"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"success": False, "message": "Error interno: no se pudo conectar a la base de datos"}), 500

    try:
        cur = conn.cursor()
        
        # 1. Buscar a la persona por email
        cur.execute("SELECT id, nombre, apellido FROM persona WHERE email = %s", (email,))
        persona = cur.fetchone()
        
        if not persona:
            return jsonify({"success": False, "message": "El correo no está registrado en el sistema"}), 401
            
        persona_id = persona[0]
        nombre_completo = f"{persona[1]} {persona[2]}"
        
        # 2. Determinar el rol buscando en las tablas relacionadas
        role = "desconocido"
        
        admin_emails = {
            'tomas.cedillo@nexovibe.com', 'flor.sarmiento@nexovibe.com', 'marco.villasenor@nexovibe.com',
            'julia.aguirre@nexovibe.com', 'ruben.montero@nexovibe.com', 'cecilia.padilla@nexovibe.com',
            'victor.bravo@nexovibe.com', 'noemi.camacho@nexovibe.com', 'erick.valencia@nexovibe.com',
            'mia.sotelo@nexovibe.com', 'gilberto.cuevas@nexovibe.com', 'romina.becerra@nexovibe.com'
        }
        
        if email.lower() in admin_emails:
            role = "admin"
            
        # Buscar en cliente
        if role == "desconocido":
            cur.execute("SELECT id FROM cliente WHERE id_persona = %s", (persona_id,))
            if cur.fetchone():
                role = "cliente"
            
        # Buscar en empleado
        if role == "desconocido":
            cur.execute("SELECT id, rol FROM empleado WHERE id_persona = %s", (persona_id,))
            emp_row = cur.fetchone()
            if emp_row:
                if emp_row[1] == 'Administrador':
                    role = "admin"
                else:
                    role = "empleado"
                
        # Buscar en creador_ugc
        if role == "desconocido":
            cur.execute("SELECT id FROM creador_ugc WHERE id_persona = %s", (persona_id,))
            if cur.fetchone():
                role = "creador_ugc"

        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "user": {
                "uid": str(persona_id),
                "email": email,
                "name": nombre_completo,
                "role": role
            }
        })

    except Exception as e:
        print("Error al consultar la base de datos:", e)
        return jsonify({"success": False, "message": "Error al procesar el inicio de sesión"}), 500

@app.route('/api/empleados', methods=['GET'])
def get_empleados():
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT e.id, p.nombre, p.apellido, p.email, e.rol 
            FROM empleado e 
            JOIN persona p ON e.id_persona = p.id
        """)
        empleados = []
        for row in cur.fetchall():
            empleados.append({
                "id": str(row[0]),
                "nombre": row[1],
                "apellido": row[2],
                "email": row[3],
                "rol": row[4],
                "estado": "ACTIVE"
            })
        cur.close()
        conn.close()
        return jsonify({"success": True, "empleados": empleados})
    except Exception as e:
        print("Error get_empleados:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/clientes', methods=['GET'])
def get_clientes():
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT c.id, p.nombre, p.apellido, p.email, c.telefono, c.direccion, c.rango, c.suscripcion 
            FROM cliente c 
            JOIN persona p ON c.id_persona = p.id
        """)
        clientes = []
        for row in cur.fetchall():
            clientes.append({
                "id": str(row[0]), 
                "nombre": row[1],
                "apellido": row[2],
                "email": row[3],
                "telefono": row[4],
                "direccion": row[5],
                "rango": row[6] if row[6] else "normal",
                "suscripcion": row[7] if row[7] else "estandar"
            })
        cur.close()
        conn.close()
        return jsonify({"success": True, "clientes": clientes})
    except Exception as e:
        print("Error get_clientes:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/creadores', methods=['GET'])
def get_creadores():
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT c.id, p.nombre, p.apellido, p.email, c.categoria, c.descripcion 
            FROM creador_ugc c 
            JOIN persona p ON c.id_persona = p.id
        """)
        creadores = []
        for row in cur.fetchall():
            creadores.append({
                "id": str(row[0]), 
                "nombre": row[1],
                "apellido": row[2],
                "email": row[3],
                "categoria": row[4],
                "descripcion": row[5]
            })
        cur.close()
        conn.close()
        return jsonify({"success": True, "creadores": creadores})
    except Exception as e:
        print("Error get_creadores:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/creadores/<id>', methods=['PUT'])
def update_creador(id):
    data = request.get_json()
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("SELECT id_persona FROM creador_ugc WHERE id = %s", (int(id),))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Creador not found"}), 404
        persona_id = row[0]
        
        cur.execute("""
            UPDATE persona SET nombre = %s, apellido = %s, email = %s
            WHERE id = %s
        """, (data['nombre'], data['apellido'], data['email'], persona_id))
        
        categoria = data.get('categoria', 'Hospitalidad y experiencias')
        descripcion = data.get('descripcion', '')
        cur.execute("""
            UPDATE creador_ugc SET categoria = %s, descripcion = %s
            WHERE id = %s
        """, (categoria, descripcion, int(id)))
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "creador": data})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/creadores/<id>', methods=['DELETE'])
def delete_creador(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("SELECT id_persona FROM creador_ugc WHERE id = %s", (int(id),))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Creador not found"}), 404
        persona_id = row[0]
        
        cur.execute("DELETE FROM persona WHERE id = %s", (persona_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "message": "Creador deleted"})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/proyectos', methods=['GET'])
def get_proyectos():
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, nombre, categoria, descripcion, fecha_inicio, fecha_fin, estado, progreso, presupuesto_total, presupuesto_utilizado, prioridad, ias_usadas, detalles_proyecto 
            FROM proyecto
        """)
        proyectos = cur.fetchall()

        cur.execute("""
            SELECT ep.id_proyecto, p.email 
            FROM empleado_proyecto ep 
            JOIN empleado e ON ep.id_empleado = e.id 
            JOIN persona p ON e.id_persona = p.id
        """)
        emp_asignados = {}
        for row in cur.fetchall():
            pid, email = row
            if pid not in emp_asignados: emp_asignados[pid] = []
            emp_asignados[pid].append(email)

        cur.execute("""
            SELECT cp.id_proyecto, c.id 
            FROM cliente_proyecto cp 
            JOIN cliente c ON cp.id_cliente = c.id 
        """)
        cli_asignados = {}
        for row in cur.fetchall():
            pid, email = row
            if pid not in cli_asignados: cli_asignados[pid] = []
            cli_asignados[pid].append(str(email))

        tareas = []
        for p in proyectos:
            pid = p[0]
            estado = p[6] if p[6] else 'En desarrollo'

            tareas.append({
                "id": str(pid),
                "titulo": p[1],
                "categoria": p[2],
                "descripcion": p[3] or "",
                "fecha_inicio": p[4].isoformat() if p[4] else None,
                "fecha_limite": p[5].isoformat() if p[5] else None,
                "estado": estado,
                "presupuesto_total": float(p[8]) if p[8] is not None else 0,
                "presupuesto_utilizado": float(p[9]) if p[9] is not None else 0,
                "prioridad": p[10] if p[10] else "low",
                "ias_usadas": p[11] if p[11] else "",
                "detalles_proyecto": p[12] if p[12] else "",
                "progreso": int(p[7]) if p[7] is not None else 0,
                "empleados_asignados": emp_asignados.get(pid, []),
                "clientes_asignados": cli_asignados.get(pid, [])
            })
        cur.close()
        conn.close()
        return jsonify({"success": True, "tareas": tareas})
    except Exception as e:
        print("Error get_proyectos:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/proyectos', methods=['POST'])
def create_proyecto():
    data = request.get_json()
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    
    try:
        nombre = data.get('titulo', 'Nueva Tarea')
        if not nombre or len(nombre) > 50:
            nombre = nombre[:50]
        descripcion = data.get('descripcion', '')
        if not descripcion or len(descripcion) > 200:
            descripcion = descripcion[:200]
        fecha_inicio = data.get('fecha_inicio', '2026-05-21')
        fecha_fin = data.get('fecha_limite', '2026-05-21')
        categoria = data.get('categoria', 'Desarrollo Web')
        if categoria not in ['Desarrollo Web', 'Diseño y Branding', 'Marketing de Contenidos potenciado con IA']:
            categoria = 'Desarrollo Web'
        
        estado_front = data.get('estado', 'Cancelado')
        if estado_front in ['En desarrollo', 'Suspendido', 'Finalizado', 'Cancelado']:
            estado = estado_front
        else:
            estado = 'Cancelado'

        progreso = data.get('progreso', 0)
        presupuesto_total = data.get('presupuesto_total', 0)
        presupuesto_utilizado = data.get('presupuesto_utilizado', 0)
        prioridad = data.get('prioridad', 'low')
        ias_usadas = data.get('ias_usadas', '')
        detalles_proyecto = data.get('detalles_proyecto', '')

        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proyecto (nombre, categoria, descripcion, fecha_inicio, fecha_fin, estado, progreso, presupuesto_total, presupuesto_utilizado, prioridad, ias_usadas, detalles_proyecto)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (nombre, categoria, descripcion, fecha_inicio, fecha_fin, estado, progreso, presupuesto_total, presupuesto_utilizado, prioridad, ias_usadas, detalles_proyecto))
        new_id = cur.fetchone()[0]

        empleados = data.get('empleados_asignados', [])
        for email in empleados:
            cur.execute("SELECT e.id FROM empleado e JOIN persona p ON e.id_persona = p.id WHERE p.email = %s", (email,))
            emp_id_row = cur.fetchone()
            if emp_id_row:
                cur.execute("INSERT INTO empleado_proyecto (id_empleado, id_proyecto) VALUES (%s, %s)", (emp_id_row[0], new_id))
                
        clientes = data.get('clientes_asignados', [])
        for id_cli in clientes:
            cur.execute("INSERT INTO cliente_proyecto (id_cliente, id_proyecto) VALUES (%s, %s)", (int(id_cli), new_id))

        conn.commit()
        cur.close()
        conn.close()
        
        data['id'] = str(new_id)
        return jsonify({"success": True, "tarea": data})
    except Exception as e:
        if conn:
            conn.rollback()
        print("Error create_proyecto:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/proyectos/<id>', methods=['PUT'])
def update_proyecto(id):
    data = request.get_json()
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500

    try:
        cur = conn.cursor()
        updates = []
        params = []
        
        if 'estado' in data:
            estado_front = data['estado']
            if estado_front in ['En desarrollo', 'Suspendido', 'Finalizado', 'Cancelado']:
                updates.append("estado = %s")
                params.append(estado_front)

        if 'titulo' in data:
            updates.append("nombre = %s")
            params.append(data['titulo'][:50])
            
        if 'fecha_inicio' in data:
            updates.append("fecha_inicio = %s")
            params.append(data['fecha_inicio'])
            
        if 'fecha_limite' in data:
            updates.append("fecha_fin = %s")
            params.append(data['fecha_limite'])
            
        if 'descripcion' in data:
            updates.append("descripcion = %s")
            params.append(data['descripcion'][:200])

        if 'categoria' in data:
            if data['categoria'] in ['Desarrollo Web', 'Diseño y Branding', 'Marketing de Contenidos potenciado con IA']:
                updates.append("categoria = %s")
                params.append(data['categoria'])

        if 'progreso' in data:
            updates.append("progreso = %s")
            params.append(int(data['progreso']))

        if 'presupuesto_total' in data:
            updates.append("presupuesto_total = %s")
            params.append(data['presupuesto_total'])

        if 'presupuesto_utilizado' in data:
            updates.append("presupuesto_utilizado = %s")
            params.append(data['presupuesto_utilizado'])

        if 'prioridad' in data:
            updates.append("prioridad = %s")
            params.append(data['prioridad'])

        if 'ias_usadas' in data:
            updates.append("ias_usadas = %s")
            params.append(data['ias_usadas'])

        if 'detalles_proyecto' in data:
            updates.append("detalles_proyecto = %s")
            params.append(data['detalles_proyecto'])

        if updates:
            query = f"UPDATE proyecto SET {', '.join(updates)} WHERE id = %s"
            params.append(int(id))
            cur.execute(query, params)
            
        if 'empleados_asignados' in data:
            cur.execute("DELETE FROM empleado_proyecto WHERE id_proyecto = %s", (int(id),))
            for email in data['empleados_asignados']:
                cur.execute("SELECT e.id FROM empleado e JOIN persona p ON e.id_persona = p.id WHERE p.email = %s", (email,))
                emp_id_row = cur.fetchone()
                if emp_id_row:
                    cur.execute("INSERT INTO empleado_proyecto (id_empleado, id_proyecto) VALUES (%s, %s)", (emp_id_row[0], int(id)))

        if 'clientes_asignados' in data:
            cur.execute("DELETE FROM cliente_proyecto WHERE id_proyecto = %s", (int(id),))
            for id_cli in data['clientes_asignados']:
                cur.execute("INSERT INTO cliente_proyecto (id_cliente, id_proyecto) VALUES (%s, %s)", (int(id_cli), int(id)))

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "tarea": data})
    except Exception as e:
        if conn:
            conn.rollback()
        print("Error update_proyecto:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/proyectos/<id>', methods=['DELETE'])
def delete_proyecto(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM proyecto WHERE id = %s", (int(id),))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "message": "Task deleted"})
    except Exception as e:
        print("Error delete_proyecto:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/empleados', methods=['POST'])
def create_empleado():
    data = request.get_json()
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO persona (nombre, apellido, email)
            VALUES (%s, %s, %s) RETURNING id
        """, (data['nombre'], data['apellido'], data['email']))
        persona_id = cur.fetchone()[0]
        
        cur.execute("""
            INSERT INTO empleado (id_persona, rol, salario)
            VALUES (%s, %s, %s) RETURNING id
        """, (persona_id, data['rol'], float(data['salario'])))
        new_id = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "empleado": {
            "id": str(new_id),
            "nombre": data['nombre'],
            "apellido": data['apellido'],
            "email": data['email'],
            "rol": data['rol'],
            "estado": "ACTIVE"
        }})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/empleados/<id>', methods=['PUT'])
def update_empleado(id):
    data = request.get_json()
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("SELECT id_persona FROM empleado WHERE id = %s", (int(id),))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Empleado not found"}), 404
        persona_id = row[0]
        
        cur.execute("""
            UPDATE persona SET nombre = %s, apellido = %s, email = %s
            WHERE id = %s
        """, (data['nombre'], data['apellido'], data['email'], persona_id))
        
        cur.execute("""
            UPDATE empleado SET rol = %s, salario = %s
            WHERE id = %s
        """, (data['rol'], float(data['salario']), int(id)))
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "empleado": data})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/empleados/<id>', methods=['DELETE'])
def delete_empleado(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("SELECT id_persona FROM empleado WHERE id = %s", (int(id),))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Empleado not found"}), 404
        persona_id = row[0]
        
        cur.execute("DELETE FROM persona WHERE id = %s", (persona_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "message": "Empleado deleted"})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/clientes', methods=['POST'])
def create_cliente():
    data = request.get_json()
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO persona (nombre, apellido, email)
            VALUES (%s, %s, %s) RETURNING id
        """, (data['nombre'], data['apellido'], data['email']))
        persona_id = cur.fetchone()[0]
        
        cur.execute("""
            INSERT INTO cliente (id_persona, telefono, direccion, rango, suscripcion)
            VALUES (%s, %s, %s, %s, %s) RETURNING id
        """, (persona_id, data['telefono'], data['direccion'], data.get('rango', 'normal'), data.get('suscripcion', 'estandar')))
        new_id = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "cliente": {
            "id": str(new_id),
            "nombre": data['nombre'],
            "apellido": data['apellido'],
            "email": data['email'],
            "telefono": data['telefono'],
            "direccion": data['direccion'],
            "rango": data.get('rango', 'normal'),
            "suscripcion": data.get('suscripcion', 'estandar')
        }})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/clientes/<id>', methods=['PUT'])
def update_cliente(id):
    data = request.get_json()
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("SELECT id_persona FROM cliente WHERE id = %s", (int(id),))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Cliente not found"}), 404
        persona_id = row[0]
        
        cur.execute("""
            UPDATE persona SET nombre = %s, apellido = %s, email = %s
            WHERE id = %s
        """, (data['nombre'], data['apellido'], data['email'], persona_id))
        
        cur.execute("""
            UPDATE cliente SET telefono = %s, direccion = %s, rango = %s, suscripcion = %s
            WHERE id = %s
        """, (data['telefono'], data['direccion'], data.get('rango', 'normal'), data.get('suscripcion', 'estandar'), int(id)))
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "cliente": data})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/clientes/<id>', methods=['DELETE'])
def delete_cliente(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "No DB connection"}), 500
    try:
        cur = conn.cursor()
        cur.execute("SELECT id_persona FROM cliente WHERE id = %s", (int(id),))
        row = cur.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Cliente not found"}), 404
        persona_id = row[0]
        
        cur.execute("DELETE FROM persona WHERE id = %s", (persona_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True, "message": "Cliente deleted"})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("FLASK_RUN_PORT", 5000))
    debug_mode = os.environ.get("FLASK_ENV") == "development"
    app.run(debug=debug_mode, port=port)

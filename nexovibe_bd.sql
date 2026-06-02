--Creamos la base de datos de nexovibe
CREATE DATABASE nexovibe_bd;

--En esta sección pasamos a crear las tablas que conforman el sistema.

--Creamos la tabla persona
CREATE TABLE persona (
    id SERIAL PRIMARY KEY, 
    nombre VARCHAR(50) NOT NULL, 
    apellido VARCHAR(50) NOT NULL, 
    email VARCHAR(100) UNIQUE NOT NULL --Aseguramos que no haya 2 o más personas dadas de alta con el mismo correo.
    );

-- Creamos la tabla tipo_suscripcion
CREATE TABLE tipo_suscripcion(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    caracteristicas JSONB,
    limite_proyectos INT DEFAULT -1,
    badge_text VARCHAR(50)
);

--Creamos la tabla Cliente
CREATE TABLE cliente(
    id SERIAL PRIMARY KEY,
    id_persona INT UNIQUE NOT NULL, --Aseguramos que un unico registro de persona este relacionado con un solo cliente
    telefono VARCHAR(20) NOT NULL, 
    direccion VARCHAR(150) NOT NULL,
    rango VARCHAR(50) DEFAULT 'normal' CHECK(rango IN ('normal', 'vip')),
    suscripcion VARCHAR(50) DEFAULT 'estandar',

FOREIGN KEY(id_persona) REFERENCES persona(id)  -- Definimos la relación 1 a 1 en donde un cliente es una persona
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY(suscripcion) REFERENCES tipo_suscripcion(nombre)
ON DELETE SET NULL
ON UPDATE CASCADE
);

--Creamos la tabla empleado
CREATE TABLE empleado(
    id SERIAL PRIMARY KEY,
    id_persona INT UNIQUE NOT NULL, --Aseguramos que un unico registro de persona este relacionado con un solo empleado.
    -- Validamos que todo empleado que se registre tenga cualquiera de los roles posibles.
    rol VARCHAR(50) NOT NULL CHECK(rol IN('Desarrollador Frontend','Desarrollador Backend','Analista de Marketing', 'Diseñador Digital','Desarrollador de Creadores UGC')),
    --Validamos que se cumpla la regla de negocio en que el sueldo de todo empleado debe ser superior a 1000 y menor a 70000 pesos.
    salario DECIMAL(7,2)NOT NULL CHECK((salario > 1000) AND(salario < 70000)),

    FOREIGN KEY(id_persona) REFERENCES persona(id) -- Definimos la relación 1 a 1 en donde un empleado es una persona.
    ON DELETE CASCADE
    ON UPDATE CASCADE

);

--Creamos la tabla creador_ugc
CREATE TABLE creador_ugc(
    id SERIAL PRIMARY KEY,
    id_persona INT UNIQUE NOT NULL, --Aseguramos que un unico registro de persona este relacionado con un solo creador_ugc.
    --Validamos que todo creador de contenido este dado de alta con alguna de las categorías posibles.
    categoria VARCHAR(100) NOT NULL CHECK(categoria IN('Hospitalidad y experiencias','Contenido para Corporativos','Estilo de Vida y Bienestar', 'Hogar y Tecnologia')),
    descripcion VARCHAR(200) NOT NULL,

    FOREIGN KEY(id_persona) REFERENCES persona(id) -- Definimos la relación 1 a 1 en donde un creador_ugc es una persona.
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

--Creamos la tabla servicio
CREATE TABLE servicio(
    id SERIAL PRIMARY KEY, 
    nombre VARCHAR(50) NOT NULL,
    --Validamos que todo servicio que se de de alta este dentro de cualquier tipo de paquete posible.
    tipo_paquete VARCHAR(50) NOT NULL CHECK(tipo_paquete IN('Estandar','Pro','Platino')),
    descripcion VARCHAR(200) NOT NULL,
    --Validamos que se cumpla la regla de negocio en donde el costo de mensualidad de una membresia sea mayor a 1000 y menor a 10000 pesos.
    costo_mensualidad DECIMAL(6,2) NOT NULL CHECK((costo_mensualidad > 1000) AND (costo_mensualidad < 10000)) 
);


--Creamos la tabla proyecto
CREATE TABLE proyecto(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    --Validamos que todo proyecto este bajo cuaquiera de las categorías posibles.
    categoria VARCHAR(100) NOT NULL CHECK(categoria IN ('Desarrollo Web', 'Diseño y Branding','Marketing de Contenidos potenciado con IA')),
    descripcion VARCHAR(200) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    --Validamos que cada proyecto este dado de alto con alguno de los estados posibles.
    estado VARCHAR(50) NOT NULL CHECK(estado IN ('En desarrollo','Suspendido','Finalizado','Cancelado')),
    progreso INT DEFAULT 0,
    presupuesto_total DECIMAL(10,2) DEFAULT 0,
    presupuesto_utilizado DECIMAL(10,2) DEFAULT 0,
    prioridad VARCHAR(20) DEFAULT 'low',
    --Validamos que la fecha de fin no sea antes que la fecha de inicio.
    CHECK(fecha_fin >= fecha_inicio)
);

-- No poner directo las variables ya que puede complicar la creasion de nuevas en el futuro 

--Creamos la tabla tecnologia 
CREATE TABLE tecnologia(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    --Validamos que toda tecnología se de de alta con alguna de las categorías posibles.
    categoria VARCHAR(100) NOT NULL CHECK(categoria IN ('Software de Diseño Digital','Modelo/Agente de IA','Framework', 'Editor de Código')),
    version_tecnologia VARCHAR(50) NOT NULL
);

--Creamos la tabla metrica
CREATE TABLE metrica(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200) NOT NULL
);


--En esta sección creamos las tablas intermedias para las relaciones de varios a varios

--Creamos la tabla Cliente - Servicio

CREATE TABLE cliente_servicio(
    id_cliente INT NOT NULL,
    id_servicio INT NOT NULL,
    --Creamos la clave primaria de la tabla por medio de una clave compuesta los id_cliente y id_servicio.
    PRIMARY KEY(id_cliente, id_servicio), 

    FOREIGN KEY(id_cliente) REFERENCES cliente(id) --Agregamos la referencia de donde sacara los registros para el campo id_cliente.
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    FOREIGN KEY(id_servicio) REFERENCES servicio(id) --Agregamos la referencia de donde sacara los registros para el campo id_servicio.
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Creamos la tabla Cliente - Proyecto

CREATE TABLE cliente_proyecto(
    id_cliente INT NOT NULL,
    id_proyecto INT NOT NULL,
    --Creamos la clave primaria de la tabla por medio de una clave compuesta los id_cliente y id_proyecto.
    PRIMARY KEY(id_cliente, id_proyecto),

    FOREIGN KEY(id_cliente) REFERENCES cliente(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    FOREIGN KEY(id_proyecto) REFERENCES proyecto(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);


-- Creamos la tabla Empleado - Proyecto

CREATE TABLE empleado_proyecto(
    id_empleado INT NOT NULL,
    id_proyecto INT NOT NULL,
    --Creamos la clave primaria de la tabla por medio de una clave compuesta los id_empleado y id_proyecto.
    PRIMARY KEY(id_empleado, id_proyecto),

    FOREIGN KEY(id_empleado) REFERENCES empleado(id) --Agregamos la referencia de donde sacara los registros para el campo id_empleado.
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    FOREIGN KEY(id_proyecto) REFERENCES proyecto(id) --Agregamos la referencia de donde sacara los registros para el campo id_proyecto.
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Creamos la tabla Creador_UGC - Proyecto

CREATE TABLE creadorugc_proyecto(
    id_creador_ugc INT NOT NULL,
    id_proyecto INT NOT NULL,
    --Creamos la clave primaria de la tabla por medio de una clave compuesta los id_creadorugc y id_proyecto. 
    PRIMARY KEY(id_creador_ugc,id_proyecto),

    FOREIGN KEY(id_creador_ugc) REFERENCES creador_ugc(id) --Agregamos la referencia de donde sacara los registros para el campo id_creador_ugc.
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    FOREIGN KEY(id_proyecto) REFERENCES proyecto(id) --Agregamos la referencia de donde sacara los registros para el campo id_proyecto.
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Creamos la tabla Proyecto - Tecnología

CREATE TABLE proyecto_tecnologia (
    id_proyecto INT NOT NULL,
    id_tecnologia INT NOT NULL,
    --Creamos la clave primaria de la tabla por medio de una clave compuesta los id_proyecto y id_tecnologia. 
    PRIMARY KEY(id_proyecto, id_tecnologia),

    FOREIGN KEY(id_proyecto) REFERENCES proyecto(id) --Agregamos la referencia de donde sacara los registros para el campo id_proyecto.
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    FOREIGN KEY(id_tecnologia) REFERENCES tecnologia(id) --Agregamos la referencia de donde sacara los registros para el campo id_tecnologia.
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

--Creamos la tabla Proyecto - Metrica

CREATE TABLE proyecto_metrica (
    id_proyecto INT NOT NULL,
    id_metrica INT NOT NULL,
    --Creamos la clave primaria de la tabla por medio de una clave compuesta los id_proyecto y id_metrica. 
    PRIMARY KEY (id_proyecto, id_metrica),

    FOREIGN KEY (id_proyecto) REFERENCES proyecto(id) --Agregamos la referencia de donde sacara los registros para el campo id_proyecto.
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    FOREIGN KEY (id_metrica) REFERENCES metrica(id) --Agregamos la referencia de donde sacara los registros para el campo id_metrica.
    ON DELETE CASCADE
    ON UPDATE CASCADE
);


--En esta sección creamos los inserts para agregar datos al sistema.

--Generamos los registros para tabla persona. (VIP)
INSERT INTO persona (nombre, apellido, email) VALUES
('Diego','Arellano','diego.arellano@nexovibe.com'),
('Esteban','Burgos','esteban.burgos@nexovibe.com'),
('Antony','Poot','antony.poot@nexovibe.com'),
('Diego','Mota','diego.mota@nexovibe.com'),
('Carlos','Lopez','carlos.lopez@nexovibe.com'),
('Luis','Ramirez','luis.ramirez@nexovibe.com'),
('Fernanda','Martinez','fernanda.martinez@nexovibe.com'),
('Sofia','Castillo','sofia.castillo@nexovibe.com'),
('Jorge','Navarro','jorge.navarro@nexovibe.com'),
('Camila','Vargas','camila.vargas@nexovibe.com'),
('Eduardo','Torres','eduardo.torres@nexovibe.com'),
('Valeria','Santos','valeria.santos@nexovibe.com'),
('Daniel','Mendoza','daniel.mendoza@nexovibe.com'),
('Paola','Herrera','paola.herrera@nexovibe.com'),
('Ricardo','Cruz','ricardo.cruz@nexovibe.com'),
('Andrea','Flores','andrea.flores@nexovibe.com'),
('Sebastian','Rojas','sebastian.rojas@nexovibe.com'),
('Mariana','Gomez','mariana.gomez@nexovibe.com'),
('Ivan','Ortega','ivan.ortega@nexovibe.com'),
('Natalia','Reyes','natalia.reyes@nexovibe.com'),
('Emilio','Salazar','emilio.salazar@nexovibe.com'),
('Gabriela','Pineda','gabriela.pineda@nexovibe.com'),
('Oscar','Vega','oscar.vega@nexovibe.com'),
('Lucia','Campos','lucia.campos@nexovibe.com'),
('Miguel','Fuentes','miguel.fuentes@nexovibe.com'),
('Renata','Molina','renata.molina@nexovibe.com'),
('Hector','Aguilar','hector.aguilar@nexovibe.com'),
('Julieta','Peña','julieta.pena@nexovibe.com'),
('Alejandro','Silva','alejandro.silva@nexovibe.com'),
('Ximena','Ruiz','ximena.ruiz@nexovibe.com'),
('Mauricio','Luna','mauricio.luna@nexovibe.com'),
('Regina','Cervantes','regina.cervantes@nexovibe.com'),
('Kevin','Guerrero','kevin.guerrero@nexovibe.com'),
('Melissa','Delgado','melissa.delgado@nexovibe.com'),
('Gael','Castro','gael.castro@nexovibe.com'),
('Daniela','Morales','daniela.morales@nexovibe.com'),
('Arturo','Benitez','arturo.benitez@nexovibe.com'),
('Nicole','Suarez','nicole.suarez@nexovibe.com'),
('Raul','Valdez','raul.valdez@nexovibe.com'),
('Abril','Esquivel','abril.esquivel@nexovibe.com'),

--Generamos los registros para tabla persona (Empleado).
('Leonardo','Palacios','leonardo.palacios@nexovibe.com'),
('Tatiana','Ibarra','tatiana.ibarra@nexovibe.com'),
('Cristian','Rosales','cristian.rosales@nexovibe.com'),
('Bianca','Mejia','bianca.mejia@nexovibe.com'),
('Javier','Acosta','javier.acosta@nexovibe.com'),
('Alexa','Villanueva','alexa.villanueva@nexovibe.com'),
('Mateo','Arce','mateo.arce@nexovibe.com'),
('Paulina','Zamora','paulina.zamora@nexovibe.com'),
('Gerardo','Velasco','gerardo.velasco@nexovibe.com'),
('Marisol','Trujillo','marisol.trujillo@nexovibe.com'),
('Brandon','Medina','brandon.medina@nexovibe.com'),
('Regina','Montes','regina.montes@nexovibe.com'),
('Sebastian','Palma','sebastian.palma@nexovibe.com'),
('Nicole','Serrano','nicole.serrano@nexovibe.com'),
('Jorge','Ayala','jorge.ayala@nexovibe.com'),
('Valentina','Nuñez','valentina.nunez@nexovibe.com'),
('Alberto','Solís','alberto.solis@nexovibe.com'),
('Karla','Figueroa','karla.figueroa@nexovibe.com'),
('Emmanuel','Carrillo','emmanuel.carrillo@nexovibe.com'),
('Danna','Renteria','danna.renteria@nexovibe.com'),
('Fabian','Escobar','fabian.escobar@nexovibe.com'),
('Montserrat','Miramontes','montserrat.miramontes@nexovibe.com'),
('Alan','Pacheco','alan.pacheco@nexovibe.com'),
('Ariana','Cordero','ariana.cordero@nexovibe.com'),
('Patricio','Galvan','patricio.galvan@nexovibe.com'),
('Miranda','León','miranda.leon@nexovibe.com'),
('Saul','Mora','saul.mora@nexovibe.com'),
('Claudia','Rivas','claudia.rivas@nexovibe.com'),
('Roberto','Trejo','roberto.trejo@nexovibe.com'),
('Isabella','Ochoa','isabella.ochoa@nexovibe.com'),
('Hugo','Santana','hugo.santana@nexovibe.com'),
('Victoria','Marin','victoria.marin@nexovibe.com'),
('Axel','Coronado','axel.coronado@nexovibe.com'),
('Sara','Tapia','sara.tapia@nexovibe.com'),
('Elias','Contreras','elias.contreras@nexovibe.com'),
('Carla','Franco','carla.franco@nexovibe.com'),
('Pablo','Lara','pablo.lara@nexovibe.com'),
('Daniela','Rosillo','daniela.rosillo@nexovibe.com'),
('Ivan','Zepeda','ivan.zepeda@nexovibe.com'),
('Renata','Beltran','renata.beltran@nexovibe.com'),

--Generamos los registros para tabla persona.(ADMIN)
('Tomas','Cedillo','tomas.cedillo@nexovibe.com'),
('Flor','Sarmiento','flor.sarmiento@nexovibe.com'),
('Marco','Villaseñor','marco.villasenor@nexovibe.com'),
('Julia','Aguirre','julia.aguirre@nexovibe.com'),
('Ruben','Montero','ruben.montero@nexovibe.com'),
('Cecilia','Padilla','cecilia.padilla@nexovibe.com'),
('Victor','Bravo','victor.bravo@nexovibe.com'),
('Noemi','Camacho','noemi.camacho@nexovibe.com'),
('Erick','Valencia','erick.valencia@nexovibe.com'),
('Mia','Sotelo','mia.sotelo@nexovibe.com'),
('Gilberto','Cuevas','gilberto.cuevas@nexovibe.com'),
('Romina','Becerra','romina.becerra@nexovibe.com'),
('Andres','Quezada','andres.quezada@nexovibe.com'),
('Zoe','Cardenas','zoe.cardenas@nexovibe.com'),
('Cesar','Murillo','cesar.murillo@nexovibe.com'),
('Luna','Estrada','luna.estrada@nexovibe.com'),
('Rodrigo','Valle','rodrigo.valle@nexovibe.com'),
('Marifer','Hinojosa','marifer.hinojosa@nexovibe.com'),
('Enrique','Salgado','enrique.salgado@nexovibe.com'),
('Alicia','Peralta','alicia.peralta@nexovibe.com'),
('Rafael','Olvera','rafael.olvera@nexovibe.com'),
('Pamela','Cisneros','pamela.cisneros@nexovibe.com'),
('Samuel','Barragan','samuel.barragan@nexovibe.com'),
('Vanessa','Macias','vanessa.macias@nexovibe.com'),
('Adrian','Teran','adrian.teran@nexovibe.com'),
('Lorena','Cantu','lorena.cantu@nexovibe.com'),
('Josue','Arenas','josue.arenas@nexovibe.com'),
('Brisa','Maldonado','brisa.maldonado@nexovibe.com'),
('Mauricio','Requena','mauricio.requena@nexovibe.com'),
('Kimberly','Nieto','kimberly.nieto@nexovibe.com'),
('Ulises','Ponce','ulises.ponce@nexovibe.com'),
('Aitana','Juarez','aitana.juarez@nexovibe.com'),
('Eduardo','Ledesma','eduardo.ledesma@nexovibe.com'),
('Mariana','Bautista','mariana.bautista@nexovibe.com'),
('Cristopher','Arriaga','cristopher.arriaga@nexovibe.com'),
('Eva','Robles','eva.robles@nexovibe.com'),
('Felipe','Galindo','felipe.galindo@nexovibe.com'),
('Daniela','Valencia','daniela.valencia@nexovibe.com'),
('Nicolas','Roldan','nicolas.roldan@nexovibe.com'),
('Jimena','Cabrera','jimena.cabrera@nexovibe.com');



--Para los registros de cliente, empleado y creador_ugc tuvimos en cuenta que se respetase la relacion 1 a 1 acordada
--en donde una persona solo puede ser alguno de estos 3 roles sin repetir.
--Y para el caso concreto de empleado, que respete la regla de negocio y restricción en cuanto a los salarios de los empleados.

--Generamos los registros para tabla cliente.

INSERT INTO cliente (id_persona, telefono, direccion) VALUES
(17,'9992457812','Merida Centro 101'),
(3,'5512783490','Merida Norte 102'),
(28,'8183456721','Colonia Mexico 103'),
(11,'9998765432','Francisco de Montejo 104'),
(35,'3321456789','Altabrisa 105'),
(7,'2225678910','Las Americas 106'),
(22,'9993344556','Montebello 107'),
(1,'6678891234','Itzimna 108'),
(40,'8112233445','Campestre 109'),
(14,'9994455667','Chuburna 110'),
(26,'5533442211','Pensiones 111'),
(9,'9997788990','Temozon 112'),
(31,'3339876541','Dzitya 113'),
(5,'9991122334','San Ramon 114'),
(19,'4425566778','Caucel 115'),
(24,'9999988776','Lindavista 1'),
(12,'2293344556','Garcia Gineres 117'),
(37,'9995566778','San Angelo 118'),
(2,'8119988776','Brisas 119'),
(29,'5556677889','Leandro Valle 120'),
(8,'9996677881','Merida Centro 121'),
(33,'6142233445','Merida Norte 122'),
(16,'9997788112','Colonia Mexico 123'),
(4,'4778899001','Francisco de Montejo 124'),
(21,'9998899223','Altabrisa 125'),
(39,'8187766554','Las Americas 126'),
(10,'9999900112','Montebello 127'),
(27,'2223344112','Itzimna 128'),
(6,'9992233445','Campestre 129'),
(18,'5511122233','Chuburna 130'),
(32,'9993344665','Pensiones 131'),
(13,'3332211445','Temozon 132'),
(25,'9994455778','Dzitya 133'),
(38,'8115566443','San Ramon 134'),
(15,'9996677990','Caucel 135'),
(23,'4423344551','Lindavista 136'),
(34,'9997788009','Garcia Gineres 137'),
(20,'2299988771','San Angelo 138'),
(30,'9998899110','Brisas 139'),
(36,'4771122334','Leandro Valle 140');

--Generamos los registros para tabla empleado.

INSERT INTO empleado (id_persona, rol, salario) VALUES
(57,'Desarrollador Frontend',25000.00),
(43,'Desarrollador Backend',32000.00),
(71,'Analista de Marketing',22000.00),
(49,'Diseñador Digital',21000.00),
(65,'Desarrollador de Creadores UGC',28000.00),
(52,'Desarrollador Frontend',26000.00),
(79,'Desarrollador Backend',34000.00),
(46,'Analista de Marketing',23000.00),
(68,'Diseñador Digital',24000.00),
(55,'Desarrollador de Creadores UGC',29000.00),
(73,'Desarrollador Frontend',25500.00),
(41,'Desarrollador Backend',36000.00),
(62,'Analista de Marketing',22500.00),
(77,'Diseñador Digital',23500.00),
(50,'Desarrollador de Creadores UGC',30000.00),
(69,'Desarrollador Frontend',27000.00),
(44,'Desarrollador Backend',35000.00),
(74,'Analista de Marketing',24000.00),
(58,'Diseñador Digital',25000.00),
(80,'Desarrollador de Creadores UGC',31000.00),
(47,'Desarrollador Frontend',27500.00),
(63,'Desarrollador Backend',37000.00),
(75,'Analista de Marketing',24500.00),
(42,'Diseñador Digital',25500.00),
(66,'Desarrollador de Creadores UGC',32000.00),
(53,'Desarrollador Frontend',28000.00),
(78,'Desarrollador Backend',38000.00),
(45,'Analista de Marketing',25000.00),
(70,'Diseñador Digital',26000.00),
(56,'Desarrollador de Creadores UGC',33000.00),
(72,'Desarrollador Frontend',28500.00),
(48,'Desarrollador Backend',39000.00),
(64,'Analista de Marketing',25500.00),
(51,'Diseñador Digital',26500.00),
(76,'Desarrollador de Creadores UGC',34000.00),
(59,'Desarrollador Frontend',29000.00),
(67,'Desarrollador Backend',40000.00),
(54,'Analista de Marketing',26000.00),
(61,'Diseñador Digital',27000.00),
(60,'Desarrollador de Creadores UGC',35000.00);

--Generamos los registros para tabla creador_ugc.

INSERT INTO creador_ugc (id_persona, categoria, descripcion) VALUES
(97,'Hospitalidad y experiencias','Creador especializado en hoteles y turismo'),
(83,'Contenido para Corporativos','Creador para marcas corporativas'),
(118,'Estilo de Vida y Bienestar','Contenido wellness y fitness'),
(92,'Hogar y Tecnologia','Contenido de gadgets inteligentes'),
(105,'Hospitalidad y experiencias','Videos para restaurantes premium'),
(88,'Contenido para Corporativos','Presentaciones empresariales IA'),
(114,'Estilo de Vida y Bienestar','Contenido motivacional'),
(81,'Hogar y Tecnologia','Reseñas tecnológicas'),
(109,'Hospitalidad y experiencias','Promoción de resorts'),
(95,'Contenido para Corporativos','Videos ejecutivos'),
(120,'Estilo de Vida y Bienestar','Contenido saludable'),
(84,'Hogar y Tecnologia','Tutoriales de software'),
(111,'Hospitalidad y experiencias','Campañas hoteleras'),
(90,'Contenido para Corporativos','Branding corporativo'),
(116,'Estilo de Vida y Bienestar','Rutinas fitness'),
(86,'Hogar y Tecnologia','Contenido smart home'),
(102,'Hospitalidad y experiencias','Experiencias vacacionales'),
(113,'Contenido para Corporativos','Capacitación digital'),
(99,'Estilo de Vida y Bienestar','Meditación y salud'),
(82,'Hogar y Tecnologia','IA y automatización'),
(107,'Hospitalidad y experiencias','Experiencias culinarias'),
(91,'Contenido para Corporativos','Campañas B2B'),
(119,'Estilo de Vida y Bienestar','Contenido deportivo'),
(85,'Hogar y Tecnologia','Comparativas tech'),
(110,'Hospitalidad y experiencias','Turismo internacional'),
(94,'Contenido para Corporativos','Eventos corporativos'),
(117,'Estilo de Vida y Bienestar','Bienestar emocional'),
(87,'Hogar y Tecnologia','Tutoriales de IA'),
(104,'Hospitalidad y experiencias','Contenido turístico IA'),
(96,'Contenido para Corporativos','Contenido financiero'),
(112,'Estilo de Vida y Bienestar','Nutrición y salud'),
(89,'Hogar y Tecnologia','Dispositivos inteligentes'),
(106,'Hospitalidad y experiencias','Promoción de destinos'),
(93,'Contenido para Corporativos','Marketing empresarial'),
(115,'Estilo de Vida y Bienestar','Yoga y mindfulness'),
(98,'Hogar y Tecnologia','Contenido de programación'),
(108,'Hospitalidad y experiencias','Experiencias premium'),
(100,'Contenido para Corporativos','Servicios digitales'),
(103,'Estilo de Vida y Bienestar','Vida saludable'),
(101,'Hogar y Tecnologia','Tecnología e innovación');

--Generamos los registros para tabla servicio.
--Para estos tuvimos muy en cuenta que se respetase la regla de negocio con respecto a los costos de la mensualidad,
--así como también la restricción de que los servicios deben estar dados de alto como alguno de los tipos de paquete 'Estandar','Pro' o 'Platino'.

INSERT INTO servicio (nombre, tipo_paquete, descripcion, costo_mensualidad) VALUES
('Marketing IA Básico','Estandar','Gestión básica de contenido IA',2500.00),
('Marketing IA Pro','Pro','Automatización avanzada',5500.00),
('Marketing IA Elite','Platino','Servicio premium integral',9000.00),
('Desarrollo Web Básico','Estandar','Sitio web corporativo',3000.00),
('Desarrollo Web Pro','Pro','Web empresarial avanzada',6500.00),
('Desarrollo Web Platino','Platino','Plataforma completa',9500.00),
('Branding Digital','Estandar','Identidad visual',2800.00),
('Branding Corporativo','Pro','Branding empresarial',6200.00),
('Branding Premium','Platino','Branding completo',9800.00),
('Contenido UGC Básico','Estandar','Videos promocionales',2700.00),
('Contenido UGC Pro','Pro','Campañas completas',6700.00),
('Contenido UGC Elite','Platino','Contenido premium',9900.00),
('SEO Básico','Estandar','Optimización básica',2600.00),
('SEO Avanzado','Pro','SEO empresarial',5800.00),
('SEO Premium','Platino','SEO internacional',9200.00),
('Social Media Básico','Estandar','Gestión de redes',2400.00),
('Social Media Pro','Pro','Campañas avanzadas',5700.00),
('Social Media Elite','Platino','Estrategia integral',9100.00),
('Ecommerce Básico','Estandar','Tienda online básica',3500.00),
('Ecommerce Pro','Pro','Marketplace avanzado',7500.00),
('Ecommerce Premium','Platino','Ecommerce completo',9800.00),
('Producción IA Básica','Estandar','Contenido automatizado',2900.00),
('Producción IA Pro','Pro','Producción masiva',6800.00),
('Producción IA Elite','Platino','Producción premium',9700.00),
('Video Marketing Básico','Estandar','Videos simples',3100.00),
('Video Marketing Pro','Pro','Producción avanzada',7200.00),
('Video Marketing Elite','Platino','Contenido cinematográfico',9900.00),
('Publicidad Digital Básica','Estandar','Ads iniciales',3300.00),
('Publicidad Digital Pro','Pro','Ads escalables',7600.00),
('Publicidad Digital Elite','Platino','Ads premium',9950.00),
('Automatización Básica','Estandar','Bots simples',3400.00),
('Automatización Pro','Pro','Flujos inteligentes',7800.00),
('Automatización Elite','Platino','IA empresarial',9990.00),
('Consultoría Básica','Estandar','Asesoría inicial',2100.00),
('Consultoría Pro','Pro','Estrategia digital',6100.00),
('Consultoría Elite','Platino','Consultoría integral',9600.00),
('Analytics Básico','Estandar','Reportes simples',2300.00),
('Analytics Pro','Pro','Dashboards avanzados',6300.00),
('Analytics Elite','Platino','Analítica predictiva',9700.00),
('Transformación Digital','Platino','Migración empresarial',9999.00);

--Generamos los registros de la tabla proyectos
--Para generarlos tuvimos muy pendiente respetar la restricción de la coherencia y lógica entre la fecha de inicio y la fecha de fin, 
--de forma que esta última no sea antes que la de incio, y que a su vez se cumpla la restricción de los estados posibles para un proyecto.
INSERT INTO proyecto
(nombre, categoria, descripcion, fecha_inicio, fecha_fin, estado)
VALUES
('NexoWeb Corporate','Desarrollo Web','Desarrollo de portal corporativo para empresa financiera','2025-01-10','2025-05-20','En desarrollo'),
('BrandIA Studio','Diseño y Branding','Creación de identidad visual potenciada con IA','2025-02-01','2025-06-15','En desarrollo'),
('VisionAds AI','Marketing de Contenidos potenciado con IA','Campaña automatizada para ecommerce','2025-01-15','2025-04-30','Finalizado'),
('NovaTech Landing','Desarrollo Web','Landing page para startup tecnológica','2025-03-01','2025-06-10','En desarrollo'),
('PixelBrand','Diseño y Branding','Diseño completo de branding digital','2025-02-20','2025-07-01','Suspendido'),
('SmartContent Hub','Marketing de Contenidos potenciado con IA','Automatización de publicaciones sociales','2025-01-12','2025-05-12','Finalizado'),
('TravelUX','Desarrollo Web','Plataforma turística interactiva','2025-04-01','2025-08-15','En desarrollo'),
('CreativeFlow','Diseño y Branding','Diseño de assets visuales corporativos','2025-02-05','2025-06-05','Finalizado'),
('AI Growth Media','Marketing de Contenidos potenciado con IA','Generación masiva de contenido IA','2025-03-12','2025-07-30','En desarrollo'),
('NexoCommerce','Desarrollo Web','Tienda en línea para empresa retail','2025-01-25','2025-05-30','Finalizado'),

('BluePixel Agency','Diseño y Branding','Rediseño visual para empresa hotelera','2025-02-15','2025-06-25','En desarrollo'),
('ViralMind AI','Marketing de Contenidos potenciado con IA','Sistema IA para contenido viral','2025-03-08','2025-07-20','En desarrollo'),
('CloudSystems Web','Desarrollo Web','Portal administrativo empresarial','2025-01-11','2025-04-28','Finalizado'),
('NeoVisual','Diseño y Branding','Manual de identidad corporativa','2025-04-02','2025-08-10','En desarrollo'),
('MarketFusion AI','Marketing de Contenidos potenciado con IA','Automatización de marketing digital','2025-02-22','2025-06-18','En desarrollo'),
('DynamicWeb Pro','Desarrollo Web','Sistema web empresarial dinámico','2025-03-03','2025-07-08','Suspendido'),
('CreativeNova','Diseño y Branding','Diseño UX/UI multiplataforma','2025-01-19','2025-05-22','Finalizado'),
('IntelliCampaigns','Marketing de Contenidos potenciado con IA','Campañas optimizadas por IA','2025-03-14','2025-08-01','En desarrollo'),
('CodeSphere','Desarrollo Web','Aplicación web para reservas','2025-02-08','2025-06-30','En desarrollo'),
('BrandCraft','Diseño y Branding','Creación de marca para fintech','2025-04-05','2025-09-01','En desarrollo'),

('AI Influence','Marketing de Contenidos potenciado con IA','Creación automática de reels','2025-02-18','2025-06-28','Finalizado'),
('NextGen Portal','Desarrollo Web','Portal educativo interactivo','2025-01-22','2025-05-18','Finalizado'),
('VisualEdge','Diseño y Branding','Diseño gráfico corporativo','2025-03-07','2025-07-12','En desarrollo'),
('AutoContent AI','Marketing de Contenidos potenciado con IA','Motor IA para contenido automatizado','2025-02-11','2025-06-14','En desarrollo'),
('WebCore Solutions','Desarrollo Web','Sistema CRM empresarial','2025-01-09','2025-04-20','Finalizado'),
('DesignMasters','Diseño y Branding','Diseño de campañas digitales','2025-04-10','2025-08-30','En desarrollo'),
('SocialBoost AI','Marketing de Contenidos potenciado con IA','Optimización de engagement','2025-03-01','2025-07-05','En desarrollo'),
('FutureWeb','Desarrollo Web','Desarrollo frontend moderno','2025-02-14','2025-06-22','En desarrollo'),
('DigitalIdentity','Diseño y Branding','Branding empresarial integral','2025-03-17','2025-08-12','Suspendido'),
('AI Storytelling','Marketing de Contenidos potenciado con IA','Narrativas IA para marcas','2025-01-30','2025-05-29','Finalizado'),

('InfiniteApps','Desarrollo Web','Aplicación SaaS empresarial','2025-02-25','2025-07-18','En desarrollo'),
('VisualCreators','Diseño y Branding','Diseño creativo para ecommerce','2025-03-12','2025-08-08','En desarrollo'),
('ContentPilot AI','Marketing de Contenidos potenciado con IA','Automatización de anuncios','2025-04-01','2025-09-15','En desarrollo'),
('NexoPlatform','Desarrollo Web','Dashboard administrativo','2025-01-13','2025-05-10','Finalizado'),
('PixelForge','Diseño y Branding','Diseño visual avanzado','2025-02-16','2025-06-27','En desarrollo'),
('AdMachine AI','Marketing de Contenidos potenciado con IA','Sistema inteligente de publicidad','2025-03-21','2025-08-18','En desarrollo'),
('HyperWeb','Desarrollo Web','Sistema web para logística','2025-01-28','2025-06-02','Finalizado'),
('CreativePulse','Diseño y Branding','Diseño de identidad visual moderna','2025-04-03','2025-08-28','En desarrollo'),
('EngageAI','Marketing de Contenidos potenciado con IA','Optimización IA de contenido','2025-03-10','2025-07-29','En desarrollo'),
('QuantumSites','Desarrollo Web','Desarrollo de plataforma escalable','2025-02-09','2025-06-19','En desarrollo');

--Generamos los registros de la tabla tecnología.

INSERT INTO tecnologia
(nombre, categoria, version_tecnologia)
VALUES
('React','Framework','18.2'),
('Vue.js','Framework','3.4'),
('Angular','Framework','17'),
('Next.js','Framework','14'),
('Visual Studio Code','Editor de Código','1.92'),
('Figma','Software de Diseño Digital','2025'),
('Adobe Photoshop','Software de Diseño Digital','2024'),
('Adobe Illustrator','Software de Diseño Digital','2024'),
('ChatGPT','Modelo/Agente de IA','4.5'),
('Claude AI','Modelo/Agente de IA','3.7'),

('Gemini AI','Modelo/Agente de IA','2.5'),
('Cursor','Editor de Código','0.42'),
('PyCharm','Editor de Código','2024.1'),
('Tailwind CSS','Framework','3.4'),
('Bootstrap','Framework','5.3'),
('Canva','Software de Diseño Digital','2025'),
('MidJourney','Modelo/Agente de IA','6.0'),
('Stable Diffusion','Modelo/Agente de IA','3.5'),
('Sublime Text','Editor de Código','4'),
('WebStorm','Editor de Código','2024'),

('Node.js','Framework','22'),
('Laravel','Framework','11'),
('Django','Framework','5'),
('Framer','Software de Diseño Digital','2025'),
('Runway ML','Modelo/Agente de IA','4'),
('GitHub Copilot','Modelo/Agente de IA','2025'),
('Atom','Editor de Código','1.63'),
('Sketch','Software de Diseño Digital','2025'),
('TensorFlow','Framework','2.17'),
('PyTorch','Framework','2.4'),

('Notepad++','Editor de Código','8.6'),
('CorelDRAW','Software de Diseño Digital','2024'),
('InDesign','Software de Diseño Digital','2024'),
('Llama AI','Modelo/Agente de IA','3'),
('Replit AI','Modelo/Agente de IA','2025'),
('Nuxt.js','Framework','3.12'),
('IntelliJ IDEA','Editor de Código','2024'),
('Cinema 4D','Software de Diseño Digital','2025'),
('OpenAI API','Modelo/Agente de IA','2025'),
('Remix','Framework','2.10');

--Generamos los registros de la tabla metrica.

INSERT INTO metrica
(nombre, descripcion)
VALUES
('CTR','Porcentaje de clics en anuncios'),
('ROI','Retorno de inversión'),
('Engagement','Interacción en redes sociales'),
('Conversiones','Cantidad de conversiones logradas'),
('Bounce Rate','Porcentaje de rebote'),
('Tiempo de Sesión','Duración promedio por usuario'),
('Impresiones','Cantidad de visualizaciones'),
('Alcance','Usuarios alcanzados'),
('Leads Generados','Cantidad de clientes potenciales'),
('CPA','Costo por adquisición'),

('CPC','Costo por clic'),
('ROAS','Retorno de gasto publicitario'),
('Visitas Web','Número de visitas al sitio'),
('Retención','Porcentaje de usuarios recurrentes'),
('Suscripciones','Cantidad de registros'),
('Comentarios','Interacciones de comentarios'),
('Compartidos','Cantidad de veces compartido'),
('Likes','Número de me gusta'),
('Visualizaciones Video','Reproducciones de video'),
('Tasa Conversión','Porcentaje de conversión'),

('Usuarios Nuevos','Usuarios registrados recientemente'),
('Usuarios Activos','Usuarios activos diarios'),
('Tasa Apertura','Apertura de correos'),
('Tasa Rebote Email','Correos no entregados'),
('Descargas','Cantidad de descargas'),
('Tiempo Carga','Velocidad del sitio'),
('SEO Score','Puntuación SEO'),
('Backlinks','Enlaces externos'),
('Ranking Google','Posición en buscadores'),
('Interacciones IA','Uso de herramientas IA'),

('Costo Campaña','Costo total de campañas'),
('Retorno Clientes','Clientes recurrentes'),
('Satisfacción','Nivel de satisfacción'),
('Tickets Soporte','Solicitudes de soporte'),
('Errores Sistema','Cantidad de errores'),
('Productividad','Rendimiento operativo'),
('Automatizaciones','Procesos automatizados'),
('Tasa Crecimiento','Incremento porcentual'),
('Ingresos Generados','Ganancias obtenidas'),
('Conversiones IA','Resultados generados con IA');


--Generamos los registros de la tabla intermedia Cliente - Servicio

INSERT INTO cliente_servicio (id_cliente, id_servicio) VALUES
(1,3),
(1,7),
(2,5),
(2,1),
(3,2),
(3,8),
(4,4),
(4,6),
(5,9),
(5,10),
(6,1),
(6,5),
(7,2),
(7,7),
(8,3),
(8,9),
(9,4),
(9,8),
(10,6),
(10,2),
(11,5),
(11,10),
(12,7),
(12,1),
(13,9),
(13,4),
(14,3),
(14,6),
(15,8),
(15,2),
(16,10),
(16,5),
(17,1),
(17,7),
(18,4),
(18,9),
(19,6),
(19,3),
(20,8),
(20,10);

--Generamos los registros de la tabla intermedia Empleado - Proyecto

INSERT INTO empleado_proyecto (id_empleado, id_proyecto) VALUES
(1,5),
(1,12),
(2,3),
(2,18),
(3,7),
(3,14),
(4,2),
(4,20),
(5,9),
(5,25),
(6,1),
(6,16),
(7,11),
(7,30),
(8,4),
(8,22),
(9,8),
(9,35),
(10,6),
(10,19),
(11,13),
(11,27),
(12,10),
(12,31),
(13,15),
(13,24),
(14,17),
(14,40),
(15,21),
(15,33),
(16,26),
(16,38),
(17,23),
(17,29),
(18,28),
(18,36),
(19,32),
(19,39),
(20,34),
(20,37);

--Generamos los registros de la tabla intermedia Creador_UGC - Proyecto

INSERT INTO creadorugc_proyecto (id_creador_ugc, id_proyecto) VALUES
(1,2),
(1,9),
(2,5),
(2,14),
(3,8),
(3,20),
(4,1),
(4,11),
(5,6),
(5,18),
(6,3),
(6,24),
(7,7),
(7,30),
(8,4),
(8,16),
(9,10),
(9,28),
(10,12),
(10,35),
(11,15),
(11,22),
(12,19),
(12,40),
(13,13),
(13,26),
(14,17),
(14,31),
(15,21),
(15,37),
(16,23),
(16,33),
(17,25),
(17,38),
(18,27),
(18,34),
(19,29),
(19,36),
(20,32),
(20,39);

--Generamos los registros de la tabla intermedia Proyecto - Tecnología

INSERT INTO proyecto_tecnologia (id_proyecto, id_tecnologia) VALUES
(1,1),
(1,5),
(2,6),
(2,9),
(3,10),
(3,17),
(4,2),
(4,14),
(5,7),
(5,16),
(6,11),
(6,18),
(7,3),
(7,21),
(8,8),
(8,24),
(9,25),
(9,39),
(10,4),
(10,15),
(11,32),
(11,38),
(12,26),
(12,40),
(13,22),
(13,12),
(14,28),
(14,33),
(15,34),
(15,35),
(16,23),
(16,29),
(17,13),
(17,19),
(18,20),
(18,27),
(19,30),
(19,36),
(20,31),
(20,37);

--Generamos los registros de la tabla intermedia Proyecto - Metrica

INSERT INTO proyecto_metrica (id_proyecto, id_metrica) VALUES
(1,1),
(1,5),
(2,3),
(2,8),
(3,2),
(3,10),
(4,4),
(4,12),
(5,6),
(5,15),
(6,7),
(6,18),
(7,9),
(7,20),
(8,11),
(8,22),
(9,13),
(9,25),
(10,14),
(10,30),
(11,16),
(11,35),
(12,17),
(12,40),
(13,19),
(13,28),
(14,21),
(14,24),
(15,23),
(15,27),
(16,26),
(16,32),
(17,29),
(17,34),
(18,31),
(18,36),
(19,33),
(19,37),
(20,38),
(20,39);


--En esta sección creamos las querys avavanzadas para poder consultar datos de interes de las tablas.


--QUERY 1: Mostrar el nombre completo del cliente, 
--el servicio contratado y el costo de mensualidad, 
--ordenados del servicio más caro al más barato.

SELECT p.nombre AS cliente, p.apellido, s.nombre AS servicio, costo_mensualidad 
FROM cliente_servicio cs
JOIN servicio s ON s.id = cs.id_servicio
JOIN cliente c ON c.id = cs.id_cliente
JOIN persona p ON p.id = c.id_persona 
ORDER BY s.costo_mensualidad DESC;


---QUERY 2: Mostrar la cantidad de proyectos por categoría.
SELECT categoria, COUNT(*) AS cant_proyectos 
FROM proyecto
GROUP BY categoria;

-- QUERY 3: Tecnologías más utilizadas, mostrar el nombre,
-- categoría, cantidad de veces que es empleada en proyectos.
--Y presenarlas de la que tiene mayor a la que tiene menor uso.

SELECT t.nombre AS tecnologia, t.categoria, COUNT(*) AS cant_proyectos 
FROM proyecto_tecnologia pt 
JOIN tecnologia t ON t.id = pt.id_tecnologia
GROUP BY t.nombre, t.categoria
ORDER BY cant_proyectos DESC;

-- QUERY 4: Mostrar los proyectos dados de alta y el o los creadores UGC
-- que forman parte de cada uno.

SELECT pro.nombre AS proyecto, per.nombre AS agentes_ugc, per.apellido
FROM creadorugc_proyecto crpro
JOIN creador_ugc cu ON cu.id = crpro.id_creador_ugc
JOIN persona per ON per.id = cu.id_persona
JOIN proyecto pro ON pro.id = crpro.id_proyecto;

--QUERY 5: Mostrar aquellos empleados que participan en más proyectos.

SELECT p.nombre AS empleado, p.apellido, COUNT(*) AS cant_proyectos
FROM empleado_proyecto ep 
JOIN empleado e ON e.id = ep.id_empleado
JOIN persona p ON p.id = e.id_persona
GROUP BY p.nombre, p.apellido
HAVING COUNT(*) > 1;

--QUERY 6: Mostrar el último proyecto registrado
--de cada categoría según su fecha de inicio.

SELECT DISTINCT ON (pro.categoria) pro.nombre AS proyecto, pro.fecha_inicio, pro.categoria
FROM proyecto pro
ORDER BY categoria, fecha_inicio DESC;


--QUERY 7: Mostrar los proyectos que utilizan más de una tecnología.

WITH tecnologias_por_proyecto AS (
    SELECT p.nombre AS proyecto, COUNT(*) AS cant_tecnologias
    FROM proyecto_tecnologia pt
    JOIN proyecto p ON p.id = pt.id_proyecto
    GROUP BY p.nombre
)
SELECT *
FROM tecnologias_por_proyecto
WHERE cant_tecnologias > 1;


-- En esta sección creamos 3 tipos de reportes, uno general de la base de datos,
--uno agrupado y uno de análisis.

-- REPORTE GENERAL: Totales generales del sistema.
SELECT 
    (SELECT COUNT(*) FROM cliente) AS total_clientes,
    (SELECT COUNT(*) FROM empleado) AS total_empleados,
    (SELECT COUNT(*) FROM creador_ugc) AS total_creadores_ugc,
    (SELECT COUNT(*) FROM proyecto) AS total_proyectos,
    (SELECT COUNT(*) FROM servicio) AS total_servicios,
    (SELECT COUNT(*) FROM tecnologia) AS total_tecnologias,
    (SELECT COUNT(*) FROM metrica) AS total_metricas,
    (SELECT COUNT(*) FROM proyecto WHERE estado = 'Finalizado') AS proyectos_finalizados,
    (SELECT COUNT(*) FROM proyecto WHERE estado = 'En desarrollo') AS proyectos_en_desarrollo;


-- REPORTE AGRUPADO: Reporte por categoría de proyecto

SELECT 
    p.categoria,
    COUNT(*) AS total_proyectos,
    COUNT(*) FILTER (WHERE p.estado = 'Finalizado') AS proyectos_finalizados,
    COUNT(*) FILTER (WHERE p.estado = 'En desarrollo') AS proyectos_desarrollo,
    COUNT(*) FILTER (WHERE p.estado = 'Suspendido') AS proyectos_suspendidos,
    AVG(
        p.fecha_fin - p.fecha_inicio
    ) AS promedio_duracion_dias

FROM proyecto p

GROUP BY p.categoria

HAVING COUNT(*) >= 3

ORDER BY total_proyectos DESC;

-- REPORTE DE ANÁLISIS: Proyectos con mayor cantidad de empleados participando.

SELECT 
    p.nombre AS proyecto,
    p.categoria,
    p.estado, 

    COUNT(DISTINCT ep.id_empleado) AS total_empleados,

    COUNT(DISTINCT cp.id_creador_ugc) AS total_creadores_ugc,

    COUNT(DISTINCT pt.id_tecnologia) AS total_tecnologias,

    (
        COUNT(DISTINCT ep.id_empleado) +
        COUNT(DISTINCT cp.id_creador_ugc)
    ) AS total_participantes

FROM proyecto p

LEFT JOIN empleado_proyecto ep
ON ep.id_proyecto = p.id

LEFT JOIN creadorugc_proyecto cp
ON cp.id_proyecto = p.id

LEFT JOIN proyecto_tecnologia pt
ON pt.id_proyecto = p.id

GROUP BY p.id, p.nombre, p.categoria, p.estado

HAVING COUNT(DISTINCT ep.id_empleado) >= 1

ORDER BY total_participantes DESC, total_tecnologias DESC;


--En esta sección creamos una transacción en la cuál 
--insertamos un nuevo cliente, empleado y creador_ugc.

BEGIN;

INSERT INTO persona(nombre, apellido, email)
VALUES('Daniel','Gordillo','danielgor@gmail.com');

INSERT INTO cliente(id_persona, telefono, direccion)
VALUES(currval('persona_id_seq'),'9991234567','Las Américas 150');

COMMIT;


BEGIN;

INSERT INTO persona(nombre, apellido, email)
VALUES('Jorge','Barrero','jorgebarr@gmail.com');

INSERT INTO empleado(id_persona, rol, salario)
VALUES(122,'Desarrollador Backend',35000);

COMMIT;

BEGIN;

INSERT INTO persona(nombre, apellido, email)
VALUES('Jonathan','Martinez','jonmar@gmail.com');

INSERT INTO creador_ugc(id_persona, categoria, descripcion)
VALUES(123, 'Estilo de Vida y Bienestar', 'Creador virtual especializado en contenido lifestyle');

COMMIT;

-- Insertar suscripciones por defecto
INSERT INTO tipo_suscripcion (nombre, precio, descripcion, caracteristicas, limite_proyectos, badge_text) VALUES 
('estandar', 499.00, 'Ideal para comenzar con tu primer proyecto.', '{"support": "Email", "analytics": "Básico", "storage": "5GB"}', 1, 'Básico'),
('pro', 999.00, 'Perfecto para negocios en crecimiento.', '{"support": "24/7", "analytics": "Avanzado", "storage": "50GB"}', 5, 'Popular'),
('platino', 1999.00, 'La solución completa para grandes empresas.', '{"support": "Prioritario", "analytics": "Personalizado", "storage": "Ilimitado"}', -1, 'Premium');

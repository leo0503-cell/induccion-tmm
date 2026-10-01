/* Contenido del curso de inducción TMM.
   Fuente: deck "CURSO VENTAS ABRIL 2026 - Template TMM" (173 láminas) y guion del
   video institucional (datos corporativos confirmados por Leonardo, sept 2026).
   Tipos de pantalla: intro, texto, puntos, escalera, voltea, compara, tabla, cifras,
   barras, dona, productos, galeria, comic, cita, logos, cocina, nube, respira,
   ranking, reflexion, pregunta, vf, relaciona, ordena, clasifica, gestos. */
window.CURSO = {
  modulos: [
    /* ───────────────────────── 0 · CONOCE TMM ───────────────────────── */
    {
      id: "conoce",
      titulo: "Conoce TMM",
      sub: "Quiénes somos, qué vendemos y cómo trabajamos",
      rino: "rino_saludo",
      portada: "bodega",
      minutos: 8,
      pasos: [
        {
          t: "intro",
          titulo: "Bienvenido a Triplay y Maderas de Mayoreo",
          sub: "¡Tenemos la madera!",
          texto:
            "Este curso es tu primer recorrido por la empresa: lo que somos, lo que vendemos y la forma en que atendemos a nuestros clientes. Avanza a tu ritmo; cada módulo termina con una práctica corta.",
          rino: "rino_saludo",
        },
        {
          t: "cifras",
          titulo: "Una trayectoria que se mide en madera",
          img: "almacen",
          items: [
            { n: 35, txt: "años", nota: "comprometidos con la industria maderera" },
            { n: 22, pre: "+", txt: "estados", nota: "con presencia en el país" },
            { n: 25, txt: "países", nota: "de origen, en los 5 continentes" },
            { n: 3, txt: "almacenes", nota: "en la República Mexicana" },
          ],
        },
        {
          t: "texto",
          titulo: "Importación y distribución",
          img: "puerto",
          cuerpo:
            "Distribuimos producto nacional e internacional desde 25 países de los 5 continentes.",
          chipsTitulo: "Algunos de nuestros orígenes",
          chips: [
            "Canadá", "EUA", "Brasil", "Chile", "Uruguay", "Argentina", "Perú", "Colombia",
            "Rumania", "Rusia", "China", "Malasia", "Tailandia", "Indonesia", "Nueva Zelanda",
          ],
        },
        {
          t: "compara",
          titulo: "Una mezcla a la medida de cada obra",
          a: { titulo: "Construcción", items: ["Cimbras", "OSB (Astilla)", "Celotex"] },
          b: {
            titulo: "Carpintería",
            items: ["Triplay / Triplay finos", "Maderas finas", "Melaminas", "MDF / MDF Enchapados", "Aglomerados"],
          },
        },
        {
          t: "galeria",
          titulo: "Las chapas que manejamos",
          texto:
            "Tzalam · Encino · Nogal · Albasia · Okume · Caobilla · Parota · Parotilla · Pino · Cedro · Rosa Morada · Cumala Pencil. Para mueblería, revestimientos y construcción.",
          imgs: [
            { img: "chapas_a", pie: "Tzalam, Encino, Nogal, Albasia, Okume, Caobilla" },
            { img: "chapas_b", pie: "Parota, Parotilla, Pino, Cedro, Rosa Morada, Cumala Pencil" },
          ],
        },
        {
          t: "texto",
          titulo: "Entregamos en las instalaciones del cliente",
          img: "camion",
          imgAlto: true,
          grande: "Desde 2 paquetes hasta 1 tráiler.",
          cuerpo:
            "Soluciones en tiempo y forma: 3 almacenes en la República Mexicana para responder a las necesidades de cada cliente.",
        },
        {
          t: "voltea",
          titulo: "Lo que nos hace diferentes",
          ayuda: "Toca cada tarjeta para voltearla.",
          cartas: [
            { frente: "Entregas oportunas", reverso: "Distribuimos los principales productos nacionales e internacionales." },
            { frente: "Asesoría personalizada", reverso: "Vendedores expertos en productos maderables, listos para asesorar en todo momento." },
            { frente: "Calidad del producto", reverso: "El producto que el cliente requiere, con la calidad que necesita y al mejor precio." },
            { frente: "Productos sostenibles", reverso: "De bosques sustentables, con proveedores certificados FSC y Eco-Friendly." },
          ],
        },
        {
          t: "texto",
          titulo: "Nuestra esencia",
          img: "bosque",
          bloques: [
            { k: "Misión", v: "Generar valor para todos con una amplia oferta de productos sustentables, disponibilidad y entregas puntuales." },
            { k: "Visión", v: "Ser el referente en la industria maderera como una empresa humana, responsable y de alto desempeño." },
          ],
        },
        {
          t: "puntos",
          titulo: "Nuestros valores",
          ayuda: "Toca para descubrir cada uno.",
          grandes: true,
          items: ["Integridad", "Pasión", "Prosperidad", "Trabajo en equipo"],
        },
        {
          t: "logos",
          titulo: "Proveedores de talla mundial y certificaciones",
          grupos: [
            { titulo: "Alianzas estratégicas", logos: ["prov_arauco", "prov_segezha", "prov_eagon", "prov_lumin"] },
            { titulo: "Respaldo que nos distingue", logos: ["cert_esr", "cert_canainma", "cert_imexfor", "cert_hecho_mexico"] },
          ],
          nota: "Todos nuestros productos provienen de bosques sustentables.",
        },
        {
          t: "sucursales",
          titulo: "Nuestras sucursales",
          items: [
            { k: "Aguascalientes", v: "José Antonio #108, Parque Industrial Siglo XXI, CP 20283, Aguascalientes, Ags." },
            { k: "Guadalajara", v: "Camino Tala - San Isidro 76, km 12.5, CP 45340, San Isidro Mazatepec, Jal." },
            { k: "Ciudad de México", v: "Cerrada de Acalotenco #237, Col. San Sebastián, CP 02040, Azcapotzalco, CDMX" },
          ],
          horario: "Lunes a viernes de 8:30 a 18:30 h · Sábados de 8:30 a 14:00 h",
          contacto: "www.triplayymaderas.com · (449) 343 52 93",
        },
        { t: "pregunta", q: "¿Cuántos años cumple TMM?", ops: ["25 años", "35 años", "22 años"], ok: 1, exp: "Cumplimos 35 años comprometidos con la industria maderera." },
        { t: "pregunta", q: "Un cliente pregunta cuál es el pedido mínimo con entrega. ¿Qué le dices?", ops: ["Desde 1 paquete", "Desde 2 paquetes hasta 1 tráiler", "Solo tráiler completo"], ok: 1, exp: "Entregamos desde 2 paquetes hasta 1 tráiler." },
        {
          t: "relaciona",
          titulo: "Une cada almacén con su ubicación",
          pares: [
            { a: "Aguascalientes", b: "Parque Industrial Siglo XXI" },
            { a: "Guadalajara", b: "San Isidro Mazatepec" },
            { a: "Ciudad de México", b: "Azcapotzalco" },
          ],
        },
        { t: "vf", q: "Todos nuestros productos provienen de bosques sustentables.", ok: true, exp: "Así es: trabajamos con proveedores certificados FSC y Eco-Friendly, entre otras certificaciones." },
      ],
    },

    /* ───────────────────────── 1 · ULTRA ───────────────────────── */
    {
      id: "ultra",
      titulo: "Ultra: interiorismo accesible",
      sub: "Melamina, alto brillo, matt, WPC y PVC",
      rino: "rino_maestro",
      portada: "u_matt2",
      minutos: 12,
      pasos: [
        {
          t: "intro",
          titulo: "Ultra: interiorismo accesible con enfoque estratégico",
          sub: "Línea de producto de TMM",
          texto:
            "Vas a entender por qué existe Ultra, para quién es y qué hace a cada material diferente frente a la competencia.",
          rino: "rino_maestro",
          logo: "u_logo",
        },
        {
          t: "texto",
          titulo: "El mercado ya no compra solo materiales",
          img: "u_mercado",
          lista: ["Compra soluciones completas", "Valora la rapidez de instalación", "Prioriza el diseño y el impacto visual"],
          bloques: [
            { k: "Accesibilidad", v: "Equilibrio entre precio y calidad." },
            { k: "Estética", v: "Diseños actuales y funcionales." },
            { k: "Disponibilidad", v: "Inventario constante para ejecución inmediata." },
          ],
          grande: "No estamos entrando a una categoría… estamos creando una.",
        },
        {
          t: "escalera",
          titulo: "Integración: dominar el juego completo",
          texto:
            "Apple no vende un producto: controla toda la experiencia. Integra productos, servicios y experiencia en todo el ciclo del cliente, con múltiples ventas en distintas etapas sin perderlo.",
          img: "u_apple",
          pasos: [
            { k: "Entrada", v: "iPhone" },
            { k: "Complemento", v: "Cargador / servicios" },
            { k: "Expansión", v: "AirPods" },
            { k: "Integración total", v: "Apple Watch" },
          ],
        },
        {
          t: "escalera",
          titulo: "Desde la obra gris hasta la obra blanca",
          texto: "No son dos mercados distintos. Es un mismo cliente en diferentes etapas del proyecto.",
          pasos: [
            { k: "Construcción", v: "Cimbra, triplay" },
            { k: "Interiorismo", v: "Ultra y acabados" },
            { k: "Detalle y funcionalidad", v: "Herrajes, canto, iluminación" },
          ],
        },
        {
          t: "texto",
          titulo: "Perfil del cliente Ultra",
          img: "u_cliente",
          cuerpo: "No basta con tener un buen producto: hay que entender para quién es.",
          columnas: [
            { titulo: "Target", items: ["Carpintero evolucionado", "Instalador", "Desarrollador", "Consumidor final aspiracional"] },
            { titulo: "¿Qué busca?", items: ["Interiorismo accesible", "Materiales listos para instalar", "Alto impacto visual", "Menos proceso, más solución"] },
          ],
        },
        {
          t: "texto",
          titulo: "Melamina: la estructura del proyecto",
          img: "u_melamina",
          imgAlto: true,
          cuerpo:
            "La melamina es un tablero con sustrato MDF o aglomerado, recubierto mediante presión y calor con un papel decorativo que le da textura y acabado. No nace como tendencia: nace como solución para reducir costos, estandarizar procesos y producir en volumen.",
          dato: { n: "690", u: "kg/m³", txt: "Aunque en el mercado todo se llame igual, la diferencia real está en la densidad del tablero." },
          lista: ["Mejor corte", "Menor pandeo", "Mejor acabado", "Mayor vida útil de herramienta"],
        },
        {
          t: "compara",
          titulo: "Melamina: el problema y la propuesta Ultra",
          img: "u_modelos",
          a: { titulo: "El problema", tono: "mal", items: ["Catálogos saturados con más de 20 diseños", "Competencia por precio", "Poca diferenciación"] },
          b: { titulo: "Propuesta Ultra", tono: "bien", items: ["Menos de 15 diseños activos", "Alta rotación", "Inventario constante", "Disponibilidad inmediata"] },
          nota: "No es un catálogo extenso: es una selección pensada en lo que realmente rota y se vende.",
        },
        {
          t: "texto",
          titulo: "Ultra High Gloss: de nicho premium a solución accesible",
          img: "u_altobrillo",
          imgAlto: true,
          cuerpo:
            "El alto brillo era un producto premium, limitado a proyectos de alta gama y operado por pocos importadores. El tablero alto brillo se lamina sobre sustrato MDF con distintos insumos: PET (el de Ultra), acrílico o laca UV.",
          columnas: [{ titulo: "Características del PET", items: ["Ecoamigable", "Resistencia a rayos UV", "Resistencia estándar a rayaduras", "Acabado efecto espejo"] }],
        },
        {
          t: "tabla",
          titulo: "High Gloss blanco 18 mm: comparativo de mercado",
          nota: "Precios de lista y con descuento tal como vienen en el curso de ventas de abril 2026. Material de uso interno.",
          cols: ["Importador", "Marca", "Origen", "Acabado", "Medida", "Espesor", "$ lista", "$ con descuento", "Densidad"],
          filas: [
            ["TMM", "ULTRA", "Asia", "PET", "1.22 x 2.44", "18 mm", "$950.00", "$807.50", "Estándar"],
            ["Barcocinas", "Arcadia", "Asia", "PET", "1.22 x 2.44", "18 mm", "$1,350.00", "$1,147.50", "Ligera"],
            ["Polanco", "Importec", "Asia", "Laca UV", "1.22 x 2.44", "18 mm", "$1,487.00", "$1,263.95", "Ligera"],
            ["Grupo Barrera", "Barroca", "Asia", "PET", "1.22 x 2.44", "18 mm", "$1,560.00", "$1,326.00", "Ligera"],
            ["Grupo Madeira", "Madelam", "Asia", "Laca UV", "1.22 x 2.44", "18 mm", "$1,724.00", "$1,465.40", "Estándar"],
            ["Grupo Cebra", "Navetta", "Asia", "N/A", "1.22 x 2.44", "18 mm", "$1,900.00", "$1,615.00", "Ligera"],
            ["Comsa", "Merino", "India", "Laca UV", "1.22 x 2.44", "18 mm", "$1,992.00", "$1,693.20", "Estándar"],
          ],
          destacar: 0,
        },
        {
          t: "texto",
          titulo: "Ultra Matt: la esencia de la alta gama a un precio inteligente",
          img: "u_matt",
          imgAlto: true,
          cuerpo:
            "Acabado sin reflejo, con tacto suave y estética moderna. El PET Matt es un recubrimiento termoplástico de alta ingeniería que se lamina en plano con presión y calor sobre MDF: superficie uniforme, cerrada y altamente resistente.",
          lista: ["Acabado sin reflejo (ultra mate)", "Disimula huellas: menor mantenimiento", "Suave al tacto: percepción premium", "Ecoamigable"],
        },
        {
          t: "cocina",
          titulo: "Modelo de aplicación (clave)",
          texto: "Toca cada zona de la cocina para ver qué material conviene y por qué.",
          zonas: [
            { id: "alta", k: "Parte alta", v: "Alto brillo / súper mate", por: "Ahí está el impacto visual." },
            { id: "baja", k: "Parte baja", v: "Melamina", por: "Optimiza el costo del proyecto." },
          ],
        },
        {
          t: "texto",
          titulo: "WPC para interiores: de material técnico a elemento de diseño",
          img: "u_wpc2",
          imgAlto: true,
          cuerpo:
            "Compuesto de fibra de madera y plástico (como polietileno o polipropileno) que combina la apariencia de la madera con la resistencia del plástico.",
          columnas: [
            { titulo: "Ventajas", items: ["No se deforma con humedad", "No requiere mantenimiento", "No le afectan termitas", "Estable en el tiempo", "Ecoamigable"] },
            { titulo: "Qué resuelve", items: ["Instalación rápida (menos carpintería)", "Alta durabilidad", "Bajo mantenimiento", "Aplicación inmediata en muros"] },
          ],
        },
        {
          t: "compara",
          titulo: "WPC: nuestra competencia frente a Ultra",
          img: "u_wpc_cat",
          a: { titulo: "Modelo tradicional", tono: "mal", items: ["Amplio catálogo (15+ diseños)", "Enfoque en variedad", "Interior y exterior", "Disponibilidad limitada", "Resultado: elección compleja, baja rotación"] },
          b: { titulo: "Modelo Ultra", tono: "bien", items: ["Portafolio curado (diseños clave)", "Enfoque en interiorismo", "Aplicaciones claras", "Disponibilidad constante", "Resultado: decisión rápida, mayor rotación"] },
        },
        {
          t: "cifras",
          titulo: "PVC: impacto sin proceso",
          img: "u_pvc",
          texto:
            "Lámina rígida de policloruro de vinilo para interiores que replica acabados tipo mármol en gran formato. Convierte un acabado complejo en una solución lista para instalar, con adhesivo de contacto y sin uniones visibles de piso a techo.",
          items: [
            { n: "122 x 290", txt: "cm", nota: "formato" },
            { n: 3, txt: "mm", nota: "de espesor" },
            { n: 0, txt: "%", nota: "absorción de agua" },
          ],
          lista: ["Resistencia al fuego: aprobado (no propagación significativa)", "Emisión de formaldehído: no detectable"],
        },
        {
          t: "cita",
          texto: "El mercado ya existe, el producto también… lo que hacía falta era el modelo correcto. Eso es ULTRA.",
          img: "u_pvc_cat",
        },
        { t: "pregunta", q: "¿Dónde está la diferencia real entre una melamina y otra?", ops: ["En el color del papel", "En la densidad del tablero", "En el nombre comercial"], ok: 1, exp: "La densidad (690 kg/m³ en Ultra) da mejor corte, menos pandeo y mejor acabado." },
        { t: "pregunta", q: "En el modelo de aplicación Ultra, ¿qué material va en la parte baja del mueble?", ops: ["Alto brillo", "Súper mate", "Melamina"], ok: 2, exp: "Abajo melamina para optimizar costo; arriba alto brillo o súper mate para impacto visual." },
        {
          t: "relaciona",
          titulo: "Une cada material con su rasgo",
          pares: [
            { a: "Melamina", b: "Es la estructura del proyecto" },
            { a: "High Gloss PET", b: "Acabado efecto espejo" },
            { a: "Ultra Matt", b: "Disimula huellas" },
            { a: "WPC", b: "No se deforma con humedad" },
            { a: "PVC", b: "Mármol de piso a techo" },
          ],
        },
        { t: "vf", q: "El PVC de Ultra absorbe agua, por eso solo va en zonas secas.", ok: false, exp: "Su absorción de agua es 0%." },
      ],
    },

    /* ───────────────────────── 2 · TRIPLAY DE PINO Y CIMBRA ───────────────────────── */
    {
      id: "pino",
      titulo: "Triplay de pino y cimbra",
      sub: "Orígenes, calidades y para qué sirve cada uno",
      rino: "rino_triplay",
      portada: "p_cmpc",
      minutos: 9,
      pasos: [
        {
          t: "intro",
          titulo: "Triplay de pino",
          sub: "Carpintería, interiorismo y cimbra",
          texto:
            "Cada origen tiene su carácter: unos buscan apariencia, otros resistencia y otros precio. Aprende a recomendar el correcto según el uso del cliente.",
          rino: "rino_triplay",
        },
        {
          t: "productos",
          titulo: "Triplay de pino para carpintería",
          ayuda: "Toca cada hoja para ver su ficha.",
          items: [
            { img: "p_uruply_bc", nombre: "Uruply BC", origen: "Uruguay", tag: "Balance costo-apariencia", txt: "Buena cara estética, ligero y versátil. Ideal para muebles e interiores." },
            { img: "p_uruply_bcx", nombre: "Uruply BCX", origen: "Uruguay", tag: "Versatilidad por rendimiento", txt: "Calidad industrial: 60–80% usable para carpintería; el resto para usos económicos o cimbra." },
            { img: "p_asia", nombre: "Pino Asia AB / BC", origen: "Asia", tag: "Precio bajo", txt: "Muy accesible y ligero. Buena opción económica, pero con variabilidad en calidad." },
            { img: "p_eagon", nombre: "Pino Chileno Eagon BC", origen: "Chile", tag: "Consistencia", txt: "Más uniforme y confiable. Mejor consistencia, ligeramente más caro." },
            { img: "p_leonera", nombre: "Pino Chileno Leonera BC", origen: "Chile", tag: "Alta resistencia", txt: "Enfoque estructural: más resistencia que estética." },
            { img: "p_cmpc", nombre: "Pino Argentino CMPC BC", origen: "Argentina", tag: "Balance calidad-precio", txt: "Calidad media-alta. Buen equilibrio entre precio, resistencia y acabado." },
          ],
        },
        {
          t: "tabla",
          titulo: "Comparativo: triplay de pino para carpintería",
          cols: ["Producto", "Origen", "Madera", "Calidad", "Características", "Uso principal", "Ventaja"],
          filas: [
            ["Uruply BC", "Uruguay", "Pino elliottii", "BC", "Una cara buena, otra con detalles", "Muebles, interiores", "Balance costo-apariencia"],
            ["Uruply BCX", "Uruguay", "Pino", "BCX", "Calidad industrial, 60–80% útil", "Carpintería económica / cimbra", "Versatilidad por rendimiento"],
            ["Asia AB / BC", "Asia", "Pino radiata / mezclas", "AB / BC", "Ligero, chapa delgada, no se lija", "Muebles económicos", "Precio bajo"],
            ["Chileno Eagon BC", "Chile", "Pino radiata", "BC", "Uniforme, confiable", "Muebles, construcción ligera", "Consistencia en calidad"],
            ["Chileno Leonera BC", "Chile", "Pino radiata", "BC", "Más estructural que estético", "Construcción, cimbra", "Alta resistencia"],
            ["Argentino CMPC BC", "Argentina", "Pino taeda", "BC", "Buena uniformidad y resistencia", "Muebles, carpintería", "Balance calidad-precio"],
          ],
        },
        {
          t: "productos",
          titulo: "Triplay para cimbra",
          ayuda: "Toca cada hoja para ver su ficha.",
          items: [
            { img: "c_asia", nombre: "Cimbra Asia (Poplar / Combi Core)", origen: "Asia", tag: "Ligera", txt: "Más ligera y fácil de manejar. Menor resistencia en poplar; la combinada es más resistente." },
            { img: "c_durax", nombre: "Dura X (Natural / Roja)", origen: "Nacional", tag: "Hasta 10 usos", txt: "Alta durabilidad: hasta 10 usos la Natural. La Roja tiene menor desempeño." },
            { img: "c_brasil", nombre: "Brasil C+/C y BG", origen: "Brasil", tag: "Costo-beneficio", txt: "C+/C: buena relación costo-desempeño (3–4 usos). BG: calidad baja, uso limitado (1 uso aprox.)." },
            { img: "c_argentina", nombre: "Argentina C+/C", origen: "Argentina", tag: "Opción balanceada", txt: "Similar a Brasil, buena opción balanceada." },
            { img: "c_leonera", nombre: "Chileno Leonera CD", origen: "Chile", tag: "Construcción pesada", txt: "Alta resistencia para construcción pesada." },
          ],
        },
        {
          t: "tabla",
          titulo: "Comparativo: triplay para cimbra",
          cols: ["Producto", "Origen", "Material", "Calidad", "Características", "Usos aprox.", "Uso principal", "Ventaja"],
          filas: [
            ["Uruply CDX", "Uruguay/Brasil", "Pino", "CDX", "Resistente, acabado rústico", "3–4", "Cimbra", "Durabilidad en obra"],
            ["Uruply CDX Lijado", "Uruguay", "Pino", "CDX", "Mejor acabado superficial", "3–4", "Cimbra visible", "Mejor acabado concreto"],
            ["Uruply CDX Eucalipto", "Uruguay", "Eucalipto", "CDX", "Más denso y resistente", "3–4", "Cimbra pesada", "Mayor dureza"],
            ["Asia CDX Poplar", "Asia", "Poplar", "CDX", "Ligero, fácil manejo", "3–4", "Cimbra ligera", "Facilidad de uso"],
            ["Asia CDX Combi Core", "Asia", "Poplar + Eucalipto", "CDX", "Más resistente que poplar", "3–4", "Cimbra media", "Balance peso-resistencia"],
            ["Dura X Natural", "Nacional", "Pino", "Especial", "Alta durabilidad", "Hasta 10", "Cimbra intensiva", "Mayor reutilización"],
            ["Dura X Roja", "Nacional", "Pino", "Baja", "Más defectos", "Menos usos", "Cimbra económica", "Bajo costo"],
            ["Brasil C+/C", "Brasil", "Pino elliottii", "C+/C", "Cara con resanes", "3–4", "Cimbra", "Costo-beneficio"],
            ["Brasil BG", "Brasil", "Pino", "BG", "Baja calidad, sin control", "1", "Uso temporal", "Precio muy bajo"],
            ["Argentina C+/C", "Argentina", "Pino elliottii", "C+/C", "Similar a Brasil", "3–4", "Cimbra", "Opción balanceada"],
            ["Chileno Leonera CD", "Chile", "Pino radiata", "CD", "Alta resistencia", "3–4", "Construcción pesada", "Desempeño estructural"],
          ],
        },
        { t: "pregunta", rino: "rino_pensando", q: "Un constructor quiere la cimbra que más veces pueda reutilizar de esta lista. ¿Cuál le recomiendas?", ops: ["Brasil BG", "Dura X Natural", "Asia CDX Poplar"], ok: 1, exp: "Dura X Natural llega hasta 10 usos; Brasil BG apenas 1." },
        { t: "pregunta", rino: "rino_pensando", q: "Un carpintero busca buena cara para muebles de interior con buen balance entre costo y apariencia.", ops: ["Uruply BC", "Chileno Leonera CD", "Brasil BG"], ok: 0, exp: "Uruply BC: buena cara estética, ligero y versátil." },
        { t: "pregunta", rino: "rino_pensando", q: "Obra de construcción pesada que necesita desempeño estructural.", ops: ["Pino Asia AB / BC", "Chileno Leonera CD", "Uruply BCX"], ok: 1, exp: "Chileno Leonera CD: alta resistencia para construcción pesada." },
        {
          t: "relaciona",
          titulo: "Une cada triplay con su origen",
          pares: [
            { a: "Uruply BC", b: "Uruguay" },
            { a: "Eagon BC", b: "Chile" },
            { a: "CMPC BC", b: "Argentina" },
            { a: "Dura X", b: "Nacional" },
          ],
        },
        { t: "vf", q: "Del Uruply BCX solo entre el 60 y el 80% es usable para carpintería.", ok: true, exp: "Es calidad industrial; el resto se aprovecha en usos económicos o cimbra." },
      ],
    },

    /* ───────────────────────── 3 · TRIPLAY FANCY Y CAOBILLAS ───────────────────────── */
    {
      id: "fancy",
      titulo: "Triplay Fancy y caobillas",
      sub: "Chapas finas, calidades y cómo distinguirlas",
      rino: "rino_lupa",
      portada: "f_dif2",
      minutos: 10,
      pasos: [
        {
          t: "intro",
          titulo: "Triplay Fancy",
          sub: "Todo el triplay con chapa diferente a la de pino",
          texto:
            "Objetivo: entender el triplay con chapa distinta a la de pino (sin contar caobillas), sus calidades, orígenes y cómo se compara con la competencia.",
          rino: "rino_lupa",
        },
        {
          t: "texto",
          titulo: "¿Qué es un triplay Fancy?",
          img: "f_fancy1",
          imgAlto: true,
          cuerpo:
            "Tablero de madera contrachapada de alta calidad, diseñado para acabados estéticos superiores en ebanistería y carpintería interior. A diferencia del triplay estructural, el fancy se enfoca en la apariencia: caras limpias y vetas seleccionadas.",
          grande: "Fancy: elegante, lujoso, sofisticado.",
        },
        {
          t: "texto",
          titulo: "Listón Fancy",
          img: "f_liston1",
          cuerpo:
            "El listón contrachapado se adapta a una gran variedad de aplicaciones: carpintería, construcción, decoración y diseño de interiores. Es fácil de cortar y trabajar, resistente y de bajo costo, ideal para proyectos profesionales y de bricolaje.",
        },
        {
          t: "cifras",
          titulo: "Especificaciones Triplay y Listón Fancy",
          texto: "Especies comunes: Cedro, Encino, Nogal, Okume, Parota, Sapelli. Para muebles de diseño, cocinas integrales, clósets, puertas de tambor y paneles decorativos.",
          items: [
            { n: "4.5 · 12 · 15 · 18", txt: "mm", nota: "grosores" },
            { n: "1.22 x 2.44", txt: "m", nota: "medida estándar (4' x 8')" },
            { n: 3, txt: "micras", nota: "chapa de Encino y Parota" },
            { n: "2.5–3", txt: "micras", nota: "chapa del resto de especies" },
          ],
        },
        {
          t: "compara",
          titulo: "Clasificación por caras",
          a: { titulo: "Cedro, Encino, Nogal, Parota, Sapelli", items: ["Calidad A/A", "Acabado premium para muebles finos"] },
          b: { titulo: "Okume", items: ["Calidades A / B / C / D", "Mismas que las tras caras"] },
          nota: "Centros: especies tropicales.",
        },
        {
          t: "puntos",
          titulo: "Nuestras diferencias frente a la competencia",
          img: "f_dif1",
          ayuda: "Toca para descubrir cada diferencia.",
          items: [
            "Nuestras chapas se nombran según su especie de origen",
            "Tonalidad de la veta",
            "Número de nudos",
            "Centros tropicales",
            "Especie Amber como sustituto de Parota",
          ],
        },
        {
          t: "cifras",
          titulo: "Albasia (Albizia chinensis)",
          img: "f_albasia2",
          texto:
            "Madera de color amarillo muy claro, de origen Indonesia, más clara que la mayoría de las especies de pino. Ligera, de veta recta y gran resistencia: fácil de mecanizar, dar forma, tornear y tallar. Centro: Falcata.",
          items: [
            { n: "3–5", txt: "años", nota: "de crecimiento del árbol" },
            { n: "8–12", txt: "%", nota: "de humedad" },
            { n: "0.24–0.30", txt: "kg", nota: "de peso, según la lámina del curso" },
            { n: "15 · 18", txt: "mm", nota: "espesores" },
          ],
        },
        {
          t: "texto",
          titulo: "Caobillas",
          img: "f_arbol",
          imgAlto: true,
          cuerpo:
            "En México, “caobilla” es un nombre comercial para varias maderas que se parecen a la caoba verdadera, pero que no necesariamente vienen del género Swietenia (la caoba fina). Suelen ser especies tropicales con apariencia y trabajo similares, como algunas del género Cedrela (cedro rojo).",
          columnas: [
            { titulo: "Características", items: ["Color: café claro a rojizo", "Veta recta o ligeramente ondulada", "Textura media a fina", "Peso ligero a semipesado", "Fácil de cortar, cepillar y barnizar"] },
            { titulo: "Usos comunes", items: ["Muebles económicos o de gama media", "Puertas y marcos", "Carpintería en general", "Artesanías"] },
          ],
        },
        {
          t: "compara",
          titulo: "Caoba real contra caobilla",
          a: { titulo: "Caoba verdadera (Swietenia)", items: ["Más resistente", "Más duradera", "Más costosa"] },
          b: { titulo: "Caobilla", items: ["Más accesible en precio", "Puede ser menos durable frente a humedad o plagas", "Se usa como sustituto comercial"] },
          nota: "El término cambia según la región de México. En proyectos importantes conviene identificar la especie exacta.",
        },
        {
          t: "tabla",
          titulo: "Cuadro comparativo de caobillas",
          cols: ["Característica", "Cumala / Pencil", "MLH", "Sapelli", "Caobilla Meranti", "Triplay de ingeniería"],
          filas: [
            ["Tipo", "Tropical blanda", "Mezcla de maderas ligeras", "Tropical dura", "Tropical media (Shorea)", "Tablero industrial"],
            ["Origen", "América tropical", "Asia", "África", "Sudeste asiático", "Variable"],
            ["Color", "Beige a rojizo", "Claro uniforme", "Marrón rojizo oscuro", "Rosado a rojo/marrón", "Depende de la cara"],
            ["Densidad / peso", "Ligera", "Ligera", "Media-alta", "Media (≈500–700 kg/m³)", "Variable"],
            ["Resistencia", "Baja-media", "Baja-media", "Alta", "Media", "Media"],
            ["Estabilidad", "Media", "Variable", "Buena", "Buena", "Variable"],
            ["Trabajabilidad", "Fácil", "Fácil", "Buena (más dura)", "Buena (puede astillar)", "Muy fácil"],
            ["Centro", "Poplar", "Full MLH / Falcata / Combi core", "Poplar", "Full meranti", "Poplar"],
            ["Costo (referencial)", "Bajo", "Medio", "Bajo", "Medio a alto", "Bajo"],
            ["Usos comunes", "Triplay, muebles básicos", "Triplay económico", "Muebles básicos", "Muebles, puertas, chapas, triplay", "Muebles económicos"],
            ["Calidad percibida", "Básica", "Media", "Básica", "Buena", "Baja"],
          ],
          primeraFija: true,
        },
        { t: "pregunta", q: "¿Qué especie usamos como sustituto de Parota?", ops: ["Amber", "Okume", "Falcata"], ok: 0, exp: "La especie Amber es nuestro sustituto de Parota." },
        { t: "pregunta", q: "¿Cuál de estas se considera la caobilla auténtica?", ops: ["MLH", "Meranti", "Triplay de ingeniería"], ok: 1, exp: "Meranti (género Shorea, de Malasia) es la caobilla auténtica; de calidad percibida buena." },
        { t: "vf", q: "El Okume se clasifica en calidades A, B, C y D.", ok: true, exp: "Cedro, Encino, Nogal, Parota y Sapelli van A/A; Okume va A/B/C/D." },
        { t: "vf", q: "La Albasia tarda más de 20 años en crecer.", ok: false, exp: "Es de rápido crecimiento: de 3 a 5 años." },
      ],
    },

    /* ───────────────────────── 4 · MDF ───────────────────────── */
    {
      id: "mdf",
      titulo: "MDF y MDF chapa natural",
      sub: "Calidades, orígenes y competencia",
      rino: "rino_maestro",
      portada: "almacen",
      minutos: 11,
      pasos: [
        {
          t: "intro",
          titulo: "MDF: calidades, orígenes y competencias",
          sub: "Medium Density Fiberboard",
          texto: "Qué es, cómo se fabrica, cómo se clasifica y por qué el MDF chapa natural de TMM se percibe mejor.",
          rino: "rino_maestro",
        },
        {
          t: "texto",
          titulo: "¿Qué es el MDF?",
          img: "mdf_crudo",
          cuerpo:
            "Tablero de fibra de densidad media, fabricado con fibras de madera, resinas, presión y calor. Superficie lisa y homogénea. Uso común en muebles, decoración y construcción ligera.",
        },
        {
          t: "ordena",
          titulo: "Ordena el proceso de fabricación",
          ayuda: "Toca los pasos en el orden correcto.",
          items: [
            "Trituración de madera (pino o eucalipto)",
            "Refinado de fibras",
            "Mezcla con resinas",
            "Prensado en caliente",
            "Corte y acabado",
          ],
        },
        {
          t: "compara",
          titulo: "Tipos de MDF",
          img: "mdf_mr",
          a: { titulo: "Por acabado", items: ["Crudo", "Melamínico", "Enchapado (madera natural)"] },
          b: { titulo: "Por uso", items: ["Estándar (interior)", "Resistente a la humedad, hidrófugo (MR)", "Ignífugo (FR)"] },
        },
        {
          t: "texto",
          titulo: "Se clasifica por densidad",
          columnas: [
            { titulo: "Densidad", items: ["Baja: más ligero, menor resistencia", "Media: uso general (la más común)", "Alta: mayor resistencia y durabilidad"] },
            { titulo: "Factores de calidad", items: ["Densidad uniforme", "Tipo de resina", "Acabado superficial", "Resistencia a humedad", "Emisión de formaldehído (normas E1, E0)"] },
          ],
        },
        {
          t: "texto",
          titulo: "Origen, normas y marcas",
          img: "mdf_muebles",
          cuerpo: "Brasil y Chile lideran la producción y exportación; China va en segundo lugar, con MDF sin certificación.",
          columnas: [
            { titulo: "Normas y estándares", items: ["CARB (California Air Resources Board)", "EPA TSCA Title VI", "Normas europeas EN (E0, E1, E2)", "FSC (manejo forestal sostenible)"] },
            { titulo: "Marcas en el mercado", items: ["Duratex", "Duraplay", "Arauco", "Berneck", "Daiken", "Masisa", "Kronospan"] },
          ],
        },
        {
          t: "compara",
          titulo: "Ventajas y desventajas del MDF",
          a: { titulo: "Ventajas", tono: "bien", items: ["Superficie uniforme, ideal para pintura", "Fácil mecanizado (corte, fresado)", "Menor costo que madera sólida", "Versatilidad en el diseño"] },
          b: { titulo: "Desventajas", tono: "mal", items: ["Sensible a la humedad (excepto MR)", "Menor resistencia estructural que madera sólida", "Puede emitir formaldehído", "Peso relativamente alto"] },
        },
        {
          t: "puntos",
          titulo: "Tendencias del mercado",
          items: ["Mayor demanda de MDF ecológico", "Reducción de emisiones (E0)", "Crecimiento en Latinoamérica", "Uso en diseño modular"],
        },
        {
          t: "galeria",
          titulo: "MDF chapa natural",
          texto:
            "MDF recubierto con chapa natural, es decir, madera real: combina la estabilidad del MDF con la estética auténtica de la madera. La chapa es una lámina delgada obtenida directamente de troncos, por corte plano o desenrollado, y se adhiere a MDF, aglomerado o triplay.",
          imgs: [
            { img: "mdf_chapa", pie: "Corte plano y desenrollado" },
            { img: "mdf_origen", pie: "Fibras + resinas + alta presión y temperatura" },
          ],
        },
        {
          t: "galeria",
          titulo: "Ventajas y desventajas de la chapa natural",
          imgs: [
            { img: "mdf_ventajas", pie: "Apariencia de madera, costo menor, superficie uniforme, ideal para acabados finos" },
            { img: "mdf_desventajas", pie: "Sensible a la humedad, no estructural, puede dañarse con golpes, requiere sellado" },
          ],
        },
        {
          t: "galeria",
          titulo: "Tipos de chapa y orígenes",
          texto: "Por calidad estética (clave en ventas): A premium sin nudos y veta uniforme; B con algunos detalles leves; C con más defectos visibles y más barata.",
          imgs: [
            { img: "mdf_tipos_chapa", pie: "Natural vs precompuesta; calidades A, B y C" },
            { img: "mdf_origenes", pie: "Norteamérica, Europa, Latinoamérica, Asia y África" },
          ],
        },
        {
          t: "escalera",
          titulo: "¿Por qué la de TMM se percibe mejor?",
          img: "mdf_tmm",
          pasos: [
            { k: "Selección de chapa (lo más importante)", v: "Chapas grado A/B alto: menos nudos y parches, vetas continuas." },
            { k: "Espesor de chapa", v: "Chapas más gruesas: mejor lijado y acabado, sin riesgo de traspase." },
            { k: "Núcleo MDF", v: "Trabajado con tableros de mejor densidad." },
          ],
        },
        {
          t: "compara",
          titulo: "MDF chapa natural en mayoreo frente a la competencia premium",
          a: { titulo: "TMM en mayoreo", tono: "bien", items: ["Excelente relación costo-beneficio", "Flexibilidad de diseño", "Ideal para proyectos personalizados"] },
          b: { titulo: "Competencia premium", items: ["Mayor enfoque en diseño", "Menor accesibilidad económica"] },
          nota: "TMM ofrece calidad a precios reducidos, mientras los competidores se enfocan en diseños exclusivos a mayores costos.",
        },
        { t: "pregunta", q: "¿Qué tipo de MDF le recomiendas a un cliente para una zona con humedad?", ops: ["MDF estándar", "MDF ignífugo (FR)", "MDF hidrófugo (MR)"], ok: 2, exp: "El MR es el resistente a la humedad; el estándar es solo para interior seco." },
        { t: "pregunta", q: "De las razones por las que nuestra chapa se percibe mejor, ¿cuál es la más importante?", ops: ["La selección de chapa", "El color del canto", "El empaque"], ok: 0, exp: "Usamos chapas grado A/B alto: menos nudos y parches, vetas continuas." },
        { t: "vf", q: "China lidera la producción de MDF certificado.", ok: false, exp: "Brasil y Chile lideran; China va en segundo lugar con MDF sin certificación." },
      ],
    },

    /* ───────────────────────── 5 · CIMBRAS DE ESPECIALIDAD ───────────────────────── */
    {
      id: "cimbras",
      titulo: "Cimbras de especialidad",
      sub: "Film Tulsa, Ruso Birch y MDO Canto Plata",
      rino: "rino_triplay",
      portada: "e_tulsa",
      minutos: 6,
      pasos: [
        {
          t: "intro",
          titulo: "Cimbras de especialidad",
          sub: "Cuando el concreto tiene que quedar perfecto",
          texto: "Tres cimbras para obras exigentes. La diferencia está en el recubrimiento, el origen y el número de reutilizaciones.",
          rino: "rino_triplay",
        },
        {
          t: "productos",
          titulo: "Las tres cimbras",
          ayuda: "Toca cada hoja para ver su ficha.",
          items: [
            { img: "e_tulsa", nombre: "Cimbra Film Tulsa", origen: "Chile", tag: "Hasta 20 usos", txt: "Alta calidad y control en fabricación. Excelente desempeño estructural y resistencia: más costosa pero durable." },
            { img: "e_birch", nombre: "Cimbra Film Ruso Birch", origen: "Rusia", tag: "Hasta 100 usos", txt: "Fabricada con madera de abedul de alta densidad. Opción premium por su gran resistencia y excelente acabado." },
            { img: "e_mdo", nombre: "Cimbra MDO Canto Plata 1/C", origen: "México", tag: "Hasta 8 usos", txt: "Hecha en México sobre triplay Uruply, con recubrimiento especial de acabado muy liso y cantos sellados. Ideal para concreto aparente." },
          ],
        },
        {
          t: "barras",
          titulo: "Reutilizaciones según el curso",
          unidad: "usos",
          items: [
            { k: "Ruso Birch", v: 100 },
            { k: "Film Tulsa", v: 20 },
            { k: "Dura X Natural", v: 10 },
            { k: "MDO Canto Plata", v: 8 },
            { k: "Brasil C+/C", v: 4, nota: "3–4" },
            { k: "Brasil BG", v: 1, nota: "1 aprox." },
          ],
        },
        {
          t: "texto",
          titulo: "Cómo usar bien la Film Tulsa",
          lista: [
            "Caras revestidas con film fenólico café de 125 g/m²",
            "65% de resina fenólica",
            "Recomendada para concreto con tratamiento posterior: pintado, estucado, etc.",
            "Trae cantos sellados de fábrica, pero conviene sellarlos antes de usarla (selladores para madera, base aceite, poliuretanos, acrílicos o epóxicos)",
            "Usar desmoldante químicamente reactivo antes del inicio y después de cada descimbrado",
          ],
        },
        {
          t: "galeria",
          titulo: "Fichas técnicas",
          imgs: [
            { img: "e_birch_ficha", pie: "Ruso Birch: ficha del proveedor" },
            { img: "e_mdo_ficha", pie: "MDO Canto Plata: descripción, uso y características" },
          ],
        },
        {
          t: "ordena",
          titulo: "Ordena de menos a más reutilizaciones",
          ayuda: "Toca de la que menos usos aguanta a la que más.",
          items: ["MDO Canto Plata (8)", "Dura X Natural (10)", "Film Tulsa (20)", "Ruso Birch (100)"],
        },
        { t: "pregunta", q: "El cliente busca concreto aparente con acabado muy liso, hecho en México.", ops: ["Film Tulsa", "MDO Canto Plata 1/C", "Brasil BG"], ok: 1, exp: "MDO Canto Plata: recubrimiento especial de acabado muy liso y cantos sellados." },
        { t: "pregunta", q: "¿Qué cimbra está hecha de abedul de alta densidad?", ops: ["Ruso Birch", "Film Tulsa", "Dura X"], ok: 0, exp: "La Ruso Birch es de abedul y permite hasta 100 reutilizaciones." },
        { t: "vf", q: "Aunque la Tulsa trae cantos sellados de fábrica, se recomienda sellarlos antes de usarla.", ok: true, exp: "Así se aminora el ingreso de humedad por capilaridad en los primeros usos." },
      ],
    },

    /* ───────────────────────── 6 · SUPERHÉROE DE VENTAS ───────────────────────── */
    {
      id: "heroe",
      titulo: "El arsenal del superhéroe de ventas",
      sub: "Trabajo en equipo, planificación y adaptabilidad",
      rino: "rino_heroe",
      portada: "h68",
      minutos: 9,
      oscuro: true,
      pasos: [
        { t: "comic", img: "h68", titulo: "El arsenal del superhéroe de ventas", texto: "Edición exclusiva para equipos de alto desempeño. Trabajo en equipo, planificación y adaptabilidad. Por César Augusto Gallegos-Flores." },
        { t: "comic", img: "h69", titulo: "La amenaza del lobo solitario", texto: "El mercado es un campo de batalla volátil: rechazo, cuellos de botella y presión constantes. El vendedor tradicional actúa como vigilante solitario: carga con todo, apaga incendios y sufre el impacto directo del caos. En ventas de alto nivel el esfuerzo individual ya no es suficiente. Necesitas un escuadrón." },
        { t: "comic", img: "h70", titulo: "Tres módulos. Tres superpoderes. Un solo propósito.", texto: "1) Trabajo en equipo y sinergia organizacional: fomentar actitud resolutiva. 2) Planificación y ejecución con previsión: anticiparse a escenarios. 3) Adaptabilidad continua: promover el cambio como ventaja competitiva." },
        { t: "comic", img: "h71", titulo: "Sinergia organizacional", texto: "Ocurre cuando los equipos trabajan de forma coordinada y los resultados colectivos superan la suma de los esfuerzos individuales. El trabajo interdepartamental efectivo reduce duplicidad, acelera decisiones y mejora la experiencia del cliente." },
        {
          t: "voltea",
          titulo: "Actitud proactiva: el arma definitiva",
          img: "h72",
          cartas: [
            { frente: "Comunicación abierta", reverso: "Comparte información con otras áreas sin esperar a que te la soliciten." },
            { frente: "Colaboración activa", reverso: "Involucra a las áreas clave desde el inicio de cada proyecto, no al final." },
            { frente: "Mentalidad resolutiva", reverso: "Ante un obstáculo, enfócate en soluciones rápidas, no en buscar culpables." },
          ],
        },
        { t: "comic", img: "h73", titulo: "Planificación con previsión: el radar de la verdad", texto: "Significa identificar escenarios posibles antes de que ocurran y preparar respuestas oportunas. La diferencia entre un equipo reactivo y uno estratégico está en cuánto antes detecta y actúa ante las señales de alerta." },
        {
          t: "relaciona",
          titulo: "La galería de villanos: une cada villano con su perfil",
          img: "h74",
          pares: [
            { a: "Riesgo operativo (El Saboteador)", b: "Retrasos, errores en procesos y recursos mal asignados" },
            { a: "Riesgo de imagen (El Cambiaformas)", b: "Mensajes inconsistentes e incumplimientos con clientes" },
          ],
        },
        {
          t: "ordena",
          titulo: "El escudo de previsión en 3 fases",
          img: "h75",
          ayuda: "Toca las capas en orden.",
          items: [
            "Identificar escenarios: mapear el terreno y detectar anomalías antes de la crisis",
            "Evaluar impacto: medir el daño potencial a la operación y a la imagen",
            "Definir contingencias: desplegar protocolos de contención",
          ],
        },
        { t: "comic", img: "h76", titulo: "Adaptabilidad continua: el cambio como arma táctica", texto: "La adaptabilidad no es improvisación: es preparación continua. El cambio constante no es el problema en las ventas, es la oportunidad para aplastar a la competencia." },
        {
          t: "clasifica",
          titulo: "Identidad secreta: ¿quién eres ante el caos?",
          img: "h77",
          ayuda: "Toca una frase y luego el grupo al que pertenece.",
          grupos: ["Mentalidad reactiva (el civil)", "Mentalidad adaptativa (el superhéroe)"],
          items: [
            { t: "El cambio es una amenaza y un castigo", g: 0 },
            { t: "Se resiste, se evita o se gestiona tarde", g: 0 },
            { t: "Estrés extremo, errores y pérdida de clientes", g: 0 },
            { t: "El cambio es una señal de evolución", g: 1 },
            { t: "Se anticipa, se abraza y se usa", g: 1 },
            { t: "Diferenciador estratégico y más cuota de mercado", g: 1 },
          ],
        },
        { t: "comic", img: "h78", titulo: "Las tres claves del vuelo adaptativo", texto: "1) Apertura al aprendizaje (el despegue): actualizar métodos constantemente, no aferrarse a lo que siempre ha funcionado. 2) Flexibilidad operativa (las maniobras): ajustar procesos, roles y prioridades en pleno vuelo sin perder el objetivo. 3) Resiliencia colectiva (el impulso extra): enfrentar la adversidad unidos para recuperar la estabilidad más rápido." },
        { t: "comic", img: "h79", titulo: "El juramento del escuadrón de ventas", texto: "1) Ser el puente: impulsar la colaboración interdepartamental. 2) Planificar dos pasos adelante: incorporar la previsión de escenarios en la estrategia semanal. 3) Abrazar el cambio primero: ser el referente que lidera con el ejemplo. Equipo que anticipa, colabora y se adapta… equipo que lidera." },
        { t: "pregunta", q: "Según el cómic, ¿qué le falta al “lobo solitario”?", ops: ["Más presión", "Un escuadrón", "Más clientes"], ok: 1, exp: "En ventas de alto nivel el esfuerzo individual ya no es suficiente: necesitas un escuadrón." },
        { t: "pregunta", q: "¿Qué distingue a un equipo estratégico de uno reactivo?", ops: ["Cuánto antes detecta y actúa ante las señales de alerta", "Cuántas juntas tiene", "Que nunca cambia sus métodos"], ok: 0, exp: "Planificación con previsión: detectar y actuar antes." },
      ],
    },

    /* ───────────────────────── 7 · INTELIGENCIA EMOCIONAL ───────────────────────── */
    {
      id: "emocional",
      titulo: "Inteligencia emocional",
      sub: "Sensaciones, emociones y sentimientos en la venta",
      rino: "rino_corazon",
      portada: "ie_espejo",
      minutos: 12,
      pasos: [
        {
          t: "intro",
          titulo: "¿Quién es la persona más importante en tu vida?",
          sub: "Inteligencia emocional · Equipo comercial TMM",
          texto: "Piénsalo un momento antes de seguir.",
          revela: "Tú. Para cuidar a los demás y a tus clientes, primero tienes que conocerte.",
          rino: "rino_corazon",
        },
        { t: "cita", texto: "El origen de todos nuestros males radica en la ignorancia de nosotros mismos.", autor: "Dr. Alfonso Ruiz Soto" },
        {
          t: "galeria",
          titulo: "Objetivos de hoy",
          imgs: [
            { img: "ie_espejo", pie: "Conocerme un poco más hoy" },
            { img: "ie_herramientas", pie: "La caja de herramientas" },
          ],
        },
        {
          t: "texto",
          titulo: "Los 3 potenciales",
          img: "ie_potenciales",
          columnas: [
            { titulo: "Emocionales", items: ["Potencial afectivo"] },
            { titulo: "Motrices", items: ["Potencial físico"] },
            { titulo: "Racionales", items: ["Potencial intelectual"] },
          ],
        },
        {
          t: "voltea",
          titulo: "Sensación, emoción y sentimiento",
          ayuda: "Toca cada tarjeta para leer la definición.",
          cartas: [
            { frente: "Sensación", reverso: "Respuesta básica que nace de los sentidos. Del latín sensatio, de sentire: percibir. Frío–calor, hambre–sed, sueño–cansancio." },
            { frente: "Emoción", reverso: "Reacción automática, psicofisiológica y breve ante un estímulo, para prepararnos a actuar. Sucede antes de que pienses. Del latín emotio / movere: mover hacia afuera." },
            { frente: "Sentimiento", reverso: "Interpretación consciente y sostenida de una emoción, influida por pensamientos, creencias y experiencias. Es lo que haces con la emoción." },
          ],
        },
        { t: "cita", texto: "Una persona podrá olvidarse de algo que le dijiste, incluso de algo que le hiciste, pero NUNCA se olvidará de cómo la hiciste sentir.", img: "ie_corazones" },
        {
          t: "puntos",
          titulo: "Consecuencias de sobrerreaccionar ante una emoción",
          items: [
            "Decimos cosas de las que luego nos arrepentimos",
            "Te drena la energía del día",
            "Se rompe el diálogo y aumenta el conflicto",
            "Aparecen culpa, vergüenza y vacío",
            "Perdemos claridad y decidimos precipitadamente",
            "Confundimos hechos con suposiciones o juicios",
            "Podemos afectar trabajo, liderazgo o credibilidad",
            "Se crea un patrón repetitivo de reacción",
            "Se pierden relaciones importantes",
          ],
        },
        {
          t: "clasifica",
          titulo: "Sensación, emoción o sentimiento",
          ayuda: "Toca una frase y luego su grupo.",
          grupos: ["Sensación", "Emoción", "Sentimiento"],
          items: [
            { t: "El cuerpo lo nota", g: 0 },
            { t: "Hambre, sed, frío", g: 0 },
            { t: "El cuerpo y la mente reaccionan", g: 1 },
            { t: "Reacción breve, antes de pensar", g: 1 },
            { t: "La conciencia le da significado", g: 2 },
            { t: "Interpretación sostenida en el tiempo", g: 2 },
          ],
        },
        { t: "cita", texto: "No somos responsables de las emociones, pero sí de lo que hacemos con ellas." },
        {
          t: "ranking",
          titulo: "Dinámica: tus emociones primarias",
          texto: "Ordénalas de la que más sientes (1) a la que menos sientes (5). Tu respuesta se queda solo en este dispositivo; no hay respuesta correcta.",
          items: ["Miedo", "Alegría", "Tristeza", "Enojo", "Afecto"],
        },
        {
          t: "respira",
          titulo: "Regalo no. 1",
          texto: "Justo cuando sientas una emoción intensa, tómate de 5 a 10 segundos para respirar. No hagas nada: solo obsérvala y ponle nombre.",
          emociones: ["Miedo", "Alegría", "Tristeza", "Enojo", "Afecto"],
        },
        {
          t: "texto",
          titulo: "Regalo no. 2: ve todos los días al gimnasio emocional",
          grande: "No reacciones en el pico de la emoción.",
          cuerpo:
            "Practica todos los días el regalo no. 1. Responde solo si es totalmente necesario, cuando haya pasado el pico de la emoción, desde la razón; y analiza el resultado.",
        },
        {
          t: "compara",
          titulo: "Vampiros contra nutridores emocionales",
          imgs: ["ie_vampiros", "ie_nutridor"],
          a: { titulo: "Vampiro emocional", tono: "mal", items: ["Te drena", "Identifícalo", "Pon límites y aléjate"] },
          b: { titulo: "Nutridor emocional", tono: "bien", items: ["Te suma energía", "Búscalo", "Acércate a él"] },
          nota: "Regalo no. 3: identifícalos, pon límites al vampiro y acércate al nutridor.",
        },
        {
          t: "cita",
          texto:
            "Vender no es solamente convencer. Vender de verdad es construir confianza. Y la confianza no se impone, se siembra. Cuando un cliente siente confianza, tranquilidad, respaldo y valor, la relación deja de ser transaccional y se vuelve duradera. Ahí es donde nace la lealtad.",
          autor: "Carlos Oropeza",
        },
        {
          t: "puntos",
          titulo: "El reto comercial: constructor de sentimientos",
          texto: "Un cliente puede olvidar un precio, una cotización o una cita. Pero rara vez te olvida si contigo se siente:",
          grandes: true,
          items: ["Escuchado", "Comprendido", "Asesorado", "Importante", "Seguro", "Respaldado", "Valorado"],
        },
        {
          t: "relaciona",
          titulo: "¿Cómo se construye cada sentimiento?",
          pares: [
            { a: "Confianza", b: "Decir la verdad, cumplir, ser consistente" },
            { a: "Seguridad", b: "Responder a tiempo, cumplir entregas, anticipar problemas" },
            { a: "Valor personal", b: "Escuchar, recordar detalles, preguntas inteligentes" },
            { a: "Respaldo", b: "Solucionar, no esconderte, apropiarte del seguimiento" },
            { a: "Preferencia", b: "Resultados con trato humano; que hacer negocios contigo sea fácil" },
          ],
        },
        {
          t: "ordena",
          titulo: "Los pasos del constructor de sentimientos",
          ayuda: "Toca los pasos en orden.",
          items: [
            "Definir qué sentimiento quiero que sienta mi cliente en la siguiente visita o llamada",
            "Detectar quiebres emocionales",
            "Usar la tríada relacional: escuchar, observar, presencia",
            "Diseñar la interacción: necesidad comercial + necesidad emocional",
            "Cerrar confirmando la huella emocional",
            "Repetir consistentemente",
          ],
        },
        {
          t: "texto",
          titulo: "Para seguir aprendiendo",
          lista: [
            "Curso: Semiología de la vida cotidiana, Dr. Alfonso Ruiz Soto (en línea o presencial)",
            "Podcasts sobre estoicismo",
            "Dr. Mario Alonso Puig: libros, TED Talks y videos",
          ],
          grande: "“No es lo que te sucede, sino cómo reaccionas ante lo que te sucede.” — Epicteto",
        },
        { t: "vf", q: "Somos responsables de nuestras emociones.", ok: false, exp: "No somos responsables de las emociones, pero sí de lo que hacemos con ellas." },
        { t: "pregunta", q: "¿Qué propone el regalo no. 1?", ops: ["Responder de inmediato para no perder la venta", "Respirar 5 a 10 segundos, observar la emoción y nombrarla", "Ignorar lo que sientes"], ok: 1, exp: "Respira, no hagas nada; observa la emoción y ponle nombre." },
      ],
    },

    /* ───────────────────────── 8 · PNL ───────────────────────── */
    {
      id: "pnl",
      titulo: "PNL aplicada a la venta",
      sub: "Más allá de la comunicación",
      rino: "rino_megafono",
      portada: "pnl_portada",
      minutos: 10,
      pasos: [
        {
          t: "intro",
          titulo: "“Más allá de la comunicación”: PNL aplicada a la venta y negociación",
          sub: "Mtro. Jorge Enrique Pérez Mar",
          texto: "Programación neurolingüística para entender cómo piensa tu cliente y conectar con él.",
          rino: "rino_megafono",
        },
        {
          t: "puntos",
          titulo: "¿Qué lograremos hoy?",
          img: "pnl_hoy",
          items: [
            "Identificar los canales de percepción de cada cliente",
            "Generar sintonía inmediata",
            "Usar el reencuadre lingüístico para convertir objeciones de precio o calidad en ventajas competitivas",
          ],
        },
        {
          t: "texto",
          titulo: "Entendiendo el modelo mental del cliente",
          img: "pnl_modelo",
          cuerpo: "La comunicación efectiva requiere entender el modelo mental de la persona con la que hablamos. Debemos identificar los sistemas representacionales de cada prospecto.",
          grande: "¿Tu cliente “ve” la venta, la “escucha” o “siente” la textura de la madera?",
        },
        {
          t: "voltea",
          titulo: "Visual, auditivo y kinestésico",
          img: "pnl_vak",
          cartas: [
            { frente: "Visuales", reverso: "Comprenden mejor su entorno por medio de imágenes." },
            { frente: "Auditivos", reverso: "Codifican los sonidos y entienden mejor cuando el mensaje se verbaliza." },
            { frente: "Kinestésicos", reverso: "Necesitan sentir y tocar algo para comprender lo que se les dice." },
          ],
        },
        {
          t: "clasifica",
          titulo: "Claves de acceso: ¿qué canal está usando?",
          ayuda: "Frases de la lámina “Claves de acceso oculares”. Toca la frase y luego su canal.",
          grupos: ["Visual", "Auditivo", "Kinestésico"],
          items: [
            { t: "¿Cómo se vería si le cambio el color?", g: 0 },
            { t: "Qué bonito vestido rosa traías ayer", g: 0 },
            { t: "Le voy a decir que…", g: 1 },
            { t: "Estoy recordando la canción que tocaste el domingo", g: 1 },
            { t: "¿Qué estará pensando de mí?", g: 1 },
            { t: "Tengo mucho frío", g: 2 },
          ],
        },
        {
          t: "escalera",
          titulo: "PNL en ventas",
          pasos: [
            { k: "Entiende el perfil", v: "Identifica si tu cliente es más visual, auditivo o kinestésico." },
            { k: "Practica el reflejo cruzado", v: "Reproduce gestos y comportamientos del cliente para generar más rapport." },
            { k: "Identifica necesidades", v: "Antes de presentar soluciones, descubre las verdaderas necesidades." },
            { k: "Observa el lenguaje corporal", v: "Ajusta tu conversación con lo que el cuerpo te dice." },
          ],
        },
        {
          t: "texto",
          titulo: "Generando confianza instantánea",
          img: "pnl_confianza",
          bloques: [
            { k: "El principio", v: "El rapport es clave en las ventas: los semejantes se atraen." },
            { k: "La naturaleza humana", v: "Es más probable llevarnos bien con quienes son similares a nosotros." },
            { k: "La táctica", v: "Técnicas de acompañamiento físico y verbal para generar confianza con proveedores y clientes." },
          ],
        },
        {
          t: "escalera",
          titulo: "Anclaje emocional",
          texto: "Induce en el comprador una respuesta emocional que ya vivió en el pasado.",
          pasos: [
            { k: "Recuerda", v: "Haz que recuerde la sensación de alcanzar una meta ambiciosa en el trabajo." },
            { k: "Refuerza", v: "Usa lenguaje visual y suma otras emociones (por ejemplo, impresionar a su jefe)." },
            { k: "Ancla", v: "Con una frase específica (“tu mayor logro”) o un gesto particular." },
            { k: "Usa", v: "Retoma ese ancla cuando hables de lo que tu producto puede lograr." },
          ],
        },
        {
          t: "nube",
          titulo: "Palabras de poder",
          img: "pnl_palabras",
          texto: "Hay palabras que venden y palabras que bloquean la negociación. Toca las palabras para encenderlas.",
          grupos: [
            { titulo: "Para emociones positivas", items: ["Creer", "Cambiar", "Energizar", "Saludable", "Superar", "Prosperar", "Éxito", "Refrescar", "Feliz"] },
            { titulo: "Para generar confianza", items: ["Garantizado", "Protegido", "Comprobado"] },
          ],
        },
        {
          t: "texto",
          titulo: "El patrón de movimiento (modelado)",
          cuerpo:
            "Inspira al comprador a reconocer las ideas preconcebidas que tiene en mente: sesgos, miedo a invertir, prejuicios. Una vez que las identifica, muéstrale por qué superarlas beneficia su negocio.",
        },
        {
          t: "galeria",
          titulo: "Señales, preparación y reencuadre",
          imgs: [
            { img: "pnl_senales", pie: "Brazos cruzados, ceño fruncido o suspiros indican incomodidad: la negociación no va bien y hay que ajustar." },
            { img: "pnl_mental", pie: "Antes del cierre, el anclaje te ayuda a entrar en un estado de alta seguridad." },
            { img: "pnl_reencuadre", pie: "Reencuadre: una objeción como “la madera viene húmeda” se convierte en valor a largo plazo y ventaja competitiva." },
          ],
        },
        { t: "pregunta", q: "Un cliente pide pasar la mano por la hoja antes de decidir. Probablemente es…", ops: ["Visual", "Auditivo", "Kinestésico"], ok: 2, exp: "Los kinestésicos necesitan sentir y tocar para comprender." },
        { t: "pregunta", q: "¿En qué principio se basa el rapport?", ops: ["Los semejantes se atraen", "El que habla más gana", "El precio lo decide todo"], ok: 0, exp: "Nos llevamos mejor con quienes son similares a nosotros." },
        { t: "vf", q: "El reflejo cruzado consiste en reproducir gestos del cliente para generar más rapport.", ok: true, exp: "Es una técnica de acompañamiento físico." },
      ],
    },

    /* ───────────────────────── 9 · LENGUAJE NO VERBAL ───────────────────────── */
    {
      id: "noverbal",
      titulo: "Detectando el lenguaje no verbal",
      sub: "25 señales para leer (y usar) en la negociación",
      rino: "rino_lupa",
      portada: "nv136",
      minutos: 8,
      pasos: [
        {
          t: "intro",
          titulo: "Detectando el lenguaje no verbal",
          sub: "Es esencial observar el lenguaje corporal del cliente durante la negociación",
          texto: "Primero explora las 25 tarjetas. Después pon a prueba tu ojo: te describimos un gesto y tú eliges qué significa.",
          rino: "rino_lupa",
        },
        { t: "tarjetero", titulo: "Las 25 señales", ayuda: "Desliza o usa las flechas." },
        { t: "gestos", titulo: "¿Qué significa?", cantidad: 8 },
      ],
    },

    /* ───────────────────────── 10 · OBJECIONES Y CIERRE ───────────────────────── */
    {
      id: "cierre",
      titulo: "Objeciones y cierre",
      sub: "Del interés a la acción",
      rino: "rino_megafono",
      portada: "pnl_reencuadre",
      minutos: 6,
      pasos: [
        {
          t: "intro",
          titulo: "Objeciones y cierre",
          sub: "Transformar una objeción en una oportunidad",
          texto: "Las herramientas para llevar al cliente de la duda a la decisión.",
          rino: "rino_megafono",
        },
        {
          t: "ordena",
          titulo: "Cuatro pasos para el manejo de objeciones",
          ayuda: "Toca los pasos en orden.",
          items: ["Ablande", "Aísle", "Repita", "Sugiera una solución"],
        },
        {
          t: "ordena",
          titulo: "Etapas psicológicas de la venta",
          ayuda: "Toca las etapas en orden.",
          items: ["Captar su Atención", "Lograr su Interés", "Provocar el Deseo de aceptación", "Promover la Acción"],
          sigla: "AIDA",
        },
        {
          t: "dona",
          titulo: "Visión integral del negociador",
          partes: [
            { k: "Actitud apropiada", v: 50 },
            { k: "Habilidades personales", v: 25 },
            { k: "Habilidades en la negociación y conocimientos", v: 25 },
          ],
          nota: "La lámina asigna 50% a la actitud y 25% a las habilidades personales; el 25% restante lo comparten habilidades en la negociación y conocimientos.",
        },
        { t: "pregunta", q: "Según la visión integral del negociador, ¿qué pesa más?", ops: ["Los conocimientos", "La actitud apropiada", "Las habilidades en la negociación"], ok: 1, exp: "La actitud apropiada es el 50%." },
        { t: "pregunta", q: "¿Cuál es el primer paso para manejar una objeción?", ops: ["Sugerir una solución", "Ablandar", "Repetir"], ok: 1, exp: "Ablande, aísle, repita y sugiera una solución." },
        {
          t: "reflexion",
          titulo: "¿Qué te llevas?",
          texto: "Escribe una cosa de este curso que vas a aplicar en tu próxima visita o llamada.",
        },
      ],
    },
  ],

  /* Las 25 tarjetas de lenguaje no verbal (láminas 123–147). */
  gestos: [
    { img: "nv123", gesto: "Abrir tu postura al doble de la anchura de tus hombros bajando un poco el mentón", sig: "Proyecta humildad durante una presentación" },
    { img: "nv124", gesto: "Apretar la mandíbula", sig: "Hostilidad: es la expresión más fácil de detectar" },
    { img: "nv125", gesto: "Usar mancuernillas que contrasten con el color de la camisa", sig: "Le da poder a tus gestos manuales" },
    { img: "nv126", gesto: "Las manos juntas al hablar", sig: "Proyecta conciliación y acuerdo; úsalo en mediación y negociación" },
    { img: "nv127", gesto: "Echarse hacia atrás y bloquear con los dedos y las piernas", sig: "Se resiste a cambiar de opinión" },
    { img: "nv128", gesto: "Hablar rápido o lento", sig: "No importa la velocidad: lo importante es modular bien cada palabra" },
    { img: "nv129", gesto: "Esconder el pulgar detrás de los dedos al hablar", sig: "Se está guardando u ocultando información" },
    { img: "nv130", gesto: "Tronarse solo los nudillos de la mano izquierda", sig: "Señal de contrariedad o rabia" },
    { img: "nv131", gesto: "Hablar apoyado en el marco de la puerta", sig: "“Grita” inseguridad" },
    { img: "nv132", gesto: "Expresarte con la mano izquierda", sig: "Es más poderosa y motivante para quien te ve que la derecha" },
    { img: "nv133", gesto: "Tocarse el pecho con la mano derecha", sig: "Sentimiento fingido; cuando es real, se hace con la izquierda" },
    { img: "nv134", gesto: "Colocar tus utensilios de trabajo en la mesa de reuniones", sig: "Reclamar territorio" },
    { img: "nv135", gesto: "Dos personas con brazos y piernas cruzadas que reflejan la misma postura", sig: "Están en sintonía, aunque ambas tengan bloqueos" },
    { img: "nv136", gesto: "Poner una mano sobre el hombro durante el apretón", sig: "Transmite dominio y poder" },
    { img: "nv137", gesto: "Relajar las muñecas mientras escucha", sig: "Escucha con atención y disposición; el cuerpo busca comodidad" },
    { img: "nv138", gesto: "Rozar la nariz tapando la boca (dura menos de 1 segundo)", sig: "Escepticismo" },
    { img: "nv139", gesto: "Encoger un solo hombro al responder", sig: "Está “maquillando” la respuesta" },
    { img: "nv140", gesto: "Cruzar un brazo sobre el vientre", sig: "Aún no tiene suficiente confianza" },
    { img: "nv141", gesto: "Hablar apuntando constantemente con el índice", sig: "Agresión y desdén" },
    { img: "nv142", gesto: "Doblar los tobillos", sig: "Desinterés, inseguridad y falta de atención" },
    { img: "nv143", gesto: "Apoyar los dedos en las comisuras de los labios", sig: "Autoevaluación negativa" },
    { img: "nv144", gesto: "Darle vueltas al anillo", sig: "Ansiedad" },
    { img: "nv145", gesto: "Sentarte a la izquierda de la otra persona", sig: "Te ayuda a convencerla" },
    { img: "nv146", gesto: "Rascarse detrás de la oreja desviando la mirada", sig: "Ansiedad y ganas de cambiar el tema" },
    { img: "nv147", gesto: "Hacer gestos simétricos a la altura del rostro", sig: "Forma una barrera con tu interlocutor: evítalo" },
  ],

  /* Rino según el momento. */
  rinos: {
    bien: ["rino_fiesta", "rino_trofeo"],
    mal: ["rino_oops"],
    piensa: "rino_pensando",
    meta: "rino_trofeo",
  },

  examen: { preguntas: 15, aprobar: 80 },
};

// CONFIGURACIÓN · CATÁLOGO D4FITNESSHOP (precios con IVA desde precios_b2b_pvp.csv; pedido solo por WhatsApp).
// y regenera con: python3 /workspace/crown_tienda/v3/entrega_app_src/build_entrega_app.py <nueva_version>
window.CONFIG = {
  MODO_BORRADOR: false,
  NOMBRE_TIENDA: 'D4FITNESSHOP',
  DOMINIO: 'https://d4fitness.com/catalogo',   // confirmado por Jose 29/10/2026
  WHATSAPP_PEDIDOS: '+34666829987',     // ÚNICO sitio del número. Todo lo demás (enlaces y texto visible) se calcula desde aquí
  CORREO_CONTACTO: 'd4fitness.support@gmail.com', // solo contacto/LSSI, NO vía de pedido (Jose debe confirmar que es el de soporte)
  // DATOS DEL TITULAR (confirmado 29/10/2026): solo nombre, NIF y localidad. Sin calle ni código postal.
  MOSTRAR_DATOS_TITULAR: true,
  TITULAR: 'Jose Meca Sánchez de Bustamante',
  NIF: '23061522C',
  DOMICILIO: 'Rivas-Vaciamadrid, Madrid',
  REGISTRO_MERCANTIL: 'no aplica',   // decidido por Jose 29/10/2026
  ENVIO_GRATIS: true, // envío gratis en todos los pedidos · decidido por Jose 29/10/2026 (sin umbral)
  ENVIO_PLAZO: 'El plazo de entrega se confirma por WhatsApp junto con el número de seguimiento del envío', // decidido por Jose 29/10/2026 (sin número de días)
  ENVIO_ZONAS: 'Península, Baleares y Canarias', // decidido por Jose 29/10/2026
  FECHA_TEXTOS_LEGALES: '29/10/2026',
  // Registro de visitas: DESACTIVADO (vacío). Ver VISITAS_LEEME.md
  VISITAS_TIPO: '',
  VISITAS_ENDPOINT: '',
  VISITAS_CLAVE_PUBLICA: '',
  VISITAS_DEBUG: false
};

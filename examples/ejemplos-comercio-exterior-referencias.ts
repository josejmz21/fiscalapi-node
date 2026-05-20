/**
 * Ejemplos de facturas con complemento Comercio Exterior (CFDI 4.0) usando el SDK de FiscalAPI
 * Todos los métodos usan el modo "ByReferences" - emisor y receptor se envían solo con su `id`.
 * Cada caso de uso expone dos funciones:
 *   - <nombre>UpdatePeople     : actualiza emisor y receptor en FiscalAPI con sus datos completos.
 *   - <nombre>PorReferencias   : invoca UpdatePeople y luego crea la factura referenciando solo los ids.
 *
 * Pre-requisito: los certificados CSD (.cer y .key) del emisor deben estar previamente cargados
 * en el dashboard de FiscalAPI para `issuerId`. Estos ejemplos NO los suben.
 */

import { FiscalapiClient, FiscalapiSettings, Invoice, Person } from '../src/index';
import { inspect } from 'util';

// Configuración de la consola para mostrar objetos anidados
inspect.defaultOptions.depth = null;
inspect.defaultOptions.colors = true;

// Configuración de FiscalAPI
const settings: FiscalapiSettings = {
    apiUrl: 'https://test.fiscalapi.com', // https://live.fiscalapi.com
    apiKey: '<api-key>', // API key de FiscalAPI
    tenant: '<tenant>', // Tenant de FiscalAPI
    debug: true // true, imprime raw request y response en consola, util durante el desarrollo de la integración.
};

// Fecha dinámica para los CFDI generados
const currentDate = '2026-05-19T08:56:40';

// IDs de personas previamente registradas en FiscalAPI (emisor y receptor)
const issuerId = '2e7b988f-3a2a-4f67-86e9-3f931dd48581';
const recipientId = '109f4d94-63ea-4a21-ab15-20c8b87d8ee9';

// ============================================================================
// 1. FACTURA CE INGRESO CON CARTA PORTE 31 (Facturación por referencias)
// ============================================================================
async function facturaCEIngresoConCartaPorte31UpdatePeople(client: FiscalapiClient): Promise<void> {
  const issuer: Person = {
    id: issuerId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601'
  };
  const recipient: Person = {
    id: recipientId,
    tin: 'XEXX010101000',
    legalName: 'Persona Fisica Extranjera',
    email: 'persona.fisica.extranjera@example.com',
    zipCode: '42501',
    satTaxRegimeId: '616',
    satCfdiUseId: 'S01',
    countryId: 'USA',
    foreignTin: '123456789'
  };
  await client.persons.update(issuer);
  await client.persons.update(recipient);
}

async function facturaCEIngresoConCartaPorte31PorReferencias(client: FiscalapiClient): Promise<void> {
  console.log('\n=== Factura CE Ingreso Con Carta Porte 31 (Por Referencias) ===\n');

  await facturaCEIngresoConCartaPorte31UpdatePeople(client);

  const invoice: Invoice = {
    versionCode: '4.0',
    paymentFormCode: '99',
    paymentMethodCode: 'PUE',
    currencyCode: 'USD',
    typeCode: 'I',
    expeditionZipCode: '42501',
    series: 'CCE',
    date: currentDate,
    paymentConditions: 'CondicionesDePago',
    exportCode: '02',
    issuer: { id: issuerId },
    recipient: { id: recipientId },
    items: [
      {
        itemCode: '78101800',
        itemSku: 'SERV02',
        quantity: 1.0,
        unitOfMeasurementCode: 'HUR',
        description: 'FLETE',
        unitPrice: 2300.00,
        discount: 0,
        taxObjectCode: '02',
        itemTaxes: [
          { taxCode: '002', taxTypeCode: 'Tasa', taxRate: '0.160000', taxFlagCode: 'T' },
          { taxCode: '003', taxTypeCode: 'Tasa', taxRate: '0.300000', taxFlagCode: 'R' }
        ]
      },
      {
        itemCode: '50161509',
        itemSku: 'A0001',
        quantity: 1.0,
        unitOfMeasurementCode: 'H87',
        description: 'Gomitas',
        unitPrice: 120.00,
        discount: 0,
        taxObjectCode: '02',
        itemTaxes: [
          { taxCode: '002', taxTypeCode: 'Tasa', taxRate: '0.160000', taxFlagCode: 'T' }
        ]
      },
      {
        itemCode: '50307037',
        itemSku: 'A0002',
        quantity: 1.0,
        unitOfMeasurementCode: 'H87',
        description: 'Pulparindo',
        unitPrice: 100.00,
        discount: 0,
        taxObjectCode: '02',
        itemTaxes: [
          { taxCode: '002', taxTypeCode: 'Tasa', taxRate: '0.160000', taxFlagCode: 'T' }
        ]
      }
    ],
    complement: {
      cartaPorte: {
        transpInternacId: 'Sí',
        entradaSalidaMercId: 'Salida',
        paisOrigenDestinoId: 'ALB',
        viaEntradaSalidaId: '01',
        totalDistRec: 120.00,
        unidadPesoId: 'KGM',
        regimenAduaneros: [
          { regimenAduaneroId: 'EXD' }
        ],
        ubicaciones: [
          {
            tipoUbicacion: 'Origen',
            idUbicacion: 'OR000001',
            rfcRemitenteDestinatario: 'XAXX010101000',
            nombreRemitenteDestinatario: 'Origen Nacional',
            fechaHoraSalidaLlegada: '2026-04-27T08:00:00',
            domicilio: {
              calle: 'xola',
              numeroExterior: '531',
              coloniaId: '0496',
              localidadId: '03',
              municipioId: '014',
              estadoId: 'CMX',
              paisId: 'MEX',
              codigoPostalId: '03100'
            }
          },
          {
            tipoUbicacion: 'Destino',
            idUbicacion: 'DE000001',
            rfcRemitenteDestinatario: 'XAXX010101000',
            nombreRemitenteDestinatario: 'Destino Nacional',
            fechaHoraSalidaLlegada: '2026-04-27T20:00:00',
            distanciaRecorrida: 120.00,
            domicilio: {
              calle: 'Av Coyoacan',
              numeroExterior: '120',
              coloniaId: '2624',
              localidadId: '03',
              municipioId: '014',
              estadoId: 'CMX',
              paisId: 'MEX',
              codigoPostalId: '03100'
            }
          }
        ],
        mercancias: [
          {
            bienesTranspId: '50433238',
            descripcion: 'Gomitas',
            cantidad: 1,
            claveUnidadId: 'XPK',
            pesoEnKg: 10.000,
            valorMercancia: 1200.00,
            monedaId: 'USD',
            fraccionArancelariaId: '2005800100',
            tipoMateriaId: '04'
          },
          {
            bienesTranspId: '50433238',
            descripcion: 'Pulparindo',
            cantidad: 1,
            claveUnidadId: 'XPK',
            pesoEnKg: 10.000,
            valorMercancia: 1000.00,
            monedaId: 'USD',
            fraccionArancelariaId: '2005800100',
            tipoMateriaId: '04'
          }
        ],
        autotransporte: {
          permSCTId: 'TPAF02',
          numPermisoSCT: '123456',
          configVehicularId: 'C2',
          pesoBrutoVehicular: 1,
          placaVM: '555TTT',
          anioModeloVM: 2023,
          aseguraRespCivil: 'ODISEA',
          polizaRespCivil: '3456YUHNB234RT'
        },
        tiposFigura: [
          {
            tipoFiguraId: '01',
            rfcFigura: 'KAHO641101B39',
            numLicencia: 'D0908240',
            nombreFigura: 'OSCAR KALA HAAK'
          }
        ]
      },
      comercioExterior: {
        claveDePedimentoId: 'A1',
        certificadoOrigen: 0,
        incotermId: 'CIF',
        tipoCambioUSD: '17.3477',
        emisor: {
          domicilio: {
            calle: 'Av Siempre viva',
            numeroExterior: '123',
            coloniaId: '0001',
            localidadId: '06',
            municipioId: '025',
            estadoId: 'COA',
            paisId: 'MEX',
            codigoPostalId: '26015'
          }
        },
        receptor: {
          numRegIdTrib: '123456789',
          domicilio: {
            calle: 'Clinton ST',
            numeroExterior: '10002',
            estado: 'NY',
            paisId: 'USA',
            codigoPostal: '10002-0000'
          }
        },
        mercancias: [
          {
            noIdentificacion: 'A0001',
            fraccionArancelariaId: '4011101099',
            cantidadAduana: '1.000',
            unidadAduanaId: '06',
            valorUnitarioAduana: '120.00',
            valorDolares: '120.00'
          },
          {
            noIdentificacion: 'A0002',
            fraccionArancelariaId: '8407210299',
            cantidadAduana: '1.000',
            unidadAduanaId: '06',
            valorUnitarioAduana: '100.00',
            valorDolares: '100.00'
          }
        ]
      }
    }
  };

  const response = await client.invoices.create(invoice);
  console.log('Response:', response);
}

// ============================================================================
// 2. FACTURA CE INGRESO DIFERENTES MONEDAS (Facturación por referencias)
// ============================================================================
async function facturaCEIngresoDiferentesMonedasUpdatePeople(client: FiscalapiClient): Promise<void> {
  const issuer: Person = {
    id: issuerId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601'
  };
  const recipient: Person = {
    id: recipientId,
    tin: 'XEXX010101000',
    legalName: 'Persona Fisica Extranjera',
    email: 'persona.fisica.extranjera@example.com',
    zipCode: '42501',
    satTaxRegimeId: '616',
    satCfdiUseId: 'S01',
    countryId: 'USA',
    foreignTin: '123456789'
  };
  await client.persons.update(issuer);
  await client.persons.update(recipient);
}

async function facturaCEIngresoDiferentesMonedasPorReferencias(client: FiscalapiClient): Promise<void> {
  console.log('\n=== Factura CE Ingreso Diferentes Monedas (Por Referencias) ===\n');

  await facturaCEIngresoDiferentesMonedasUpdatePeople(client);

  const invoice: Invoice = {
    versionCode: '4.0',
    paymentFormCode: '99',
    paymentMethodCode: 'PPD',
    currencyCode: 'MXN',
    typeCode: 'I',
    expeditionZipCode: '42501',
    series: 'CCE',
    date: currentDate,
    paymentConditions: 'CondicionesDePago',
    exportCode: '02',
    issuer: { id: issuerId },
    recipient: { id: recipientId },
    items: [
      {
        itemCode: '50211503',
        itemSku: '131494-1055',
        quantity: 2,
        unitOfMeasurementCode: 'H87',
        description: 'Cigarros',
        unitPrice: 200.00,
        discount: 0,
        taxObjectCode: '02',
        itemTaxes: [
          { taxCode: '002', taxTypeCode: 'Tasa', taxRate: '0.160000', taxFlagCode: 'T' },
          { taxCode: '001', taxTypeCode: 'Tasa', taxRate: '0.100000', taxFlagCode: 'R' },
          { taxCode: '002', taxTypeCode: 'Tasa', taxRate: '0.106666', taxFlagCode: 'R' }
        ]
      }
    ],
    complement: {
      comercioExterior: {
        claveDePedimentoId: 'A1',
        certificadoOrigen: 0,
        incotermId: 'FOB',
        tipoCambioUSD: '17.3477',
        emisor: {
          domicilio: {
            calle: 'CALLE DEL PAPEL',
            coloniaId: '0214',
            localidadId: '01',
            municipioId: '014',
            estadoId: 'QUE',
            paisId: 'MEX',
            codigoPostalId: '76199'
          }
        },
        receptor: {
          numRegIdTrib: '123456789',
          domicilio: {
            calle: 'ST. A',
            estado: 'TX',
            paisId: 'USA',
            codigoPostal: '00000'
          }
        },
        mercancias: [
          {
            noIdentificacion: '131494-1055',
            fraccionArancelariaId: '2402200100',
            cantidadAduana: '2.00',
            unidadAduanaId: '01',
            valorUnitarioAduana: '11.74',
            valorDolares: '23.47'
          }
        ]
      }
    }
  };

  const response = await client.invoices.create(invoice);
  console.log('Response:', response);
}

// ============================================================================
// 3. FACTURA CE KIT PARTE (Facturación por referencias)
// ============================================================================
async function facturaCEKitParteUpdatePeople(client: FiscalapiClient): Promise<void> {
  const issuer: Person = {
    id: issuerId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601'
  };
  const recipient: Person = {
    id: recipientId,
    tin: 'XEXX010101000',
    legalName: 'U.S. 0026 SW',
    email: 'us.0026.sw@example.com',
    zipCode: '42501',
    satTaxRegimeId: '616',
    satCfdiUseId: 'CP01',
    countryId: 'USA',
    foreignTin: '123456789'
  };
  await client.persons.update(issuer);
  await client.persons.update(recipient);
}

async function facturaCEKitPartePorReferencias(client: FiscalapiClient): Promise<void> {
  console.log('\n=== Factura CE Kit Parte (Por Referencias) ===\n');

  await facturaCEKitParteUpdatePeople(client);

  const invoice: Invoice = {
    versionCode: '4.0',
    paymentFormCode: '01',
    paymentMethodCode: 'PUE',
    currencyCode: 'MXN',
    typeCode: 'I',
    expeditionZipCode: '42501',
    series: 'CCE',
    date: currentDate,
    paymentConditions: 'CondicionesDePago',
    exportCode: '02',
    issuer: { id: issuerId },
    recipient: { id: recipientId },
    items: [
      {
        itemCode: '51241200',
        itemSku: '131494-1055',
        quantity: 1.0,
        unitOfMeasurementCode: 'H87',
        description: 'FORMULA MAGISTRAL',
        unitPrice: 200.00,
        discount: 0,
        taxObjectCode: '01',
        itemTaxes: []
      },
      {
        itemCode: '51241200',
        itemSku: '131494-1055',
        quantity: 1.0,
        unitOfMeasurementCode: 'H87',
        description: 'FORMULA MAGISTRAL',
        unitPrice: 200.00,
        discount: 0,
        taxObjectCode: '01',
        itemTaxes: []
      }
    ],
    complement: {
      comercioExterior: {
        claveDePedimentoId: 'A1',
        certificadoOrigen: 0,
        incotermId: 'FOB',
        tipoCambioUSD: '17.3477',
        emisor: {
          domicilio: {
            calle: 'CALLE DEL PAPEL',
            coloniaId: '0214',
            localidadId: '01',
            municipioId: '014',
            estadoId: 'QUE',
            paisId: 'MEX',
            codigoPostalId: '76199'
          }
        },
        receptor: {
          domicilio: {
            calle: 'ST. A',
            estado: 'TX',
            paisId: 'USA',
            codigoPostal: '00000'
          }
        },
        mercancias: [
          {
            noIdentificacion: '131494-1055',
            fraccionArancelariaId: '2402200100',
            cantidadAduana: '2',
            unidadAduanaId: '01',
            valorUnitarioAduana: '10.00',
            valorDolares: '20.00'
          }
        ]
      }
    }
  };

  const response = await client.invoices.create(invoice);
  console.log('Response:', response);
}

// ============================================================================
// 4. FACTURA CE RECEPTOR EXTRANJERO (Facturación por referencias)
// ============================================================================
async function facturaCEReceptorExtranjeroUpdatePeople(client: FiscalapiClient): Promise<void> {
  const issuer: Person = {
    id: issuerId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601'
  };
  const recipient: Person = {
    id: recipientId,
    tin: 'XEXX010101000',
    legalName: 'U.S. 0026 SW',
    email: 'us.0026.sw@example.com',
    zipCode: '42501',
    satTaxRegimeId: '616',
    satCfdiUseId: 'CP01',
    countryId: 'USA',
    foreignTin: '123456789'
  };
  await client.persons.update(issuer);
  await client.persons.update(recipient);
}

async function facturaCEReceptorExtranjeroPorReferencias(client: FiscalapiClient): Promise<void> {
  console.log('\n=== Factura CE Receptor Extranjero (Por Referencias) ===\n');

  await facturaCEReceptorExtranjeroUpdatePeople(client);

  const invoice: Invoice = {
    versionCode: '4.0',
    paymentFormCode: '99',
    paymentMethodCode: 'PPD',
    currencyCode: 'USD',
    typeCode: 'I',
    expeditionZipCode: '42501',
    series: 'CCE',
    date: currentDate,
    paymentConditions: 'CondicionesDePago',
    exportCode: '02',
    issuer: { id: issuerId },
    recipient: { id: recipientId },
    items: [
      {
        itemCode: '50211503',
        itemSku: '131494-1055',
        quantity: 2,
        unitOfMeasurementCode: 'H87',
        description: 'Cigarros',
        unitPrice: 200.00,
        discount: 0,
        taxObjectCode: '02',
        itemTaxes: [
          { taxCode: '002', taxTypeCode: 'Tasa', taxRate: '0.160000', taxFlagCode: 'T' },
          { taxCode: '001', taxTypeCode: 'Tasa', taxRate: '0.100000', taxFlagCode: 'R' }
        ]
      }
    ],
    complement: {
      comercioExterior: {
        claveDePedimentoId: 'A1',
        certificadoOrigen: 0,
        incotermId: 'FOB',
        tipoCambioUSD: '17.3477',
        emisor: {
          domicilio: {
            calle: 'CALLE DEL PAPEL',
            coloniaId: '0214',
            localidadId: '01',
            municipioId: '014',
            estadoId: 'QUE',
            paisId: 'MEX',
            codigoPostalId: '76199'
          }
        },
        receptor: {
          numRegIdTrib: '123456789',
          domicilio: {
            calle: 'ST. A',
            estado: 'TX',
            paisId: 'USA',
            codigoPostal: '00000'
          }
        },
        mercancias: [
          {
            noIdentificacion: '131494-1055',
            fraccionArancelariaId: '2402200100',
            cantidadAduana: '117.64',
            unidadAduanaId: '01',
            valorUnitarioAduana: '3.40',
            valorDolares: '400.00'
          }
        ]
      }
    }
  };

  const response = await client.invoices.create(invoice);
  console.log('Response:', response);
}

// ============================================================================
// 5. FACTURA CE RECEPTOR NACIONAL (Facturación por referencias)
// ============================================================================
async function facturaCEReceptorNacionalUpdatePeople(client: FiscalapiClient): Promise<void> {
  const issuer: Person = {
    id: issuerId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601'
  };
  const recipient: Person = {
    id: recipientId,
    tin: 'URE180429TM6',
    legalName: 'UNIVERSIDAD ROBOTICA ESPAÑOLA',
    email: 'universidad.robotica.espanola@example.com',
    zipCode: '86991',
    satTaxRegimeId: '601',
    satCfdiUseId: 'G01'
  };
  await client.persons.update(issuer);
  await client.persons.update(recipient);
}

async function facturaCEReceptorNacionalPorReferencias(client: FiscalapiClient): Promise<void> {
  console.log('\n=== Factura CE Receptor Nacional (Por Referencias) ===\n');

  await facturaCEReceptorNacionalUpdatePeople(client);

  const invoice: Invoice = {
    versionCode: '4.0',
    paymentFormCode: '99',
    paymentMethodCode: 'PPD',
    currencyCode: 'USD',
    typeCode: 'I',
    expeditionZipCode: '42501',
    series: 'CCE',
    date: currentDate,
    paymentConditions: 'CondicionesDePago',
    exportCode: '02',
    issuer: { id: issuerId },
    recipient: { id: recipientId },
    items: [
      {
        itemCode: '50211503',
        itemSku: '131494-1055',
        quantity: 2,
        unitOfMeasurementCode: 'H87',
        description: 'Cigarros',
        unitPrice: 200.00,
        discount: 0,
        taxObjectCode: '02',
        itemTaxes: [
          { taxCode: '002', taxTypeCode: 'Tasa', taxRate: '0.160000', taxFlagCode: 'T' },
          { taxCode: '001', taxTypeCode: 'Tasa', taxRate: '0.100000', taxFlagCode: 'R' },
          { taxCode: '002', taxTypeCode: 'Tasa', taxRate: '0.106666', taxFlagCode: 'R' }
        ]
      }
    ],
    complement: {
      comercioExterior: {
        claveDePedimentoId: 'A1',
        certificadoOrigen: 0,
        incotermId: 'FOB',
        tipoCambioUSD: '17.3477',
        emisor: {
          domicilio: {
            calle: 'CALLE DEL PAPEL',
            coloniaId: '0214',
            localidadId: '01',
            municipioId: '014',
            estadoId: 'QUE',
            paisId: 'MEX',
            codigoPostalId: '76199'
          }
        },
        receptor: {
          domicilio: {
            calle: 'CALLE DEL PAPEL',
            colonia: '0214',
            localidad: '01',
            municipio: '014',
            estado: 'QUE',
            paisId: 'MEX',
            codigoPostal: '76199'
          }
        },
        mercancias: [
          {
            noIdentificacion: '131494-1055',
            fraccionArancelariaId: '2402200100',
            cantidadAduana: '117.64',
            unidadAduanaId: '01',
            valorUnitarioAduana: '3.40',
            valorDolares: '400.00'
          }
        ]
      }
    }
  };

  const response = await client.invoices.create(invoice);
  console.log('Response:', response);
}

// ============================================================================
// 6. FACTURA CE TRASLADO CON CARTA PORTE 31 (Facturación por referencias)
// ============================================================================
async function facturaCETrasladoConCartaPorte31UpdatePeople(client: FiscalapiClient): Promise<void> {
  const issuer: Person = {
    id: issuerId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601'
  };
  const recipient: Person = {
    id: recipientId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate.receptor@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601',
    satCfdiUseId: 'S01'
  };
  await client.persons.update(issuer);
  await client.persons.update(recipient);
}

async function facturaCETrasladoConCartaPorte31PorReferencias(client: FiscalapiClient): Promise<void> {
  console.log('\n=== Factura CE Traslado Con Carta Porte 31 (Por Referencias) ===\n');

  await facturaCETrasladoConCartaPorte31UpdatePeople(client);

  const invoice: Invoice = {
    versionCode: '4.0',
    currencyCode: 'XXX',
    typeCode: 'T',
    expeditionZipCode: '42501',
    series: 'CCE',
    date: currentDate,
    exportCode: '02',
    issuer: { id: issuerId },
    recipient: { id: recipientId },
    items: [
      {
        itemCode: '78101800',
        itemSku: 'TR01',
        quantity: 1.0,
        unitOfMeasurementCode: 'H87',
        description: 'TRANSPORTE DE CARGA',
        unitPrice: 0.00,
        discount: 0,
        taxObjectCode: '01',
        itemTaxes: []
      },
      {
        itemCode: '32101622',
        itemSku: 'UT421511',
        quantity: 100.00,
        unitOfMeasurementCode: 'XBX',
        description: 'MEMORIA FLASH',
        unitPrice: 0.00,
        discount: 0,
        taxObjectCode: '01',
        itemTaxes: []
      }
    ],
    complement: {
      cartaPorte: {
        transpInternacId: 'Sí',
        entradaSalidaMercId: 'Salida',
        paisOrigenDestinoId: 'ALB',
        viaEntradaSalidaId: '01',
        totalDistRec: 120.00,
        unidadPesoId: 'KGM',
        regimenAduaneros: [
          { regimenAduaneroId: 'EXD' }
        ],
        ubicaciones: [
          {
            tipoUbicacion: 'Origen',
            idUbicacion: 'OR000001',
            rfcRemitenteDestinatario: 'XAXX010101000',
            nombreRemitenteDestinatario: 'Origen Nacional',
            fechaHoraSalidaLlegada: '2026-04-27T08:00:00',
            domicilio: {
              calle: 'xola',
              numeroExterior: '531',
              coloniaId: '0496',
              localidadId: '03',
              municipioId: '014',
              estadoId: 'CMX',
              paisId: 'MEX',
              codigoPostalId: '03100'
            }
          },
          {
            tipoUbicacion: 'Destino',
            idUbicacion: 'DE000001',
            rfcRemitenteDestinatario: 'XAXX010101000',
            nombreRemitenteDestinatario: 'Destino Nacional',
            fechaHoraSalidaLlegada: '2026-04-27T20:00:00',
            distanciaRecorrida: 120.00,
            domicilio: {
              calle: 'Av Coyoacan',
              numeroExterior: '120',
              coloniaId: '2624',
              localidadId: '03',
              municipioId: '014',
              estadoId: 'CMX',
              paisId: 'MEX',
              codigoPostalId: '03100'
            }
          }
        ],
        mercancias: [
          {
            bienesTranspId: '50433238',
            descripcion: 'Gomitas',
            cantidad: 1,
            claveUnidadId: 'XPK',
            pesoEnKg: 10.000,
            valorMercancia: 1200.00,
            monedaId: 'USD',
            fraccionArancelariaId: '2005800100',
            tipoMateriaId: '04'
          },
          {
            bienesTranspId: '50433238',
            descripcion: 'Pulparindo',
            cantidad: 1,
            claveUnidadId: 'XPK',
            pesoEnKg: 10.000,
            valorMercancia: 1000.00,
            monedaId: 'USD',
            fraccionArancelariaId: '2005800100',
            tipoMateriaId: '04'
          }
        ],
        autotransporte: {
          permSCTId: 'TPAF02',
          numPermisoSCT: '123456',
          configVehicularId: 'C2',
          pesoBrutoVehicular: 1,
          placaVM: '555TTT',
          anioModeloVM: 2023,
          aseguraRespCivil: 'ODISEA',
          polizaRespCivil: '3456YUHNB234RT'
        },
        tiposFigura: [
          {
            tipoFiguraId: '01',
            rfcFigura: 'KAHO641101B39',
            numLicencia: 'D0908240',
            nombreFigura: 'OSCAR KALA HAAK'
          }
        ]
      },
      comercioExterior: {
        claveDePedimentoId: 'A1',
        certificadoOrigen: 0,
        incotermId: 'FOB',
        tipoCambioUSD: '17.3477',
        emisor: {
          domicilio: {
            calle: 'CALLE DEL PAPEL',
            coloniaId: '0214',
            localidadId: '01',
            municipioId: '014',
            estadoId: 'QUE',
            paisId: 'MEX',
            codigoPostalId: '76199'
          }
        },
        receptor: {
          domicilio: {
            calle: 'ST. A',
            estado: 'TX',
            paisId: 'USA',
            codigoPostal: '00000'
          }
        },
        mercancias: [
          {
            noIdentificacion: 'UT421511',
            fraccionArancelariaId: '2402200100',
            cantidadAduana: '100.00',
            unidadAduanaId: '01',
            valorUnitarioAduana: '1.00',
            valorDolares: '0.00'
          }
        ]
      }
    }
  };

  const response = await client.invoices.create(invoice);
  console.log('Response:', response);
}

// ============================================================================
// 7. FACTURA CE TRASLADO TRASLADO MERCANCIA PROPIA (Facturación por referencias)
// ============================================================================
async function facturaCETrasladoTrasladoMercanciaPropiaUpdatePeople(client: FiscalapiClient): Promise<void> {
  const issuer: Person = {
    id: issuerId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601'
  };
  const recipient: Person = {
    id: recipientId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate.receptor@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601',
    satCfdiUseId: 'S01'
  };
  await client.persons.update(issuer);
  await client.persons.update(recipient);
}

async function facturaCETrasladoTrasladoMercanciaPropiaPorReferencias(client: FiscalapiClient): Promise<void> {
  console.log('\n=== Factura CE Traslado Traslado Mercancia Propia (Por Referencias) ===\n');

  await facturaCETrasladoTrasladoMercanciaPropiaUpdatePeople(client);

  const invoice: Invoice = {
    versionCode: '4.0',
    currencyCode: 'USD',
    typeCode: 'T',
    expeditionZipCode: '42501',
    series: 'CCE',
    date: currentDate,
    exportCode: '02',
    issuer: { id: issuerId },
    recipient: { id: recipientId },
    items: [
      {
        itemCode: '50211503',
        itemSku: '131494-1055',
        quantity: 1.0,
        unitOfMeasurementCode: 'H87',
        description: 'My description...',
        unitPrice: 0.00,
        discount: 0,
        taxObjectCode: '01',
        itemTaxes: []
      }
    ],
    complement: {
      comercioExterior: {
        motivoTrasladoId: '02',
        claveDePedimentoId: 'A1',
        certificadoOrigen: 0,
        incotermId: 'FCA',
        tipoCambioUSD: '17.3477',
        emisor: {
          domicilio: {
            calle: 'CALLE DEL PAPEL',
            coloniaId: '0214',
            localidadId: '01',
            municipioId: '014',
            estadoId: 'QUE',
            paisId: 'MEX',
            codigoPostalId: '76199'
          }
        },
        receptor: {
          domicilio: {
            calle: 'SW Street.',
            numeroExterior: '12345',
            localidad: 'Oregon',
            estado: 'OR',
            paisId: 'USA',
            codigoPostal: '12345'
          }
        },
        destinatarios: [
          {
            numRegIdTrib: '123456789',
            nombre: 'EKU9003173C9',
            domicilios: [
              {
                calle: 'SW Street.',
                numeroExterior: '12345',
                localidad: 'Oregon',
                estado: 'OR',
                paisId: 'USA',
                codigoPostal: '12345'
              }
            ]
          }
        ],
        mercancias: [
          {
            noIdentificacion: '131494-1055',
            fraccionArancelariaId: '0101210100',
            cantidadAduana: '1',
            unidadAduanaId: '07',
            valorUnitarioAduana: '22.64',
            valorDolares: '22.64'
          }
        ]
      }
    }
  };

  const response = await client.invoices.create(invoice);
  console.log('Response:', response);
}

// ============================================================================
// 8. FACTURA CE TRASLADO TRASLADO (Facturación por referencias)
// ============================================================================
async function facturaCETrasladoTrasladoUpdatePeople(client: FiscalapiClient): Promise<void> {
  const issuer: Person = {
    id: issuerId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601'
  };
  const recipient: Person = {
    id: recipientId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate.receptor@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601',
    satCfdiUseId: 'G01'
  };
  await client.persons.update(issuer);
  await client.persons.update(recipient);
}

async function facturaCETrasladoTrasladoPorReferencias(client: FiscalapiClient): Promise<void> {
  console.log('\n=== Factura CE Traslado Traslado (Por Referencias) ===\n');

  await facturaCETrasladoTrasladoUpdatePeople(client);

  const invoice: Invoice = {
    versionCode: '4.0',
    currencyCode: 'USD',
    typeCode: 'T',
    expeditionZipCode: '42501',
    series: 'CCE',
    date: currentDate,
    exportCode: '02',
    issuer: { id: issuerId },
    recipient: { id: recipientId },
    items: [
      {
        itemCode: '50211503',
        itemSku: '131494-1055',
        quantity: 2,
        unitOfMeasurementCode: 'H87',
        description: 'Cigarros',
        unitPrice: 200.00,
        discount: 0,
        taxObjectCode: '01',
        itemTaxes: []
      }
    ],
    complement: {
      comercioExterior: {
        claveDePedimentoId: 'A1',
        certificadoOrigen: 0,
        incotermId: 'FOB',
        tipoCambioUSD: '17.3477',
        emisor: {
          domicilio: {
            calle: 'CALLE DEL PAPEL',
            coloniaId: '0214',
            localidadId: '01',
            municipioId: '014',
            estadoId: 'QUE',
            paisId: 'MEX',
            codigoPostalId: '76199'
          }
        },
        receptor: {
          domicilio: {
            calle: 'ST. A',
            estado: 'TX',
            paisId: 'USA',
            codigoPostal: '00000'
          }
        },
        mercancias: [
          {
            noIdentificacion: '131494-1055',
            fraccionArancelariaId: '2402200100',
            cantidadAduana: '117.64',
            unidadAduanaId: '01',
            valorUnitarioAduana: '3.40',
            valorDolares: '400.00'
          }
        ]
      }
    }
  };

  const response = await client.invoices.create(invoice);
  console.log('Response:', response);
}

// ============================================================================
// 9. FACTURA CE UNIDADES DE MEDIDA NO EQUIVALENTES (Facturación por referencias)
// ============================================================================
async function facturaCEUnidadesDeMedidaNoEquivalentesUpdatePeople(client: FiscalapiClient): Promise<void> {
  const issuer: Person = {
    id: issuerId,
    tin: 'EKU9003173C9',
    legalName: 'ESCUELA KEMPER URGATE',
    email: 'escuela.kemper.urgate@example.com',
    zipCode: '42501',
    satTaxRegimeId: '601'
  };
  const recipient: Person = {
    id: recipientId,
    tin: 'XEXX010101000',
    legalName: 'U.S. 0026 SW',
    email: 'us.0026.sw@example.com',
    zipCode: '42501',
    satTaxRegimeId: '616',
    satCfdiUseId: 'CP01',
    countryId: 'USA',
    foreignTin: '123456789'
  };
  await client.persons.update(issuer);
  await client.persons.update(recipient);
}

async function facturaCEUnidadesDeMedidaNoEquivalentesPorReferencias(client: FiscalapiClient): Promise<void> {
  console.log('\n=== Factura CE Unidades De Medida No Equivalentes (Por Referencias) ===\n');

  await facturaCEUnidadesDeMedidaNoEquivalentesUpdatePeople(client);

  const invoice: Invoice = {
    versionCode: '4.0',
    paymentFormCode: '99',
    paymentMethodCode: 'PPD',
    currencyCode: 'USD',
    typeCode: 'I',
    expeditionZipCode: '42501',
    series: 'CCE',
    date: currentDate,
    paymentConditions: 'CondicionesDePago',
    exportCode: '02',
    issuer: { id: issuerId },
    recipient: { id: recipientId },
    items: [
      {
        itemCode: '50201708',
        itemSku: '131494-1055',
        quantity: 1.000,
        unitOfMeasurementCode: 'H87',
        description: 'Bebida',
        unitPrice: 100.00,
        discount: 0,
        taxObjectCode: '02',
        itemTaxes: [
          { taxCode: '002', taxTypeCode: 'Tasa', taxRate: '0.160000', taxFlagCode: 'T' },
          { taxCode: '001', taxTypeCode: 'Tasa', taxRate: '0.100000', taxFlagCode: 'R' },
          { taxCode: '002', taxTypeCode: 'Tasa', taxRate: '0.106666', taxFlagCode: 'R' }
        ]
      }
    ],
    complement: {
      comercioExterior: {
        claveDePedimentoId: 'A1',
        certificadoOrigen: 0,
        incotermId: 'FOB',
        tipoCambioUSD: '17.3477',
        emisor: {
          domicilio: {
            calle: 'CALLE DEL PAPEL',
            coloniaId: '0214',
            localidadId: '01',
            municipioId: '014',
            estadoId: 'QUE',
            paisId: 'MEX',
            codigoPostalId: '76199'
          }
        },
        receptor: {
          numRegIdTrib: '123456789',
          domicilio: {
            calle: 'ST. A',
            estado: 'TX',
            paisId: 'USA',
            codigoPostal: '00000'
          }
        },
        mercancias: [
          {
            noIdentificacion: '131494-1055',
            fraccionArancelariaId: '2009310201',
            cantidadAduana: '0.500',
            unidadAduanaId: '08',
            valorUnitarioAduana: '200.00',
            valorDolares: '100.00'
          }
        ]
      }
    }
  };

  const response = await client.invoices.create(invoice);
  console.log('Response:', response);
}

// ============================================================================
// FUNCION PRINCIPAL
// ============================================================================
async function main(): Promise<void> {
  console.log('=== Ejemplos de Factura con Comercio Exterior FiscalAPI (Por Referencias) ===\n');

  const client = FiscalapiClient.create(settings);

  try {
    // Descomentar el caso de uso que se desea ejecutar

     //await facturaCEIngresoConCartaPorte31PorReferencias(client);
    // await facturaCEIngresoDiferentesMonedasPorReferencias(client);
   //  await facturaCEKitPartePorReferencias(client);
   // await facturaCEReceptorExtranjeroPorReferencias(client);
    // await facturaCEReceptorNacionalPorReferencias(client);
    // await facturaCETrasladoConCartaPorte31PorReferencias(client);
     // await facturaCETrasladoTrasladoMercanciaPropiaPorReferencias(client);
     // await facturaCETrasladoTrasladoPorReferencias(client);
     await facturaCEUnidadesDeMedidaNoEquivalentesPorReferencias(client);

    console.log('\nEjecución completada.');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar función principal
main();

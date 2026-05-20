import { IFiscalapiHttpClient } from '../http/fiscalapi-http-client.interface';
import { ApiResponse } from '../common/api-response';
import { BaseFiscalapiService } from './base-fiscalapi-service';
import { IManifestService } from '../abstractions/manifest-service.interface';
import { SignManifestRequest, SignManifestResponse } from '../models/manifest';

/**
 * Implementación del servicio de manifiestos
 */
export class ManifestService
  extends BaseFiscalapiService<SignManifestRequest>
  implements IManifestService {

  /**
   * Crea una nueva instancia del servicio de manifiestos
   * @param {IFiscalapiHttpClient} httpClient - Cliente HTTP
   * @param {string} apiVersion - Versión de la API
   */
  constructor(httpClient: IFiscalapiHttpClient, apiVersion: string) {
    super(httpClient, 'manifests', apiVersion);
  }

  /**
   * Firma un manifiesto
   * @param {SignManifestRequest} request - Solicitud con certificado, llave y contraseña
   * @returns {Promise<ApiResponse<SignManifestResponse>>} Respuesta con el archivo firmado
   */
  async sign(request: SignManifestRequest): Promise<ApiResponse<SignManifestResponse>> {
    if (!request) {
      throw new Error('request cannot be null');
    }

    return await this.executeRequest<SignManifestResponse, SignManifestRequest>({
      data: request,
      method: 'POST',
    });
  }
}

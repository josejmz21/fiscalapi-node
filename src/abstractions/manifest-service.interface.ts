import { ApiResponse } from '../common/api-response';
import { SignManifestRequest, SignManifestResponse } from '../models/manifest';

/**
 * Servicio de manifiestos
 */
export interface IManifestService {
  /**
   * Firma un manifiesto.
   * @param {SignManifestRequest} request - Solicitud con certificado, llave y contraseña
   * @returns {Promise<ApiResponse<SignManifestResponse>>} Respuesta con el archivo firmado
   */
  sign(request: SignManifestRequest): Promise<ApiResponse<SignManifestResponse>>;
}

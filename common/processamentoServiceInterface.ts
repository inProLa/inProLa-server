export interface ProcessamentoServiceInterface {
  Processamento(valor: String): Promise<void>;
}

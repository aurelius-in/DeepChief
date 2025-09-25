export type ReceiptVerifyRequest = {
  payload_hash_b64: string
  signature_b64: string
  public_key_b64: string
}

export type Api = {
  getWhyCard(): Promise<any>
  listGlEntries(limit?: number, offset?: number): Promise<any[]>
  listBankTxns(limit?: number, offset?: number): Promise<any[]>
  verifyReceipt(req: ReceiptVerifyRequest): Promise<{ valid: boolean }>
  listMatches(limit?: number, offset?: number): Promise<any[]>
  runIngest(): Promise<any>
  runReconciler(): Promise<any>
  getKpiCloseToCash(): Promise<any>
  listControlsLatest(): Promise<any[]>
  runControls(mode?: string): Promise<any>
  listFlux(limit?: number, offset?: number): Promise<any[]>
  runFlux(): Promise<any>
  listForecast(limit?: number, offset?: number): Promise<any[]>
  runForecast(): Promise<any>
  listExceptions(limit?: number, offset?: number, status?: string): Promise<any[]>
  runExceptionTriage(): Promise<any>
  listSpend(limit?: number, offset?: number): Promise<any[]>
  runDuplicate(): Promise<any>
  runSaas(): Promise<any>
  getKpiSpend(): Promise<any>
  getKpiTreasury(): Promise<any>
  listPolicies(): Promise<any[]>
  verifyReceiptById(receiptId: string): Promise<{ receipt_id: string, hash_matches: boolean, signature_valid: boolean }>
  getFeatures(): Promise<Record<string, any>>
  setFeature(name: string, value: any): Promise<Record<string, any>>
  getTreasuryCash?(days?: number): Promise<any>
  getKpiAudit?(): Promise<any>
  getKpiDQ?(): Promise<any>
  runDQ?(): Promise<any>
  listJobRuns?(limit?: number, offset?: number): Promise<any[]>
  listInvoices?(limit?: number, offset?: number): Promise<any[]>
  listEmployees?(limit?: number, offset?: number): Promise<any[]>
}



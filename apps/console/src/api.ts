export type ReceiptVerifyRequest = {
  payload_hash_b64: string
  signature_b64: string
  public_key_b64: string
}

export type Api = {
  getWhyCard(): Promise<any>
  listGlEntries(): Promise<any[]>
  listBankTxns(): Promise<any[]>
  verifyReceipt(req: ReceiptVerifyRequest): Promise<{ valid: boolean }>
  listMatches(): Promise<any[]>
  runIngest(): Promise<any>
  runReconciler(): Promise<any>
  getKpiCloseToCash(): Promise<any>
  listControlsLatest(): Promise<any[]>
  runControls(): Promise<any>
  listFlux(): Promise<any[]>
  runFlux(): Promise<any>
  listForecast(): Promise<any[]>
  runForecast(): Promise<any>
  listExceptions(): Promise<any[]>
  runExceptionTriage(): Promise<any>
  listSpend(): Promise<any[]>
  runDuplicate(): Promise<any>
  runSaas(): Promise<any>
  getKpiSpend(): Promise<any>
  getKpiTreasury(): Promise<any>
  listPolicies(): Promise<any[]>
  verifyReceiptById(receiptId: string): Promise<{ receipt_id: string, hash_matches: boolean, signature_valid: boolean }>
}



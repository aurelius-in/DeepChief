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
}



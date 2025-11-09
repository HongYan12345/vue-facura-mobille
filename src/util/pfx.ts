// pfx.ts — 前端解析 PFX/PKCS#12 证书（浏览器与 Electron 通用）
import * as forge from 'node-forge'

export interface PfxParseResult {
  subjectCN?: string
  issuerCN?: string
  serialNumber?: string
  notBefore?: Date
  notAfter?: Date
  friendlyName?: string
  sans?: string[]
  hasPrivateKey: boolean
}

export async function parsePfx(arrayBuffer: ArrayBuffer, password: string): Promise<PfxParseResult> {
  try {
    // 将 ArrayBuffer 转为二进制字符串供 forge 解析
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])

    const asn1 = forge.asn1.fromDer(binary)
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, password)

    // 提取证书包
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || []
    const keyBagsShrouded = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || []
    const keyBagsPlain = p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] || []
    const hasPrivateKey = (keyBagsShrouded.length + keyBagsPlain.length) > 0

    const result: PfxParseResult = {
      hasPrivateKey,
      sans: []
    }

    if (certBags.length > 0) {
      const cert = certBags[0].cert as forge.pki.Certificate
      const friendlyNameAttr = (certBags[0] as any).attributes?.friendlyName?.[0]?.value

      // 主题与颁发者 CN
      const subjectCNAttr = cert.subject.getField('CN')
      const issuerCNAttr = cert.issuer.getField('CN')

      result.subjectCN = subjectCNAttr?.value
      result.issuerCN = issuerCNAttr?.value
      result.serialNumber = cert.serialNumber
      result.notBefore = cert.validity.notBefore
      result.notAfter = cert.validity.notAfter
      result.friendlyName = friendlyNameAttr

      // SAN 扩展
      const sanExt = cert.extensions?.find((e: any) => e.name === 'subjectAltName')
      if (sanExt && Array.isArray(sanExt.altNames)) {
        result.sans = sanExt.altNames.map((n: any) => n.value || n.ip || n.dnsName).filter(Boolean)
      }
    }

    return result
  } catch (err: any) {
    throw new Error(`PFX解析失败: ${err?.message || err}`)
  }
}
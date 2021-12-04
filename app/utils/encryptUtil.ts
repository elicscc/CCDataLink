import CryptoJS from 'crypto-js'

export default class EncryptUtil {
  public static readonly key = 'dataqiao_dlt4dlt'
  private static readonly ENCRYPT_PREFIX = 'cdea0bdc-697c-4bcb-92ad-73d4e8915988';
  public static encrypt (word:string):string {
    if (!word) {
      return null
    }
    const key = CryptoJS.enc.Utf8.parse(EncryptUtil.key)

    const srcs = CryptoJS.enc.Utf8.parse(word)
    const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
    return EncryptUtil.ENCRYPT_PREFIX + encrypted.toString()
  }

  public static decrypt (word:string):string {
    if (!word) {
      return null
    }
    if (word.startsWith(EncryptUtil.ENCRYPT_PREFIX)) {
      word = word.substring(EncryptUtil.ENCRYPT_PREFIX.length)
    } else {
      return word
    }

    const key = CryptoJS.enc.Utf8.parse(EncryptUtil.key)

    const decrypt = CryptoJS.AES.decrypt(word, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
    console.log(decrypt)

    return CryptoJS.enc.Utf8.stringify(decrypt).toString()
  }
}

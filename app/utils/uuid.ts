import { Uuid, UuidOptions } from 'node-ts-uuid'

/**
 * 生成uuid
 */
export function getUuid ():string {
  const options: UuidOptions = {
    length: 32,
    prefix: ''
  }
  return Uuid.generate(options)
}

/**
 * 生成32位随机值 变量赋值组件用
 */
export function getRandomValue ():string {
  return Uuid.generate({ length: 32 })
}

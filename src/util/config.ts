// 简单环境开关：修改为 'production' 即切换到正式环境
export type QREnvironment = 'test' | 'production';
export const QR_ENV: QREnvironment = 'test';
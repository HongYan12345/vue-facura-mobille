// qrcode.ts — VeriFactu QR 生成服务（浏览器/前端通用）
import QRCode from 'qrcode';

// 类型定义
export interface QRCodeParams {
  nif: string;           // 开票方税号 (9位NIF)
  numserie: string;      // 发票序列号和编号
  fecha: string;         // 开票日期 (DD-MM-AAAA格式)
  importe: number;       // 发票总金额
}

export interface QRCodeConfig {
  width?: number;        // 二维码宽度 (px)
  height?: number;       // 二维码高度 (px)
  margin?: number;       // 边距
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // 错误纠正级别
}

export interface QRCodeResult {
  url: string;           // 生成的完整URL
  dataUrl: string;       // QR码的Data URL (base64)
  environment: 'test' | 'production';
  timestamp: Date;
}

export interface EnvironmentConfig {
  baseURL: string;
  endpoint: string;
}

// 环境配置
const ENVIRONMENTS: Record<'test' | 'production', EnvironmentConfig> = {
  test: {
    baseURL: 'https://prewww2.aeat.es',
    endpoint: '/wlpl/TIKE-CONT/ValidarQR'
  },
  production: {
    baseURL: 'https://www2.agenciatributaria.gob.es',
    endpoint: '/wlpl/TIKE-CONT/ValidarQR'
  }
} as const;

export class VeriFactuQRService {
  private defaultConfig: Required<QRCodeConfig> = {
    width: 300,
    height: 300,
    margin: 4,
    errorCorrectionLevel: 'M' // 中等错误纠正，符合规范
  };

  /**
   * 生成VeriFactu合规的QR码
   */
  async generateQRCode(
    params: QRCodeParams,
    environment: 'test' | 'production' = 'test',
    config: QRCodeConfig = {}
  ): Promise<QRCodeResult> {
    try {
      // 验证参数
      this.validateParams(params);

      // 合并配置
      const finalConfig = { ...this.defaultConfig, ...config };

      // 构建QR码URL
      const url = this.buildQRUrl(params, environment);

      // 生成QR码图像
      const dataUrl = await this.generateQRImage(url, finalConfig);

      return {
        url,
        dataUrl,
        environment,
        timestamp: new Date()
      };

    } catch (error: any) {
      throw new Error(`生成QR码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 构建QR码URL
   */
  private buildQRUrl(params: QRCodeParams, environment: 'test' | 'production'): string {
    const envConfig = ENVIRONMENTS[environment];

    // 编码参数
    const encodedParams = this.encodeParams(params);

    // 构建查询字符串
    const queryString = Object.entries(encodedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return `${envConfig.baseURL}${envConfig.endpoint}?${queryString}`;
  }

  /**
   * 生成QR码图像
   */
  private async generateQRImage(
    url: string,
    config: Required<QRCodeConfig>
  ): Promise<string> {
    return await QRCode.toDataURL(url, {
      width: config.width,
      height: config.height,
      margin: config.margin,
      errorCorrectionLevel: config.errorCorrectionLevel,
      type: 'image/png',
      quality: 1,
      color: {
        dark: '#000000',   // 黑色QR码
        light: '#FFFFFF'   // 白色背景
      }
    });
  }

  /**
   * 验证参数
   */
  private validateParams(params: QRCodeParams): void {
    const errors: string[] = [];

    // 验证NIF格式
    if (!params.nif || params.nif.length !== 9) {
      errors.push('NIF必须为9位字符');
    }

    // 验证发票序列号
    if (!params.numserie || params.numserie.length === 0) {
      errors.push('发票序列号不能为空');
    }

    if (params.numserie.length > 60) {
      errors.push('发票序列号长度不能超过60个字符');
    }

    // 验证发票序列号字符集 (ASCII 32-126)
    const invalidChar = this.findInvalidCharacters(params.numserie);
    if (invalidChar) {
      errors.push(`发票序列号包含非法字符: ${invalidChar}`);
    }

    // 验证日期格式 (DD-MM-AAAA)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(params.fecha)) {
      errors.push('日期格式必须为 DD-MM-AAAA');
    } else {
      // 验证日期是否有效
      const [day, month, year] = params.fecha.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        errors.push('日期无效');
      }
    }

    // 验证金额
    if (params.importe < 0) {
      errors.push('金额不能为负数');
    }

    // 验证金额格式 (最多12位整数，2位小数)
    const amountString = params.importe.toFixed(2);
    const [integerPart] = amountString.split('.');
    if (integerPart.length > 12) {
      errors.push('金额整数部分不能超过12位');
    }

    if (errors.length > 0) {
      throw new Error(`参数验证失败: ${errors.join('; ')}`);
    }
  }

  /**
   * 查找非法字符
   */
  private findInvalidCharacters(text: string): string | null {
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      // 只允许ASCII 32-126 (可打印字符)
      if (charCode < 32 || charCode > 126) {
        return `'${text[i]}' (ASCII ${charCode})`;
      }
    }
    return null;
  }

  /**
   * 对参数进行URL编码
   */
  private encodeParams(params: QRCodeParams): Record<string, string> {
    return {
      nif: encodeURIComponent(params.nif),
      numserie: encodeURIComponent(params.numserie),
      fecha: encodeURIComponent(params.fecha),
      importe: encodeURIComponent(params.importe.toFixed(2))
    };
  }

  /**
   * 格式化日期为 DD-MM-AAAA
   */
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  /**
   * 验证QR码URL
   */
  validateQRUrl(qrUrl: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const url = new URL(qrUrl);

      // 验证域名
      const validDomains = [
        'www2.agenciatributaria.gob.es',
        'prewww2.aeat.es'
      ];

      if (!validDomains.includes(url.hostname)) {
        errors.push(`无效的域名: ${url.hostname}`);
      }

      // 验证路径
      const validPaths = [
        '/wlpl/TIKE-CONT/ValidarQR'
      ];

      if (!validPaths.includes(url.pathname)) {
        errors.push(`无效的路径: ${url.pathname}`);
      }

      // 验证参数是否包含必需键
      const requiredParams = ['nif', 'numserie', 'fecha', 'importe'];
      const searchParams = url.searchParams;
      for (const key of requiredParams) {
        if (!searchParams.has(key)) {
          errors.push(`缺少参数: ${key}`);
        }
      }

    } catch (e: any) {
      errors.push(`URL解析失败: ${e?.message || e}`);
    }

    return { isValid: errors.length === 0, errors };
  }
}

export default new VeriFactuQRService();
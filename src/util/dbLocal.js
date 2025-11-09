// 统一的本地数据库桥接：Cordova 环境使用 sqlitePlugin（dbSqliteM），Electron 环境使用 sqlite3（dbSqlite）
// Firebase 仍由各组件逻辑在非游客模式下调用。

function isElectron() {
  try {
    return typeof process !== 'undefined' && process.versions && !!process.versions.electron;
  } catch (_) {
    return false;
  }
}

function isCordova() {
  try {
    return typeof window !== 'undefined' && !!window.cordova && !!window.sqlitePlugin;
  } catch (_) {
    return false;
  }
}

async function getImpl() {
  // Cordova
  try {
    if (isCordova()) {
      return await import('./dbSqliteM.js');
    }
  } catch (e) {
    console.warn('[dbLocal] cordova impl import failed, fallback to web:', e)
  }
  // Electron
  try {
    if (isElectron()) {
      return await import('./dbSqlite.js');
    }
  } catch (e) {
    console.warn('[dbLocal] electron impl import failed, fallback to web:', e)
  }
  // 浏览器环境：使用本地存储实现，避免 require 未定义错误
  try {
    return await import('./dbWeb.js');
  } catch (e1) {
    console.warn('[dbLocal] relative web impl import failed, try absolute:', e1)
    // 兼容某些构建配置，尝试绝对路径
    return await import('/src/util/dbWeb.js');
  }
}

export async function initAllTable() {
  const m = await getImpl();
  return m.initAllTable();
}

export async function insertClient(dato) {
  const m = await getImpl();
  return m.insertClient(dato);
}

export async function deleteClient(id) {
  const m = await getImpl();
  return m.deleteClient(id);
}

export async function selectClient(telefono) {
  const m = await getImpl();
  return m.selectClient(telefono);
}

export async function queryAllTree() {
  const m = await getImpl();
  return m.queryAllTree();
}

export async function insertArticulo(dato) {
  const m = await getImpl();
  return m.insertArticulo(dato);
}

export async function queryAllArticulo() {
  const m = await getImpl();
  return m.queryAllArticulo();
}

export async function deleteArticulo(id) {
  const m = await getImpl();
  return m.deleteArticulo(id);
}

export async function insertEmpresa(dato) {
  const m = await getImpl();
  return m.insertEmpresa(dato);
}

export async function deleteEmpresa(id) {
  const m = await getImpl();
  return m.deleteEmpresa(id);
}

export async function queryEmpresa() {
  const m = await getImpl();
  return m.queryEmpresa();
}

export async function insertFactura(dato) {
  const m = await getImpl();
  return m.insertFactura(dato);
}

export async function deleteFactura(id) {
  const m = await getImpl();
  return m.deleteFactura(id);
}

export async function queryFactura() {
  const m = await getImpl();
  return m.queryFactura();
}
// 纯浏览器环境的本地数据存储实现，使用 localStorage 简化游客模式

function getStore(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch (_) {
    return []
  }
}

function setStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const initAllTable = () => Promise.resolve()

// user 表
export const insertClient = (client) => {
  const list = getStore('user')
  const i = list.findIndex((u) => u.telefono === client.telefono)
  if (i >= 0) list[i] = client
  else list.push(client)
  setStore('user', list)
  return Promise.resolve()
}

export const deleteClient = (telefono) => {
  const list = getStore('user').filter((u) => u.telefono !== telefono)
  setStore('user', list)
  return Promise.resolve()
}

export const selectClient = (telefono) => {
  const rows = getStore('user').filter((u) => u.telefono === telefono)
  return Promise.resolve(rows)
}

export const queryAllTree = () => {
  const rows = getStore('user').slice().sort((a, b) => (a.telefono > b.telefono ? 1 : -1))
  return Promise.resolve(rows)
}

// articulo 表
export const insertArticulo = (name) => {
  const list = getStore('articulo')
  if (!list.find((a) => a.name === name)) list.push({ name })
  setStore('articulo', list)
  return Promise.resolve()
}

export const deleteArticulo = (name) => {
  const list = getStore('articulo').filter((a) => a.name !== name)
  setStore('articulo', list)
  return Promise.resolve()
}

export const queryAllArticulo = () => {
  const rows = getStore('articulo').slice().sort((a, b) => (a.name > b.name ? 1 : -1))
  return Promise.resolve(rows)
}

// empresa 表
export const insertEmpresa = (data) => {
  const list = getStore('empresa')
  const i = list.findIndex((e) => e.id === data.id)
  if (i >= 0) list[i] = data
  else list.push(data)
  setStore('empresa', list)
  return Promise.resolve()
}

export const deleteEmpresa = () => {
  setStore('empresa', [])
  return Promise.resolve()
}

export const queryEmpresa = () => {
  return Promise.resolve(getStore('empresa'))
}

// factura 表：兼容两种调用签名
export const insertFactura = (...args) => {
  let row
  if (args.length === 1 && typeof args[0] === 'object') {
    row = args[0]
  } else {
    const [cliente, empresa, item_list, num, date, forma, euro_final] = args
    row = { user: cliente, empresa, item_list, factura_num: num, factura_date: date, forma, euro_final }
  }
  const list = getStore('factura')
  // 使用组合键确保唯一性
  const i = list.findIndex((f) => f.factura_num === row.factura_num && f.factura_date === row.factura_date)
  if (i >= 0) list[i] = row
  else list.push(row)
  setStore('factura', list)
  return Promise.resolve()
}

export const deleteFactura = (id) => {
  const list = getStore('factura').filter((f) => f.id !== id)
  setStore('factura', list)
  return Promise.resolve()
}

export const queryFactura = () => {
  return Promise.resolve(getStore('factura'))
}

const { app } = require('@electron/remote');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
let db
// Electron 用户数据目录路径，确保打包后数据库在可写位置
const userDataDir = app.getPath('userData');
const dbPath = path.join(userDataDir, 'base.db');

// connectar base de datos
function conn() {
  if (!db || !db.open) {
    db = new sqlite3.Database(dbPath)
  }
  return db
}

export const initAllTable = () => {
  return Promise.all([
    initTable(),
    initTableArticulo(),
    initTableEmpresa(),
    initTableFactura(),
  ]).catch((err) => {
    console.error('[dbSqlite] initAllTable error:', err)
  })
}

// 初始化数据表
function initTable() {
  //console.log("init table user")
  return new Promise((resolve, reject) => {
    let db = conn()
    db.serialize(() => {
      db.run(
        'CREATE TABLE IF NOT EXISTS user(telefono char(15) PRIMARY KEY, name char(50) NOT NULL, direccion char(200) NOT NULL, cp char(10) NOT NULL, nif char(10) NOT NULL, forma char(20) NOT NULL, poblation char(20) NOT NULL)',
        (err) => {
          if (err) {
            console.error('[dbSqlite] initTable user error:', err)
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  })
}

export const insertClient = (client) => {
  return new Promise((resolve, reject) => {
    const db = conn()
    db.run(
      'replace into user (telefono, name, direccion, cp, nif, forma, poblation) values (?, ?, ?, ?, ?, ?, ?)',
      [client.telefono, client.name, client.direccion, client.cp, client.nif, client.forma, client.poblation],
      function (err) {
        if (err) {
          console.error('[dbSqlite] insertClient error:', err)
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

export const deleteClient = (telefono) => {
  return new Promise((resolve, reject) => {
    const db = conn()
    db.run('DELETE FROM user WHERE telefono = ?', [telefono], function (err) {
      if (err) {
        console.error('[dbSqlite] deleteClient error:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const selectClient = (telefono) => {
  return new Promise((resolve, reject) => {
    let db = conn()
    db.serialize(() => {
      db.all("SELECT * FROM user WHERE telefono=(?)", telefono, (err, rows) => {
        if (err) reject(err)
        resolve(rows || [])
      })

    })

  })
}

export const queryAllTree = () => {
  //console.log("show user")
  return new Promise((resolve, reject) => {
    let db = conn()
    db.all('select * from user order by telefono', (err, rows) => {
      if (err) reject(err)
      resolve(rows || [])
    })
  })
}

function initTableArticulo() {
  //console.log("init table articulo")
  return new Promise((resolve, reject) => {
    let db = conn()
    db.serialize(() => {
      db.run('CREATE TABLE IF NOT EXISTS articulo(name char(50) PRIMARY KEY)', (err) => {
        if (err) {
          console.error('[dbSqlite] initTable articulo error:', err)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}

export const insertArticulo = (name) => {
  return new Promise((resolve, reject) => {
    const db = conn()
    db.run('replace into articulo (name) values (?)', [name], function (err) {
      if (err) {
        console.error('[dbSqlite] insertArticulo error:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const deleteArticulo = (name) => {
  return new Promise((resolve, reject) => {
    const db = conn()
    db.run('DELETE FROM articulo WHERE name = ?', [name], function (err) {
      if (err) {
        console.error('[dbSqlite] deleteArticulo error:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const queryAllArticulo = () => {
  //console.log("show articulo")
  return new Promise((resolve, reject) => {
    let db = conn()
    db.all('select * from articulo order by name', (err, rows) => {
      if (err) reject(err)
      resolve(rows || [])
    })
  })
}

function initTableEmpresa() {
  //console.log("init table empresa")
  return new Promise((resolve, reject) => {
    let db = conn()
    db.serialize(() => {
      db.run(
        'CREATE TABLE IF NOT EXISTS empresa(id INTEGER PRIMARY KEY, telefono char(15), name char(50) NOT NULL, direccion char(200) NOT NULL, cp char(10) NOT NULL, poblation char(20) NOT NULL, nif char(15) NOT NULL)',
        (err) => {
          if (err) {
            console.error('[dbSqlite] initTable empresa error:', err)
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  })
}

export const insertEmpresa = (data) => {
  return new Promise((resolve, reject) => {
    const db = conn()
    db.run(
      'replace into empresa (id, telefono, name, direccion, cp, poblation, nif) values (?, ?, ?, ?, ?, ?, ?)',
      [data.id, data.telefono, data.name, data.direccion, data.cp, data.poblation, data.nif],
      function (err) {
        if (err) {
          console.error('[dbSqlite] insertEmpresa error:', err)
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

export const deleteEmpresa = () => {
  return new Promise((resolve, reject) => {
    const db = conn()
    db.run('DELETE FROM empresa', function (err) {
      if (err) {
        console.error('[dbSqlite] deleteEmpresa error:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const queryEmpresa = () => {
  return new Promise((resolve, reject) => {
    const db = conn()
    db.all('select * from empresa', (err, rows) => {
      if (err) {
        console.error('[dbSqlite] queryEmpresa error:', err)
        reject(err)
      } else {
        resolve(rows || [])
      }
    })
  })
}


function initTableFactura() {
  //console.log("init table factura");
  return new Promise((resolve, reject) => {
    let db = conn();
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS factura (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        factura_num INTEGER,
        factura_date TEXT,
        user TEXT,
        empresa TEXT,
        item_list TEXT,
        forma TEXT,
        euro_final TEXT
    )`, (err) => {
        if (err) {
          console.error('[dbSqlite] initTable factura error:', err)
          reject(err)
        } else {
          resolve();
        }
      });
    });
  });
}
export const insertFactura = (cliente, empresa, item_list, num, date, forma, euro_final) => {
  return new Promise((resolve, reject) => {
    const db = conn()
    db.run(
      'replace into factura (factura_num, factura_date, user, empresa, item_list, forma, euro_final) values (?, ?, ?, ?, ?, ?, ?)',
      [num, date, cliente, empresa, item_list, forma, euro_final],
      function (err) {
        if (err) {
          console.error('[dbSqlite] insertFactura error:', err)
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

export const deleteFactura = (id) => {
  return new Promise((resolve, reject) => {
    const db = conn()
    db.run('DELETE FROM factura WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('[dbSqlite] deleteFactura error:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const queryFactura = () => {
  return new Promise((resolve, reject) => {
    const db = conn()
    db.all('select * from factura', (err, rows) => {
      if (err) {
        console.error('[dbSqlite] queryFactura error:', err)
        reject(err)
      } else {
        resolve(rows || [])
      }
    })
  })
}
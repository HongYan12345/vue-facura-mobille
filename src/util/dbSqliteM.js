let db
function conn() {
  return new Promise((resolve, reject) => {
    if (!db) {
      document.addEventListener('deviceready', function() {
        // 打开或创建数据库
        db = window.sqlitePlugin.openDatabase({name: 'base.db', location: 'default'});

        console.log('Database opened successfully.');
        resolve(db);
      }, false);
    } else {
      resolve(db);
    }
  });
}

let dbConnectionPromise = conn();

export const initAllTable = () => {
  console.log("Sqlite create all ");
  return Promise.all([initTable(), initTableArticulo(), initTableEmpresa(), initTableFactura()]);
}
  
  // 初始化数据表
  function initTable() {
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql(`CREATE TABLE IF NOT EXISTS user(
            telefono char(15) PRIMARY KEY, 
            name char(50) NOT NULL, 
            direccion char(200) NOT NULL, 
            cp char(10) NOT NULL, 
            nif char(10) NOT NULL, 
            forma char(20) NOT NULL, 
            poblation char(20) NOT NULL)`, [], 
        function(tr, rs) {
          db.executeSql("SELECT * FROM user", [], function(tr, rs) {
            console.log("Sqlite create, ",rs.rows); // should be an empty array if table is newly created
        }, function(error) {
            console.log("Sqlite error, " , error)
        });
            resolve()
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
        });
      });
    })})
  }
  
  export const insertClient = (client) => {
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('replace into user (telefono, name, direccion, cp, nif, forma, poblation) values (?, ?, ?, ?, ?, ?, ?)', 
          [client.telefono, client.name, client.direccion, client.cp, client.nif, client.forma, client.poblation],
          function(tr, rs) {
            console.log("Sqlite, " , rs)
            resolve()
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
      })})
  }
  
  export const deleteClient = (telefono) => {
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('DELETE FROM user WHERE telefono=?', 
          [telefono],
          function(tr, rs) {
            console.log("Sqlite, " , rs)
            resolve()
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
  }
  
  export const selectClient = (telefono) => {
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('SELECT * FROM user WHERE telefono=(?)', [telefono], 
          function(tr, rs) {
            let rows = []
            for(let i = 0; i < rs.rows.length; i++) {
              rows.push(rs.rows.item(i))
            }
            console.log("Sqlite, " , rs)
            resolve(rows)
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
  }
  
  export const queryAllTree = () => {
    //console.log("show user")
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('select * from user order by telefono', [], 
          function(tr, rs) {
            let rows = []
            for(let i = 0; i < rs.rows.length; i++) {
              rows.push(rs.rows.item(i))
            }
            console.log("Sqlite, " , rs)
            resolve(rows)
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
  }
  
  function initTableArticulo() {
    //console.log("init table articulo")
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('CREATE TABLE IF NOT EXISTS articulo(name char(50) PRIMARY KEY)', [], 
          function(tr, rs) {
            console.log("Sqlite, " , rs)
            resolve()
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
      })})
  }
  
  export const insertArticulo = (name) => {
    
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('replace into articulo (name) values (?)', 
          [name],
          function(tr, rs) {
            console.log("Sqlite, " , rs)
            resolve()
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
  }
  
  export const deleteArticulo = (name) => {
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('DELETE FROM articulo WHERE name=?', 
          [name],
          function(tr, rs) {
            console.log("Sqlite, " , rs)
            resolve()
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
  }
  
  export const queryAllArticulo = () => {
    //console.log("show articulo")
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('select * from articulo order by name', [], 
          function(tr, rs) {
            let rows = []
            for(let i = 0; i < rs.rows.length; i++) {
              rows.push(rs.rows.item(i))
            }
            console.log("Sqlite, " , rs)
            resolve(rows)
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
    
  }
  
  function initTableEmpresa() {
    //console.log("init table empresa")
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql(`CREATE TABLE IF NOT EXISTS empresa(
            id INTEGER PRIMARY KEY, 
            telefono char(15), 
            name char(50) NOT NULL, 
            direccion char(200) NOT NULL, 
            cp char(10) NOT NULL, 
            poblation char(20) NOT NULL, 
            nif char(15) NOT NULL)`, [], 
            function(tr, rs) {
              console.log("Sqlite, " , rs)
              resolve()
            }, function(error) {
              console.log("Sqlite error, " , error)
              reject(error)
            })
        })
    })})
      
  }
  
  export const insertEmpresa = (data) => {
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('replace into empresa (id, telefono, name, direccion, cp, poblation, nif) values (?, ?, ?, ?, ?, ?, ?)', 
          [data.id, data.telefono, data.name, data.direccion, data.cp, data.poblation, data.nif],
          function(tr, rs) {
            console.log("Sqlite, " , rs)
            resolve()
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
  }
  
  export const deleteEmpresa = () => {
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('DELETE * FROM empresa',[], 
          function(tr, rs) {
            console.log("Sqlite, " , rs)
            resolve()
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
    
  }
  
  export const queryEmpresa = () => {
    //console.log("show empresa")
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('select * from empresa', [], 
          function(tr, rs) {
            let rows = []
            for(let i = 0; i < rs.rows.length; i++) {
              rows.push(rs.rows.item(i))
            }
            console.log("Sqlite, " , rs)
            resolve(rows)
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
  }
  
  
  function initTableFactura() {
    //console.log("init table factura");
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql(`CREATE TABLE IF NOT EXISTS factura (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            factura_num INTEGER,
            factura_date TEXT,
            user TEXT,
            empresa TEXT,
            item_list TEXT,
            forma TEXT,
            euro_final TEXT
        )`, [], 
            function(tr, rs) {
              console.log("Sqlite, " , rs)
              resolve()
            }, function(error) {
              console.log("Sqlite error, " , error)
              reject(error)
            })
        })
    })})
  }
  export const insertFactura = (...args) => {
    let cliente, empresa, item_list, num, date, forma, euro_final
    if (args.length === 1 && typeof args[0] === 'object') {
      const row = args[0]
      cliente = row.user
      empresa = row.empresa
      item_list = row.item_list
      num = row.factura_num
      date = row.factura_date
      forma = row.forma
      euro_final = row.euro_final
    } else {
      ;[cliente, empresa, item_list, num, date, forma, euro_final] = args
    }
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('replace into factura (factura_num, factura_date, user, empresa, item_list, forma, euro_final) values (?, ?, ?, ?, ?, ?, ?)', 
          [num, date, cliente, empresa, item_list, forma, euro_final],
          function(tr, rs) {
            console.log("Sqlite, " , rs)
            resolve()
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
  }
  
  export const deleteFactura = (id) => {
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('DELETE FROM factura WHERE id=?', 
          [id],
          function(tr, rs) {
            console.log("Sqlite, " , rs)
            resolve()
          }, function(error) {
            console.log("Sqlite error, " , error)
            reject(error)
          })
        })
    })})
  }
  
  export const queryFactura = () => {
    console.log("[Bdsqlite] show factura...")
    return new Promise((resolve, reject) => {
      document.addEventListener('deviceready', function() {dbConnectionPromise.then(db => {
        db.executeSql('select * from factura', [], 
          function(tr, rs) {
            let rows = []
            for(let i = 0; i < rs.rows.length; i++) {
              rows.push(rs.rows.item(i))
            }
            console.log("Sqlite factura, " , rs)
            resolve(rows)
          }, function(error) {
            console.log("Sqlite factura error, " , error)
            reject(error)
          })
        })
    })})
  }
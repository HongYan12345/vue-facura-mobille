import { doc, getDoc , setDoc, updateDoc, deleteDoc, collection, getDocs} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { queryAllTree, queryAllArticulo, queryEmpresa, queryFactura} from "./dbLocal"
import { getAuth } from "firebase/auth"


export async function addOrUpdateData(collectionName, docId, data) {
 
  const auth = getAuth();
  const userId = auth.currentUser.uid; 
  const docRef = doc(db, `users/${userId}/${collectionName}/${docId}`);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await updateDoc(docRef, data);
  } else {
    await setDoc(docRef, data);
  }
}

export async function getData(collectionName, docId) {
  const auth = getAuth();
  const userId = auth.currentUser.uid; 
  const docRef = doc(db, `users/${userId}/${collectionName}/${docId}`);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
}

export async function getAllData(collectionName) {
  const auth = getAuth();
  const userId = auth.currentUser.uid; 
  const collectionRef = collection(db, "users", userId, collectionName);
  const snapshot = await getDocs(collectionRef);

  let allData = [];
  snapshot.forEach(doc => {
      allData.push(doc.data());
  });

  return allData;
}

export async function deleteData(collectionName, docId) {
  const auth = getAuth();
  const userId = auth.currentUser.uid; 
  await deleteDoc(doc(db,  `users/${userId}/${collectionName}/${docId}`));
}

async function commitDataEmpresa() {
    const empresas = await queryEmpresa();
    for (const empresa of empresas) {
      try {
        await addOrUpdateData("empresa",empresa.id, empresa);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
}

async function commitDataFactura() {
    const facturas = await queryFactura();
    for (const factura of facturas) {
      try {
        const id = factura.factura_num + factura.factura_date.split('/')[2]
        await addOrUpdateData("facturas",id, factura);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
}

async function commitDataArticulo() {
    const articulos = await queryAllArticulo();
    for (const articulo of articulos) {
      try {
        await addOrUpdateData("articulos",articulo.name, articulo);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
}

async function commitDataCliente() {
    const clientes = await queryAllTree();
    for (const cliente of clientes) {
      console.log(cliente)
      try {
        await addOrUpdateData("clientes",cliente.telefono, cliente);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
}

export async function uploadAllTable() {
  await commitDataEmpresa();
   
  await commitDataFactura();
  
  await commitDataArticulo();

  await commitDataCliente();
}

export async function uploadLocal(){
  
}


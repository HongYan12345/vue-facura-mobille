
import Vuex from "vuex"
import {ref} from "vue"
import { DataItem, FormState, EuroFinal} from '../util/interface'
import dayjs from 'dayjs'

export const store = new Vuex.Store({
  state: {
    dataArray: new Array<DataItem>(),
    dataFinal:ref<EuroFinal>(),
    data_empresa:ref<FormState>(),
    data_cliente:ref<FormState>(),
    euroBase: 0,
    dto:0,
    isRe: false,
    isIva: false,
    forma:ref('TRANSFERENCIA'),
    date: ref(dayjs().format('DD/MM/YYYY')),
    num: "",
    isLogin: false,
    user:ref(),
    isVisitor: false
  },

  mutations: {
    saveData: (state, objStorage) => {
      console.log("[store]savaArray:",objStorage)
      state.dataArray = objStorage.dataArray;
      state.euroBase = objStorage.euroBase;
      state.dto = objStorage.dto;
      state.isIva = objStorage.isIva;
      state.isRe = objStorage.isRe;
    },
    saveFinal: (state, objStorage) => {
      state.dataFinal = objStorage
      console.log("[store]savaFinal:",objStorage)
    },
    saveCliente: (state, objStorage) => {
      state.data_cliente = objStorage 
    },

    saveEmpresa: (state, objStorage) =>{
      state.data_empresa= objStorage
    },

    saveNum: (state, objStorage) =>{
      state.num = objStorage.num
      // keep ref types consistent for date
      if (state.date && typeof state.date === 'object' && 'value' in (state.date as any)) {
        ;(state.date as any).value = objStorage.date
      } else {
        ;(state as any).date = objStorage.date
      }
      // keep ref types consistent for forma
      if (state.forma && typeof state.forma === 'object' && 'value' in (state.forma as any)) {
        ;(state.forma as any).value = objStorage.forma
      } else {
        ;(state as any).forma = objStorage.forma
      }
    },

    RESET_STATE(state) {
      state.dataArray = new Array<DataItem>()
      state.dataFinal = ref<EuroFinal>()
      state.data_empresa = ref<FormState>()
      state.data_cliente = ref<FormState>()
      state.euroBase = 0
      state.dto = 0
      state.isRe = false
      state.isIva = false
      state.forma = ref('EFECTIVO')
      state.date = ref(dayjs().format('DD/MM/YYYY'))
      state.num = ""
    },

    logIn: (state, objStorage) =>{
      state.isLogin = true
      state.user = objStorage
    },

    loginVisitor: (state) =>{
      state.isLogin = true
      state.isVisitor = true
    },

    logOut: (state) =>{
      state.isLogin = false
      state.user = ref()
      state.isVisitor = false
    },


  },

  
});

<template>
  <div class="button-container">
      <a-button @click="goBack" class="btn-back" size="large">{{$t('back')}}</a-button>
       <a-button @click="goTable" class="btn-next" size="large">{{$t('next')}}</a-button>
    </div>
  <div>
    <a-space direction="vertical" :size="12">
      <a-date-picker v-model:value="date" value-format="DD/MM/YYYY" :showToday="false"/>
      <a-input-number addon-before="Nº" style="width:142px" v-model:value="num" :min="1" ></a-input-number>
      <a-radio-group class="btn-select" v-model:value="forma" button-style="solid" @change="handleChange">
        <a-radio-button value="TRANSFERENCIA">TRANSFERENCIA</a-radio-button>
        <a-radio-button value="EFECTIVO">EFECTIVO</a-radio-button>
        <a-radio-button value="TARJETA">TARJETA</a-radio-button>
      </a-radio-group>
    </a-space>
  <div>
    <a  @click="modificaDato">
      <div class="data_empresa">
        <div class="company_title">
          {{empresa_name}}
        </div>
      
      {{empresa_direccion}}
      <br>
      {{empresa_poblation}}
      {{empresa_cp}}
      <br>
      NIF: {{empresa_nif}}
      TEL: {{empresa_telefono}}

      </div>
    </a>
  </div>
  <a-select
    
    show-search
    placeholder="Select a person"
    style="width: 100%"
    :options="clients_list"
    @select="selectCliente"
    >

  </a-select>
  <div class="data_empresa">
        <div class="company_title">
          {{client_name}}
        </div>
      
      {{client_direccion}}
      <br>
      {{client_poblation}}
      {{client_cp}}
      <br>
      NIF: {{client_nif}}
      TEL: {{client_telefono}}

      </div>
</div>
  <a-row :gutter="16">
   
     <a-col :xs="24" :sm="12" :md="8" :lg="6">
      <a-modal
      v-model:visible="modifica_dato"
      title="Title"
      :confirm-loading="confirmLoading"
      @ok="handleOkDato"
    >
    {{$t('name')}}:
    <a-input v-model:value="empresa_name" spellcheck="false"></a-input>
    {{$t('direccion')}}:
    <a-input v-model:value="empresa_direccion" spellcheck="false"></a-input>
    {{$t('poblation')}}:
    <a-input v-model:value="empresa_poblation" spellcheck="false"></a-input>
    {{$t('cp')}}:
    <a-input v-model:value="empresa_cp" spellcheck="false"></a-input>
    {{$t('nif')}}:
    <a-input v-model:value="empresa_nif" spellcheck="false"></a-input>
    {{$t('telefono')}}:
    <a-input v-model:value="empresa_telefono" spellcheck="false"></a-input>
    </a-modal>
    </a-col>
    <a-col :xs="24" :sm="12" :md="8" :lg="6">
      
    </a-col>
  </a-row>

  
</template>


<script lang="ts">
import { reactive, 
        ref, toRefs,
        onMounted} from 'vue'
import { useRouter} from 'vue-router'
import { useStore } from 'vuex'
import { insertEmpresa, queryEmpresa, queryAllTree, selectClient} from '../util/dbSqliteM'
import { addOrUpdateData, getData, getAllData} from "../util/dbFirebase"
import { useI18n} from "vue-i18n"
import  dayjs from 'dayjs'

export default {
  components: {},
  setup() {
    const data = reactive({
      forma:ref('TRANSFERENCIA'),
      date: ref(dayjs().format('DD/MM/YYYY')),
      num: "",
      modifica_dato:false,
      empresa_name:"",
      empresa_direccion:"",
      empresa_telefono:"",
      empresa_cp:"",
      empresa_poblation:"",
      empresa_nif:"",
      client_name:"",
      client_direccion:"",
      client_telefono:"",
      client_cp:"",
      client_poblation:"",
      client_nif:"",
      client_forma:"",
      
    })
    const refData = toRefs(data)

//router
    const router = useRouter()
//store
    const store = useStore()

//i18n
    const {t} = useI18n()


//lista de clients
    const clients_list = ref([] as Array<{value: string, label: string}>)
    const confirmLoading = ref<boolean>(false);

//添加自家公司信息
    const modificaDato = () => {
      data.modifica_dato = true
    }
    const handleOkDato = () => {
      confirmLoading.value = true
      const newData = {
          id:1,
          name: data.empresa_name,
          direccion: data.empresa_direccion,
          telefono: data.empresa_telefono,
          cp: data.empresa_cp,
          poblation: data.empresa_poblation,
          nif: data.empresa_nif
      }
      if(!store.state.isVisitor){
        addOrUpdateData("empresa", newData.id, newData).then(() => {
          data.modifica_dato = false
          confirmLoading.value = false
        });
      }
      else{
        insertEmpresa(newData).then(() => {
          data.modifica_dato = false
          confirmLoading.value = false
        })
      }
      
    }
    const showEmpresa = () => {
      if(!store.state.isVisitor){
        getAllData("empresa").then((value) => {
          console.log("[PageCompany]empresa en firebase:",value)
          if(value[0]){
            data.empresa_name = value[0].name
            data.empresa_telefono = value[0].telefono
            data.empresa_direccion = value[0].direccion
            data.empresa_cp = value[0].cp
            data.empresa_nif = value[0].nif
            data.empresa_poblation = value[0].poblation
          }
        }).catch(error => {
          console.error("Error getting data: ", error);
        });
      }
      else{
        queryEmpresa().then((value) => {
          console.log("[PageCompany]empresa en base de dato:",value)
          if(value[0]){
            data.empresa_name = value[0].name
            data.empresa_telefono = value[0].telefono
            data.empresa_direccion = value[0].direccion
            data.empresa_cp = value[0].cp
            data.empresa_nif = value[0].nif
            data.empresa_poblation = value[0].poblation
          }
        })
      }
      
    }

    const showClient = () => {
      if(!store.state.isVisitor){
        getAllData("clientes").then(allData => {
          console.log("[PageCompany]list_client en FireBase:",allData);
          allData.forEach((r: any) => {
            clients_list.value.push({
              value: r.telefono,
              label: r.telefono + ' ' + r.name
            })
          })
        }).catch(error => {
          console.error("Error getting data: ", error);
        });
      }
      else{
        queryAllTree().then((value) => {
          value.forEach((r: any) => {
            clients_list.value.push({
              value: r.telefono,
              label: r.telefono + ' ' + r.name
            })
          })
          console.log("[PageCompany]list_client en base de dato:", clients_list)
        })
      }
      
    }

    
    const goTable = () => {
      console.log("cliente select: ",data.client_name)
      saveAll()
      router.push({
            name: "table",
      })
    }

    
    const goBack = () => {
      saveAll()
      router.back()
    }

    const pageUpdate = ()=>{
      console.log("Update", store.state.data_cliente)
      if(store.state.data_cliente){
        data.client_name = store.state.data_cliente.name
        data.client_direccion = store.state.data_cliente.direccion
        data.client_telefono = store.state.data_cliente.telefono
        data.client_cp = store.state.data_cliente.cp
        data.client_poblation = store.state.data_cliente.poblation
        data.client_nif = store.state.data_cliente.nif
        data.client_forma = store.state.data_cliente.forma
        
      }
      data.num = store.state.num
      data.date = store.state.date
      showEmpresa()
      showClient()
      saveAll()
    }

    const selectCliente = (value: any)=>{
      if(!store.state.isVisitor){
        getData("clientes", value).then((value:any) => {
          console.log("select dato client en firebase:",value)
          
          data.client_name = value.name
          data.client_direccion = value.direccion
          data.client_telefono = value.telefono
          data.client_cp = value.cp
          data.client_poblation = value.poblation
          data.client_nif = value.nif
          data.client_forma = value.forma
        
        }).catch(error => {
          console.error("Error getting data: ", error);
        });
      }
      else{
        selectClient(value).then((value) => {
          console.log("select dato client en base de dato:",value)
          if(value[0]){
            data.client_name = value[0].name
            data.client_direccion = value[0].direccion
            data.client_telefono = value[0].telefono
            data.client_cp = value[0].cp
            data.client_poblation = value[0].poblation
            data.client_nif = value[0].nif
            data.client_forma = value[0].forma
        }
        })
      }
      
    }

    
    const saveAll = () =>{
      store.commit("saveEmpresa",{
          name: data.empresa_name,
          direccion: data.empresa_direccion,
          telefono: data.empresa_telefono,
          cp: data.empresa_cp,
          poblation: data.empresa_poblation,
          nif: data.empresa_nif
      })
      store.commit("saveNum",{
          num:data.num,
          date:data.date,
          forma:data.forma
      })
      store.commit("saveCliente",{
          name:data.client_name,
          direccion: data.client_direccion,
          telefono: data.client_telefono,
          cp: data.client_cp,
          poblation: data.client_poblation,
          nif: data.client_nif,
          forma: data.client_forma
      })
    }

    const today = () => {
      return dayjs().format('YYYY-MM-DD HH:mm:ss');
    };

    const handleChange = () => {
      console.log(data.forma)
    }

    const validateNumberInput = () => {
      // 这一行将所有的非数字和非小数点/逗号的字符移除
      data.num = data.num.replace(/[^0-9]/g, '');
    };

    onMounted(() => {
      pageUpdate()
    })


    return {
      ...refData,
      t,
      store,
      clients_list,
      selectCliente,
      modificaDato,
      handleOkDato,
      goTable,
      goBack,
      confirmLoading,
      today,
      validateNumberInput,
      handleChange,
    };
  },
};
</script>
<style scoped>
</style>

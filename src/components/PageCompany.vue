<template>
  <div class="button-container">
      <a-button @click="goBack" class="btn-back" size="large">{{$t('back')}}</a-button>
       <a-button @click="goTable" class="btn-next" size="large">{{$t('next')}}</a-button>
    </div>
  <div>
    <a-space direction="vertical" :size="12">
      <a-date-picker v-model:value="date" value-format="DD/MM/YYYY" :showToday="false"/>
      <a-space direction="horizontal" :size="8">
        <a-input addon-before="Serie" style="width:120px" v-model:value="serie" />
        <a-input-number addon-before="Nº" style="width:142px" v-model:value="num" :min="1" />
      </a-space>
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
      <!-- 证书(PFX) 上传与解析 -->
      <div style="margin-top: 12px;">
        <div style="font-weight: bold; margin-bottom: 6px;">证书(PFX)</div>
        <input type="file" accept=".pfx,.p12" @change="onPfxFileSelected" />
        <div v-if="pfxFileName" style="margin-top: 6px;">文件: {{ pfxFileName }}</div>
        <div v-if="pfxInfo" style="margin-top: 6px; font-size: 12px;">
          <div>主题CN: {{ pfxInfo.subjectCN || '-' }}</div>
          <div>颁发者CN: {{ pfxInfo.issuerCN || '-' }}</div>
          <div>序列号: {{ pfxInfo.serialNumber || '-' }}</div>
          <div>有效期: {{ formatDate(pfxInfo.notBefore) }} ~ {{ formatDate(pfxInfo.notAfter) }}</div>
          <div>私钥: {{ pfxInfo.hasPrivateKey ? '是' : '否' }}</div>
          <div v-if="pfxInfo.sans && pfxInfo.sans.length">SAN: {{ pfxInfo.sans.join(', ') }}</div>
        </div>
      </div>
      <a-modal
        v-model:visible="pfxPasswordVisible"
        title="输入证书密码"
        :confirm-loading="confirmLoading"
        @ok="handlePfxPasswordOk"
        @cancel="resetPfxState"
      >
        <a-input v-model:value="pfxPassword" type="password" placeholder="证书密码" />
      </a-modal>
    </a-col>
  </a-row>

  
</template>


<script lang="ts">
import { reactive, 
        ref, toRefs,
        onMounted} from 'vue'
import { useRouter} from 'vue-router'
import { useStore } from 'vuex'
import { insertEmpresa, queryEmpresa, queryAllTree, selectClient} from '../util/dbLocal'
import { addOrUpdateData, getData, getAllData} from "../util/dbFirebase"
import { useI18n} from "vue-i18n"
import  dayjs from 'dayjs'
import { parsePfx } from '../util/pfx'
import { message } from 'ant-design-vue'

export default {
  components: {},
  setup() {
    const data = reactive({
      forma:ref('TRANSFERENCIA'),
      date: ref(dayjs().format('DD/MM/YYYY')),
      num: "",
      serie: "",
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
    const pfxFile = ref<File | null>(null)
    const pfxFileName = ref('')
    const pfxPasswordVisible = ref(false)
    const pfxPassword = ref('')
    const pfxInfo = ref<any>(null)

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
      // 解析序列号与数字部分：支持任意长度数字结尾。如 AB1234 -> serie=AB, num=1234
      const stored = String(store.state.num || '')
      const m2 = stored.match(/^(\D*)(\d+)$/)
      if (m2) {
        data.serie = m2[1] || ''
        data.num = m2[2]
      } else {
        // 无法解析则保留为整体数字/字符串
        data.serie = ''
        data.num = stored
      }
      data.date = store.state.date
      showEmpresa()
      showClient()
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

    // PFX 上传处理
    const onPfxFileSelected = (e: Event) => {
      const input = e.target as HTMLInputElement
      const file = input.files && input.files[0]
      if (!file) return
      pfxFile.value = file
      pfxFileName.value = file.name
      pfxPasswordVisible.value = true
    }

    const handlePfxPasswordOk = async () => {
      if (!pfxFile.value) return
      confirmLoading.value = true
      try {
        const buf = await fileToArrayBuffer(pfxFile.value)
        const info = await parsePfx(buf, pfxPassword.value)
        pfxInfo.value = info
        message.success('证书解析成功')
      } catch (err: any) {
        console.error('[PFX] 解析失败', err)
        message.error(`证书解析失败: ${err?.message || err}`)
      } finally {
        confirmLoading.value = false
        pfxPasswordVisible.value = false
        pfxPassword.value = ''
      }
    }

    const resetPfxState = () => {
      pfxPasswordVisible.value = false
      pfxPassword.value = ''
    }

    const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })
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
      // 拼接逻辑：
      // - 若存在 serie 且 num 为纯数字，则补齐到5位并拼接
      // - 若不存在 serie，直接使用 num 原值（允许字母+数字的混合形式）
      const rawNumStr = String(data.num ?? '')
      const onlyDigits = rawNumStr.replace(/[^0-9]/g, '')
      const hasSerie = !!data.serie
      const usePadded = hasSerie && onlyDigits.length > 0
      const paddedNum = usePadded ? onlyDigits.padStart(5, '0') : rawNumStr
      const combinedNum = (hasSerie ? String(data.serie) : '') + paddedNum
      store.commit("saveNum",{
          num: combinedNum,
          date: data.date,
          forma: data.forma
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
      // 若用户输入包含字母（可能已包含 serie），则不强制清理；否则只保留数字
      const valStr = String(data.num ?? '')
      const hasLetters = /[A-Za-z]/.test(valStr)
      data.num = hasLetters ? valStr : valStr.replace(/[^0-9]/g, '')
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
      // PFX
      pfxFileName,
      pfxInfo,
      pfxPasswordVisible,
      pfxPassword,
      onPfxFileSelected,
      handlePfxPasswordOk,
      resetPfxState,
      formatDate: (d: Date | undefined) => (d ? dayjs(d).format('YYYY-MM-DD') : '-')
    };
  },
};
</script>
<style scoped>
</style>

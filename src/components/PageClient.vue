<template>
  <div>
    <br>
    <div v-if="!modifica_articulo">
      <a-button @click="modificaArticulo">{{ $t("modifica_articulo") }}</a-button>
    </div>
    <div v-else>
      <a-button @click="modificaArticulo">{{ $t("modifica_cliente") }}</a-button>
    </div>
    <br>
    <div v-if="!modifica_articulo">
      <a-input class="search-input" placeholder="Search" v-model:value="searchString">
         <template #suffix>
        <SearchOutlined />
        </template>
      </a-input>
    </div>
    
    
  
  
  
    <div v-if="!modifica_articulo">
      <a-button @click="showDrawer" class="btn-add" type="text" block
        ><template #icon><PlusOutlined style="font-size: 20px;"/></template
      ></a-button>
    </div>
    
    <div v-if="!modifica_articulo">
      <a-list
        class="a-list"
        item-layout="horizontal"
        :data-source="filteredClients"
        :locale="{ emptyText: ' ' }"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="item-row">

              <a class="item-details" @click="editCliente(item.value)">
                <div>
                 {{item.value.name}} , {{item.value.telefono}} 
                </div>
                
              </a>
              <a-button @click="delectCliente(item.value.telefono)">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div v-else>
      <PageArticulo/>
    </div>


    <a-drawer
      :title="$t('cliente')"
      :visible="visible"
      :body-style="{ paddingBottom: '80px' }"
      :footer-style="{ textAlign: 'right' }"
      @close="onClose"
    >
      <div v-if="errorClient"><a-alert message="错误" type="error" /></div>

      <a-form
        :model="formState"
      >
        <a-form-item :label="$t('name')">
          <a-input v-model:value="formState.name" spellcheck="false"/>
        </a-form-item>
        <a-form-item :label="$t('telefono')">
          <a-input v-model:value="formState.telefono" spellcheck="false"/>
        </a-form-item>
        <a-form-item :label="$t('direccion')">
          <a-input v-model:value="formState.direccion" spellcheck="false"/>
        </a-form-item>
        <a-form-item :label="$t('poblation')">
          <a-input v-model:value="formState.poblation" spellcheck="false"/>
        </a-form-item>
        <a-form-item :label="$t('nif')">
          <a-input v-model:value="formState.nif" spellcheck="false"/>
        </a-form-item>
        <a-form-item :label="$t('cp')">
          <a-input v-model:value="formState.cp" spellcheck="false"/>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button type="primary" @click="onSubmit">{{$t('crear')}}</a-button>
        </a-form-item>
      </a-form>
    </a-drawer>


   

  

    
  </div>
</template>


<script lang="ts">
import {
  reactive,
  toRefs,
  onMounted,
  ref,
  toRaw,
  UnwrapRef,
  computed,
  createVNode,
} from "vue"
import { useRouter } from "vue-router"
import { ExclamationCircleOutlined, PlusOutlined, DeleteOutlined, SearchOutlined} from '@ant-design/icons-vue'
import {
  initAllTable,
  insertClient,
  deleteClient,
  queryAllTree,
} from "../util/dbLocal"
import { addOrUpdateData,  deleteData, getAllData} from "../util/dbFirebase"
import { FormState} from '../util/interface'
import { message, Modal} from 'ant-design-vue'
import { useStore } from 'vuex'
import PageArticulo from './PageArticulo.vue'

export default {
  components: {
    PlusOutlined, 
    DeleteOutlined, 
    SearchOutlined,
    PageArticulo,
  },
  setup() {
    const data = reactive({
      errorClient: false,
      valueClient: "",
      modifica_articulo: false,
      articulo_name: "",
    })
    const refData = toRefs(data)
    const router = useRouter()
    const confirmLoading = ref<boolean>(false);
    const clients = ref([] as Array<{ value: string; label: string }>)
    const searchString = ref('');

    const formState: UnwrapRef<FormState> = reactive({
      name: "",
      direccion: "",
      nif: "",
      forma: "",
      poblation: "",
      cp: "",
      telefono: "",
    })
    const onSubmit = () => {
      if (
        formState.name == "" &&
        formState.direccion == "" &&
        formState.nif == "" &&
        formState.forma == "" &&
        formState.poblation == "" &&
        formState.cp == "" &&
        formState.telefono == ""
      ) {
        data.errorClient = true
      } else {
        data.errorClient = false
        console.log("[PageCliente]submit!", toRaw(formState))
        dbStart()
       
      }
    }

    //store
    const store = useStore()

    //新建用户信息
    const visible = ref<boolean>(false)

    const showDrawer = () => {
      visible.value = true
      formState.name = "" 
      formState.direccion = ""
      formState.nif = ""
      formState.forma = ""
      formState.poblation = ""
      formState.cp = ""
      formState.telefono = ""
    }

    const onClose = () => {
      visible.value = false
      formState.name = "" 
      formState.direccion = ""
      formState.nif = ""
      formState.forma = ""
      formState.poblation = ""
      formState.cp = ""
      formState.telefono = ""
      updatePage()
    }

    //add articulo
    const modificaArticulo = () => {
      data.modifica_articulo = !data.modifica_articulo
    }

    const goBack = () => {
      router.back()
    }

    const dbStart = async () => {
      try {
        await initAllTable()
        const dato = {
          telefono: formState.telefono,
          name: formState.name,
          direccion: formState.direccion,
          poblation: formState.poblation,
          cp: formState.cp,
          nif: formState.nif,
          forma: formState.forma,
        }
        console.log("[PageCliente]bd:", dato)
        
        if(!store.state.isVisitor){
          await addOrUpdateData("clientes", formState.telefono, dato)
        }
        else{
          await insertClient(dato)
        }
        message.success('Submit client success')
        onClose()
      } catch (e) {
        console.error('[PageCliente] submit error:', e)
        message.error('提交客户失败: ' + (e && e.message ? e.message : e))
      }
    }

    const delectCliente = (telefono: string) => {
      Modal.confirm({
        title: () => 'Do you want to delete these items?',
        icon: () => createVNode(ExclamationCircleOutlined),
        content: () => '',
        onOk() {
          
            deleteData("clientes", telefono)
            // 数据库中 telefono 为字符型主键，保持字符串以避免删除失败
            deleteClient(telefono)
            updatePage()
          
        },
        onCancel() {},
      })
    }
    const showClient = () => {
      clients.value = []
      console.log("[PageCliente]show client")
      if(store.state.isVisitor){
        queryAllTree().then((value) => {
        value.forEach((r: any) => {
          clients.value.push({
            value: r,
            label: r.name + ' ,' + r.telefono,
          })
        })
          console.log("[PageCliente]lista clients:", clients.value)
        })
      }
      else{
        getAllData("clientes").then(allData => {
          console.log("[PageCliente]clientes en FireBase:",allData);
          allData.forEach((r: any) => {
            clients.value.push({
              value: r,
              label: r.name + ' ,' + r.telefono,
            })
          })
        }).catch(error => {
          console.error("[PageCliente]Error getting data: ", error);
        });
      }
      
    }

    const filteredClients = computed(() => {
      if (searchString.value) {
        return clients.value.filter(item => item.label.includes(searchString.value));
      }
      return clients.value;
      
    })

    const handleChange = () => {
      console.log("[PageCliente]", data.valueClient)
    }

    const editCliente = (item: FormState) => {
      visible.value = true
      formState.name = item.name
      formState.telefono = item.telefono
      formState.direccion = item.direccion
      formState.nif = item.nif
      formState.poblation = item.poblation
      formState.cp = item.cp
    }
    
    const updatePage = () => {
      showClient()
    }


    onMounted(() => {
      showClient()
    
    })

    return {
      ...refData,
      searchString,
      formState,
      onSubmit,
      goBack,
      showDrawer,
      onClose,
      editCliente,
      visible,
      delectCliente,
      clients,
      modificaArticulo,
      handleChange,
      confirmLoading,
      filteredClients,
    }
  },
}
</script>
<style scoped>
</style>

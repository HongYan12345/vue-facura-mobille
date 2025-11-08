<template>
  <div>
    <div>
      <a-input class="search-input" placeholder="Search" v-model:value="searchString">
         <template #suffix>
        <SearchOutlined />
        </template>
      </a-input>
    </div>
  
    <div>
      <a-button @click="modificaArticulo" class="btn-add" type="text" block
        ><template #icon><PlusOutlined style="font-size: 20px;"/></template
      ></a-button>
    </div>
    
    <div>
      <a-list
        class="a-list"
        item-layout="horizontal"
        :data-source="filteredArticulos"
        :locale="{ emptyText: ' ' }"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="item-row">

            
                <div>
                 {{item.value}}
                </div>
                
            
              <a-button @click="delectArticulo(item.value)">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <a-modal
    v-model:visible="modifica_articulo"
    title="修改产品类型"
    :confirm-loading="confirmLoading"
    @ok="handleOkArticulo"
  >
    <a-input v-model:value="articulo_name" spellcheck="false">{{ $t("name_producto") }}:</a-input>
  </a-modal>

    
  </div>
</template>


<script lang="ts">
import {
  reactive,
  toRefs,
  onMounted,
  ref,
  computed,
} from "vue"
import { useRouter } from "vue-router"
import { PlusOutlined, DeleteOutlined, SearchOutlined} from '@ant-design/icons-vue'
import {
  insertArticulo,
  queryAllArticulo,
  deleteArticulo,
} from "../util/dbLocal"
import { addOrUpdateData,  deleteData, getAllData} from "../util/dbFirebase"
import { useStore } from 'vuex'
//import { message } from 'ant-design-vue'
export default {
  components: {
    PlusOutlined, 
    DeleteOutlined, 
    SearchOutlined
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
    const articulo_list = ref([] as Array<{ value: string }>);
    const searchString = ref('');

    //store
    const store = useStore()

    //新建用户信息
    const visible = ref<boolean>(false)

    //add articulo
    const modificaArticulo = () => {
      data.modifica_articulo = true;
    };
    const handleOkArticulo = () => {
      confirmLoading.value = true;
      
      if(!store.state.isVisitor){
        const dato = {
        name:data.articulo_name
        }
        addOrUpdateData("articulos", data.articulo_name, dato).then(() => {
          data.modifica_articulo = false
          confirmLoading.value = false
          data.articulo_name = ""
        })
      }
      else{
        insertArticulo(data.articulo_name).then(() => {
        data.modifica_articulo = false
        confirmLoading.value = false
        data.articulo_name = ""
        
      })
      }
      updatePage()
    };

    const showArticulo = () => {
      articulo_list.value = [] 
      if(store.state.isVisitor){
        queryAllArticulo().then((value) => {
          console.log("[PageClient]articulo en base de dato:", value);
          value.forEach((r: any) => {
            articulo_list.value.push({
              value: r.name,
            })
          })
        })
      }
      else{
        getAllData("articulos").then(allData => {
          console.log("[PageClient]articulo en FireBase:",allData);
          allData.forEach((r: any) => {
            articulo_list.value.push({
              value: r.name,
            })
          })
        }).catch(error => {
          console.error("Error getting data: ", error);
        });
      }
    }

    const goBack = () => {
      router.back()
    }

    const delectArticulo = (value: string) => {
      
      deleteData("articulos", value)
     
      deleteArticulo(value)
      
      updatePage()
    }
    

    const filteredArticulos = computed(() => {
      console.log("s",searchString)
      if (searchString.value) {
        return articulo_list.value.filter(item => item.value.includes(searchString.value));
      }
      return articulo_list.value;
      
    })
    
    const updatePage = () => {
      showArticulo()
    }


    onMounted(() => {
      updatePage()
    })

    return {
      ...refData,
      searchString,
      goBack,
      visible,
      delectArticulo,
      modificaArticulo,
      handleOkArticulo,
      confirmLoading,
      filteredArticulos,
    }
  },
}
</script>
<style scoped>
</style>

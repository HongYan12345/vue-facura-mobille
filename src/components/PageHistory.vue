<template>
<div>
<div class="button-container">
      <a-button @click="goBack" class="btn-back" size="large">{{$t('back')}}</a-button>
    </div>
    <div v-if="isLoading">
      <div>
        <LoadingOutlined />
      </div>
      
    </div>
    <div v-else>
       <div>
      <a-input class="search-input" placeholder="Search" v-model:value="searchString">
        <template #suffix>
        <SearchOutlined />
        </template>
      </a-input>
    </div>
      <a-list
        class="a-list"
        item-layout="horizontal"
        :data-source="sortedFacturaList"
        :locale="{ emptyText: ' ' }"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="item-row">
              <a class="item-details" @click="goFactura(item)">
                <div>
                  <div>{{parsedItem(item)}}</div>
                 
                </div>
                
              </a>
              <a-button @click="newFactura(item)">
                  <CopyOutlined />
              </a-button>
              &nbsp
              <a-button @click="deletFactura(item)">
                  <DeleteOutlined />
                </a-button>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>

</div>
 
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, ref,
        onMounted, computed, createVNode, } from 'vue'
import { queryFactura, deleteFactura} from '../util/dbSqliteM'
import { useRouter} from 'vue-router'
import { useStore } from 'vuex'
import { useI18n} from "vue-i18n"
import { Modal} from 'ant-design-vue'
import { ExclamationCircleOutlined, CopyOutlined, DeleteOutlined, LoadingOutlined, SearchOutlined} from '@ant-design/icons-vue'
import { FacturaState} from '../util/interface'
import { deleteData, getAllData} from "../util/dbFirebase"

export default defineComponent({
  components: {
    CopyOutlined,
    DeleteOutlined,
    LoadingOutlined,
    SearchOutlined,
  },
  setup() {
    const data = reactive({
      isLoading : true
    })
    const refData = toRefs(data)

    const searchString = ref('');

    

//i18n
    const {t} = useI18n()
    

//router
    const router = useRouter()
//store
    const store = useStore()
    
    const factura_list = ref([] as Array<FacturaState>)

    const filteredClients = computed(() => {
      if (searchString.value) {
        return factura_list.value.filter(item => item.factura_date.includes(searchString.value)||
        item.factura_num.toString().includes(searchString.value)||
        JSON.parse(item.user).name.includes(searchString.value))
      }
      return factura_list.value;
      
    });

    const showFactura =() => {
      factura_list.value = []
      if(!store.state.isVisitor){
        getAllData("facturas").then(allData => {
          console.log("[PageHistory]factura en FireBase:",allData);
          allData.forEach((r: FacturaState) => {
            factura_list.value.push(r)
          })
          data.isLoading = false
        }).catch(error => {
          console.error("Error getting data: ", error);
        });
      }
      else{
        queryFactura().then((value) => {
          console.log("[PageHistory]factura en base de dato:",value)
          value.forEach((r: FacturaState) => {
            factura_list.value.push(r)
          })
          data.isLoading = false
      })
      }
      
    }

    const sortedFacturaList = computed(() => {
      const filteredFacturaList = filteredClients.value;

      return [...filteredFacturaList].sort((a, b) => {
    // Convert date from "DD/MM/YYYY" to "YYYY-MM-DD"
        const dateA = new Date(a.factura_date.split('/').reverse().join('-')).getTime() 
        const dateB = new Date(b.factura_date.split('/').reverse().join('-')).getTime()
        if(dateA == dateB){
          return Number(b.factura_num) - Number(a.factura_num)
        }
        else{
          return  dateB - dateA
        }
      })
    })
    const goBack = () => {
      clearAll()
      router.back();
    }

    const clearAll = () => {
      store.commit("RESET_STATE")
    }

    const saveAll = (item:any) => {
      const parsedEmpresa = JSON.parse(item.empresa);
      const parsedEuro = JSON.parse(item.euro_final);
      const parsedList = JSON.parse(item.item_list);
      const parsedCliente = JSON.parse(item.user)
      console.log(parsedEuro)

      store.commit("saveCliente",parsedCliente)
      
      store.commit("saveData", {
        dataArray: parsedList,
        euroBase: parsedEuro.total,
        dto: parsedEuro.dto,
        isRe: parsedEuro.re!=0,
        isIva: parsedEuro.iva!=0,
      })
      store.commit("saveFinal", parsedEuro)

      store.commit("saveEmpresa", parsedEmpresa)
      store.commit("saveNum",{
          num:item.factura_num,
          date:item.factura_date,
          forma:item.forma
       })
    }

    const goFactura = (item:FacturaState) => {
      saveAll(item)
      router.push({
       name: "pdf",
       params: { history: 1 },
      });
    };

    const newFactura = (item:FacturaState) => {
      saveAll(item)
      router.push({
       name: "company",
      });
    };

    const deletFactura = (item:FacturaState) => {
      Modal.confirm({
        title: () => 'Do you want to delete these items?',
        icon: () => createVNode(ExclamationCircleOutlined),
        content: () => '',
        onOk() {
          
          
     
        deleteFactura(item.id).then(value => {
          console.log("delect success", value);
          if(!store.state.isVisitor){
            deleteData("facturas", item.factura_num+item.factura_date.split('/')[2]).then(value => {
          console.log("delect success", value);
          showFactura()
        }).catch(error => {
          console.error("Error getting data: ", error);
        });
          }
        }).catch(error => {
          console.error("Error getting data: ", error);
        });
          
        },
        onCancel() {},
      })
      
    }

    const parsedItem = (item:FacturaState)=>{
      const parsedCliente = JSON.parse(item.user);
      return "Nº: " + item.factura_num + ", " + item.factura_date + ", "  + parsedCliente.name;
    }

    onMounted(() => {
     showFactura()
    })
   

    return {
      ...refData,
      t,
      factura_list,
      goBack,
      parsedItem,
      goFactura,
      newFactura,
      sortedFacturaList,
      deletFactura,
      filteredClients,
      searchString,
    }
  },
});
</script>
<style scoped>


</style>

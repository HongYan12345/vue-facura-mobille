<template>
<div class="button-container">
      <a-button @click="goBack" class="btn-back" size="large">{{$t('back')}}</a-button>
       <a-button @click="goPdf" class="btn-next" size="large">{{$t('next')}}</a-button>
    </div>
  <a-collapse
    :bordered="false"
    class="collapse-total"
    
  >
    <a-collapse-panel >
      <template #header>
        <div style="margin-left: 0;"> <span>{{$t('total_euro')}}</span></div>
        <div class="space"></div>
        <div>
          <div v-if="isIva">con iva</div>
          <div v-else>sin iva</div>
          <div v-if="isRe">con re</div>
          <div v-else>sin re</div>
        </div>
        <div class="space"></div>
        <div class="large-font"><span >{{ total_euros.toFixed(2) }}€</span></div>
          
      </template>
      <a-row :gutter="16">
        <a-col :xs="18" :sm="12" :md="12" :lg="6">
          <a-input-number
            size="small"
            style="padding-bottom: 8px"
            v-model:value="displayDto"
            @change="calcula"
            addon-before="DTO"
            :min="0"
            :max="99"
            >%</a-input-number
          >
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="12"> &nbspTotal:</a-col>
        <a-col :span="12" class="text-right">
          {{ total.toFixed(2) }}
        </a-col>
      </a-row>
      <a-row v-if="dto > 0">
        <a-col :span="12"> &nbsp{{ dto }}%DTO:</a-col>
        <a-col :span="12" class="text-right">
          -{{ Number(total * 0.01 * dto).toFixed(2) }}
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="12">
          &nbsp<a-checkbox :checked="isIva" @click="checkIva"
            >+21%IVA</a-checkbox
          ></a-col
        >
        <a-col :span="12" class="text-right">
          {{ iva.toFixed(2) }}
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="12">
          &nbsp<a-checkbox :checked="isRe" @click="checkRe"
            >+5.2%R.E.</a-checkbox
          ></a-col
        >
        <a-col :span="12" class="text-right">
          {{ re.toFixed(2) }}
        </a-col>
      </a-row>
    </a-collapse-panel>
  </a-collapse>

  

  <a-row>
    <a-col :span="24">
      <a-button @click="addProducto" class="btn-add" type="text" block
        ><template #icon><PlusOutlined style="font-size: 20px;"/></template
      ></a-button>
      <a-list
        class="a-list"
        item-layout="horizontal"
        :data-source="dataSource"
        :locale="{ emptyText: ' ' }"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="item-row">
              <a class="item-details" @click="editProducto(item)">
                <div>
                  <div>{{item.codigo}}, {{item.articulo}}</div>
                  <div>{{ item.cantidad }} x {{ Number(item.precio).toFixed(2) }} €</div>
                </div>
                
                <div class="list-font">{{Number(item.euros).toFixed(2)}} €</div>
              </a>
              
            </div>
          </a-list-item>
        </template>
      </a-list>
    </a-col>
  </a-row>


  <a-modal
    v-model:visible="add_producto"
    title="add"
    :confirm-loading="confirmLoading"
    @ok="saveProducto"
  >
    <a-row>
      <a-col :span="5">{{$t('cantidad')}}：</a-col>
      <a-col :span="17">
        <a-input
          v-model:value="cantidad"
          class="text-right"
          spellcheck="false"
          @input="validateNumberInput"
        ></a-input>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="5">{{$t('precio')}}:</a-col>
      <a-col :span="17">
        <a-input
          v-model:value="precio"
          class="text-right"
          spellcheck="false"
          @blur="checkInput"
          @input="validatePrecioInput"
        ></a-input>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="5">{{$t('codigo')}}:</a-col>
      <a-col :span="17">
        <a-input
          v-model:value="codigo"
          class="text-right"
          spellcheck="false"
        ></a-input>
      </a-col>
    </a-row>
    <a-select
      v-model:value="articulo"
      show-search
      placeholder="Select"
      style="width: 100%"
      :options="articulo_list"
    >
    </a-select>
    <template #footer>
       <div class="button-container">
        <a-popconfirm
           v-if="isEdit!=''"
          title="Are you sure delete this task?"
          ok-text="Yes"
          cancel-text="No"
          @confirm="deleteProducto(codigo)"
        >
        <a-button
        v-if="isEdit!=''"
          size="large"
          type="primary"
          danger
          >{{$t('delect')}}</a-button>
        </a-popconfirm>
        <a-button :class="{ 'center-button': !(isEdit!='') }" class="btn-normal" key="submit" type="primary" size="large"  @click="saveProducto">{{$t('save')}}</a-button>
       </div>
        
      </template>
  </a-modal>
  
</template>


<script lang="ts">
import {
  computed,
  reactive,
  Ref,
  ref,
  toRefs,
  onMounted,
} from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  queryAllArticulo,
} from "../util/dbSqliteM";
import { useI18n } from "vue-i18n";
import { DataItem } from "../util/interface";
import { getAllData} from "../util/dbFirebase"

export default {
  components: {
    PlusOutlined,
  },
  setup() {
    const data = reactive({
      total: 0,
      iva: 0,
      re: 0,
      total_euros: 0,
      dto: 0,
      ante_euro: 0,
      isRe: false,
      isIva: false,
      add_producto: false,
      cantidad: "",
      codigo: "",
      precio: "",
      articulo: "",
      isEdit: "",
      
    });
    const refData = toRefs(data);

    const displayDto = computed({
      get: () => (data.dto === 0 ? "" : data.dto),
      set: (value: number | string) => {
        data.dto = value === "" ? 0 : Number(value);
      },
    });

    //router
    const router = useRouter();
    //store
    const store = useStore();

    //i18n
    const { t} = useI18n();
  
    //lista de producto
    const dataSource: Ref<DataItem[]> = ref([]);
    const count = computed(() => dataSource.value.length + 1);
    const confirmLoading = ref<boolean>(false);
    //lista de articulo
    const articulo_list = ref([] as Array<{ value: string }>);

    //calcula
    const checkRe = () => {
      data.isRe = !data.isRe;
      calcula();
    };

    const checkIva = () => {
      data.isIva = !data.isIva;
      calcula();
    };

    const calcula = () => {
      console.log("[PageTable]funcion calcula");
      data.total = 0
      for (const item of dataSource.value) {
        data.total += item.euros

      }
      if (data.dto < 0) {
        data.dto = 0;
      }

      if (data.isIva) {
        data.iva = Number(
          (data.total * (100 - data.dto) * 0.01 * 0.21).toFixed(2)
        );
      } else {
        data.iva = 0;
      }

      if (data.isRe) {
        data.re = Number(
          (data.total * (100 - data.dto) * 0.01 * 0.052).toFixed(2)
        );
      } else {
        data.re = 0;
      }
      data.total_euros = Number(
        (data.total * (100 - data.dto) * 0.01 + data.iva + data.re).toFixed(2)
      );
    };

    //clear tabla
    const clearTable = () => {
      dataSource.value = new Array<DataItem>();
      data.total = 0;
      calcula();
    };

    //añadir producto
    const addProducto = () => {
      data.add_producto = true;
      data.isEdit = "";
      data.cantidad = "";
      data.codigo = "";
      data.precio = "";
      data.articulo = "";
    };
    //modificar producto
    const editProducto = (item: DataItem) => {
      data.add_producto = true;
      data.cantidad = item.cantidad;
      data.precio = item.precio;
      data.codigo = item.codigo;
      data.articulo = item.articulo;
      data.isEdit = item.key;
      data.ante_euro = item.euros;
    };
    //delete producto
    const deleteProducto = (codigo: string) => {
      data.add_producto = false;
      data.isEdit = "";
      data.cantidad = "";
      data.codigo = "";
      data.precio = "";
      data.articulo = "";
      dataSource.value = dataSource.value.filter((item) => item.codigo !== codigo);
      calcula();
    }

    //save producto
    const saveProducto = () => {
      confirmLoading.value = true;

      if (data.isEdit != "") {
        for (const item of dataSource.value) {
          if (item.key === data.isEdit) {
            item.cantidad = data.cantidad
            item.precio = Number(data.precio).toFixed(2)
            item.codigo = data.codigo
            item.articulo = data.articulo
            item.euros = Number(data.cantidad) * Number(data.precio)
            break;
          }
        }
        //data.total -= data.ante_euro;
        //data.ante_euro = 0;
        data.isEdit = "";
      } else {
        const newData = {
          key: `${count.value}`,
          cantidad: data.cantidad,
          codigo: data.codigo,
          precio: Number(data.precio).toFixed(2),
          articulo: data.articulo,
          euros: Number((Number(data.cantidad) * Number(data.precio)).toFixed(2)),
        };
        dataSource.value.push(newData);
      }
      data.add_producto = false;
      //data.total += Number(data.cantidad) * Number(data.precio);
      calcula();
      data.cantidad = "";
      data.codigo = "";
      data.precio = "";
      data.articulo = "";
      console.log("[PageTable]producto saved");
      confirmLoading.value = false;
    };
    const showArticulo = () => {
      if(!store.state.isVisitor){
        getAllData("articulos").then(allData => {
          console.log("[PageTable]articulo en FireBase:",allData);
          allData.forEach((r: any) => {
            articulo_list.value.push({
              value: r.name,
            })
          })
        }).catch(error => {
          console.error("Error getting data: ", error);
        });
      }
      else{
        queryAllArticulo().then((value) => {
          console.log("[PageTable]articulo en base de dato:", value);
          value.forEach((r: any) => {
            articulo_list.value.push({
              value: r.name,
            });
          });
        });
      }
      
    };

    const checkInput = () => {
      data.precio = data.precio.replace(/,|，/g, '.');
    }

    const validatePrecioInput = () => {
      // 这一行将所有的非数字和非小数点/逗号的字符移除
      data.precio = data.precio.replace(/[^0-9.,，]/g, '');
    }

    const validateNumberInput = () => {
      // 这一行将所有的非数字和非小数点/逗号的字符移除
      data.precio = data.precio.replace(/[^0-9]/g, '');
    };

    const pageUpdate = () => {
      console.log("[PageTable]funcion pageUpdate");
      showArticulo();
      calcula();
      saveAll();
    };

    const goPdf = () => {
      pageUpdate();
      router.push({
        name: "pdf",
        params: {history:0}
      });
    };

    const saveAll = () => {
      store.commit("saveData", {
        dataArray: dataSource.value,
        euroBase: data.total.toFixed(2),
        dto: data.dto,
        isRe: data.isRe,
        isIva: data.isIva,
      })
      store.commit("saveFinal", {
        total: data.total.toFixed(2),
        dto: data.dto,
        base: (data.total - data.dto).toFixed(2),
        iva: data.iva.toFixed(2),
        re: data.re.toFixed(2),
        total_final: data.total_euros.toFixed(2),
      })
    }

    const goBack = () => {
      saveAll()
      router.back()
    }

    onMounted(() => {
      console.log("[PageTable]funcion onMounted");
      data.dto = store.state.dto;
      dataSource.value = store.state.dataArray;
      data.total = store.state.euroBase;
      data.isRe = store.state.isRe;
      data.isIva = store.state.isIva;
      calcula();
      pageUpdate();
    });

    return {
      ...refData,
      t,
      displayDto,
      dataSource,
      checkIva,
      checkRe,
      calcula,
      goBack,
      addProducto,
      saveProducto,
      deleteProducto,
      editProducto,
      clearTable,
      checkInput,
      validatePrecioInput,
      validateNumberInput,
      confirmLoading,
      goPdf,
      articulo_list,
      
    };
  },
};
</script>
<style scoped>




.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}
</style>

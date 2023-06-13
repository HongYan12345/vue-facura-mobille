<template>
  <div>
    <div class="button-container">
      <a-button @click="goBack" class="btn-back" size="large">{{$t('back')}}</a-button>
    </div>
    
    <div id="exportPdf" ref="exportpdf" style="padding: 10px;
        font-size: 7px;
        padding-top:20px;
        width: 375px;
        margin: 0 auto;
        background-color: white;">
        <div style="
          font-size: 20px;
          float:left;padding-left:20px;">FACTURA</div>
      <div style="text-align: right; padding-right:15px;">Nº: {{num}}</div>
      <div style="text-align: right; padding-right:15px;">{{date}}</div>
      <div style="text-align: right; padding-right:15px;">{{forma}}</div>
      <br/>
      <div style="display: flex; padding-left:20px">
        <div style="flex: 1">{{ data_empresa.name }}</div>
        <div style="flex: 1; text-align: right; padding-right:20px;">{{ data_cliente.name }}</div>
      </div>
      <div style="display: flex; padding-left:20px">
        <div style="flex: 1">{{ data_empresa.direccion }}</div>
        <div style="flex: 1; text-align: right; padding-right:20px;">
          {{ data_cliente.direccion }}
        </div>
      </div>
      <div style="display: flex; padding-left:20px">
        <div style="flex: 1">{{ data_empresa.poblation }}</div>
        <div style="flex: 1; text-align: right; padding-right:20px;">
          {{ data_cliente.poblation }}
        </div>
      </div>
      <div style="display: flex; padding-left:20px">
        <div style="flex: 1">CP:{{ data_empresa.cp }}</div>
        <div style="flex: 1; text-align: right; padding-right:20px;">CP:{{ data_cliente.cp }}</div>
      </div>
      <div style="display: flex; padding-left:20px">
        <div style="flex: 1">NIF:{{ data_empresa.nif }}</div>
        <div style="flex: 1; text-align: right; padding-right:20px;">NIF:{{ data_cliente.nif }}</div>
      </div>
      <div style="display: flex; padding-left:20px">
        <div style="flex: 1">TEL:{{ data_empresa.telefono }}</div>
        <div style="flex: 1; text-align: right; padding-right:20px;">
          TEL:{{ data_cliente.telefono }}
        </div>
      </div>

     <table style="width: 90%; border-collapse: collapse; margin-top: 20px; margin-left: auto; margin-right: auto;">
  <thead>
    <tr>
      <th style="border-top: 0.3px solid #000;
    border-left: 0.3px solid #000; border-bottom: 0.1px solid #000; padding: 3px;font-size: 9px;">CANTIDAD</th>
      <th style="border-top: 0.3px solid #000;
    border-left: 0.3px solid #000; border-bottom: 0.1px solid #000; padding: 3px;font-size: 9px;">CODIGO</th>
      <th style="border-top: 0.3px solid #000;
    border-left: 0.3px solid #000; border-bottom: 0.1px solid #000; padding: 3px;font-size: 9px;">ARTICULO</th>
      <th style="border-top: 0.3px solid #000;
    border-left: 0.3px solid #000; border-bottom: 0.1px solid #000; padding: 3px;font-size: 9px;">PRECIO</th>
      <th style="border-top: 0.3px solid #000;
    border-left: 0.3px solid #000; border-bottom: 0.1px solid #000; border-right: 0.3px solid #000; padding: 3px;font-size: 9px;">EUROS</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in dataSource" :key="item.key" style="border-left:0.3px solid #000; border-right:0.3px solid #000;">
      <td style="border-bottom: 0.3px solid #000; padding: 2px;">
        {{ item.cantidad }}
      </td>
      <td style="border-bottom: 0.3px solid #000; border-left:0.3px solid #000; padding: 2px;">
        {{ item.codigo }}
      </td>
      <td style="border-bottom: 0.3px solid #000; border-left:0.3px solid #000; padding: 2px;">
        {{ item.articulo }}
      </td>
      <td style="border-bottom: 0.3px solid #000; border-left:0.3px solid #000; padding: 2px;">
        {{ item.precio }}
      </td>
      <td style="border-bottom: 0.3px solid #000; border-left: 0.3px solid #000; padding: 2px;">
        {{ item.euros.toFixed(2) }}
      </td>
    </tr>
    <tr v-for="_ in (24 - dataSource.length)" v-if="dataSource.length < 24" style="border-left:0.2px solid #000; border-right:0.2px solid #000;">
      <td style="border-bottom: 0.3px solid #fff;  padding: 2px;">&nbsp;</td>
      <td style="border-bottom: 0.3px solid #fff;  padding: 2px;">&nbsp;</td>
      <td style="border-bottom: 0.3px solid #fff;  padding: 2px;">&nbsp;</td>
      <td style="border-bottom: 0.3px solid #fff;  padding: 2px;">&nbsp;</td>
      <td style="border-bottom: 0.3px solid #fff;  padding: 2px;">&nbsp;</td>
    </tr>
    <tr v-for="item in dataSource_final" :key="item.total" style="border: 0.2px solid #000;">
      <td colspan="5">
        <table style="width: 100%; border-collapse: collapse; margin-top: 0;">
          <thead>
            <tr>
              <th style="border-right: 0.3px solid #000; border-top: 0.3px solid #000; padding: 3px;font-size: 9px;">TOTAL BRUTO</th>
              <th style="border-right: 0.3px solid #000; border-top: 0.3px solid #000; padding: 3px;font-size: 9px;">%DTO</th>
              <th style="border-right: 0.3px solid #000; border-top: 0.3px solid #000; padding: 3px;font-size: 9px;">BASE</th>
              <th style="border-right: 0.3px solid #000; border-top: 0.3px solid #000; padding: 3px;font-size: 9px;">21%IVA</th>
              <th style="border-right: 0.3px solid #000; border-top: 0.3px solid #000; padding: 3px;font-size: 9px;">5.2%R.E</th>
              <th style=" solid #000; padding: 3px; border-top: 0.3px solid #000; font-size: 9px;">TOTAL EUROS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border-top: 0.3px solid #000;border-right: 0.3px solid #000; padding: 5px;">
                {{ item.total }}
              </td>
              <td style="border-top: 0.3px solid #000;border-right: 0.3px solid #000; padding: 5px;">
                {{ item.dto }}
              </td>
              <td style="border-top: 0.3px solid #000;border-right: 0.3px solid #000; padding: 5px;">
                {{ item.base }}
              </td>
              <td style="border-top: 0.3px solid #000;border-right: 0.3px solid #000; padding: 5px;">
                {{ item.iva }}
              </td>
              <td style="border-top: 0.3px solid #000;border-right: 0.3px solid #000; padding: 5px;">
                {{ item.re }}
              </td>
              <td style="border-top: 0.3px solid #000; padding: 5px;">
                {{ item.total_final }}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
    </div>
    <div v-if="isHistory != 1">
      <a-button @click="savePdf">{{$t('save')}}</a-button>
    </div>
    <div>
      <a-button @click="exportPdf">{{$t('export')}}</a-button>
    </div>
  </div>
</template>


<script lang="ts">
import { ref, reactive, toRefs, onMounted} from "vue";
import { useRouter, useRoute } from "vue-router";
import { export_pdf } from "../util/exportPdf";
import { useStore } from "vuex";
import {
  insertFactura } from "../util/dbSqliteM"
import { DataItem, FormState } from "../util/interface";
import dayjs from 'dayjs';
import { DatePicker, message } from 'ant-design-vue';
import "../css/PdfStyle.css"
import { addOrUpdateData} from "../util/dbFirebase"

export default {
  components: { DatePicker},
  setup() {
    const data = reactive({
      forma:ref('EFECTIVO'),
      date: ref(dayjs().format('DD/MM/YYYY')),
      num: "",
      isHistory:0,

      data_empresa: ref<FormState>({
        name: "",
        direccion: "",
        nif: "",
        forma: "",
        poblation: "",
        cp: "",
        telefono: "",
      }),
      data_cliente: ref<FormState>({
        name: "",
        direccion: "",
        nif: "",
        forma: "",
        poblation: "",
        cp: "",
        telefono: "",
      }),
      dataSource: new Array<DataItem>(),
      dataSource_final: [
        {
          total: "",
          dto: "",
          base: "",
          iva: "",
          re: "",
          total_final: "",
        },
      ],
      columns: [
        {
          title: "cantidad",
          dataIndex: "cantidad",
          key: "cantidad",
        },
        {
          title: "precio",
          dataIndex: "precio",
          key: "precio",
        },
        {
          title: "codigo",
          dataIndex: "codigo",
          key: "codigo",
        },
        {
          title: "articulo",
          dataIndex: "articulo",
          key: "articulo",
        },
        {
          title: "euros",
          dataIndex: "euros",
          key: "euros",
        },
      ],

      columns_final: [
        {
          title: "TOTAL BRUTO",
          dataIndex: "total",
          key: "total",
        },
        {
          title: "%DTO",
          dataIndex: "dto",
          key: "dto",
        },
        {
          title: "BASE",
          dataIndex: "base",
          key: "base",
        },
        {
          title: "21%IVA",
          dataIndex: "iva",
          key: "iva",
        },
        {
          title: "5.2%R.E",
          dataIndex: "re",
          key: "re",
        },
        {
          title: "TOTAL EUROS",
          dataIndex: "total_final",
          key: "total_final",
        },
      ],
      
    });
    const refData = toRefs(data)
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const goBack = () => {
      router.back();
    };

    const exportPdf = () => {
      if(data.isHistory == 0){
        savePdf()
      }
      let htmlElement = document.querySelector('#exportPdf');
      export_pdf(htmlElement, data.num)
    }
    
    const savePdf = () => {
      const dataItemJson = JSON.stringify(data.dataSource);
      const dataFinalJson = JSON.stringify(data.dataSource_final[0]);
      const dataEmpresaJson = JSON.stringify(data.data_empresa);
      const dataClienteJson = JSON.stringify(data.data_cliente);
      const dato = {
        empresa: dataEmpresaJson,
        euro_final: dataFinalJson,
        factura_date: data.date,
        factura_num: data.num,
        forma: data.forma,
        id: data.num+data.date.split('/')[2],
        item_list: dataItemJson,
        user: dataClienteJson
      }
      if(!store.state.isVisitor){
        addOrUpdateData("facturas", dato.id, dato)
      }
      else{
        insertFactura(dataClienteJson, dataEmpresaJson, dataItemJson, data.num, data.date, data.forma, dataFinalJson)
      }
      message.success('保存成功')
    };

    onMounted(() => {
      data.forma = store.state.forma
      data.num = store.state.num
      data.date = store.state.date
      data.dataSource = store.state.dataArray;
      data.data_cliente = store.state.data_cliente;
      data.data_empresa = store.state.data_empresa;
      data.dataSource_final[0] = store.state.dataFinal;
      data.isHistory = Number(route.params.history)
      console.log(store.state.dataFinal);
      console.log("data_cliente:", data.data_cliente);
    });

    return {
      ...refData,
      goBack,
      exportPdf,
      savePdf,
    }
  },
}
</script>
<style scoped>

</style>

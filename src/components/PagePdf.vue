<template>
  <div>
    <div class="button-container">
      <a-button @click="goBack" class="btn-back" size="large">{{$t('back')}}</a-button>
    </div>
    
    <div id="exportPdf" ref="exportpdf" class="preview-wrapper" :style="previewStyle">
    <div style="padding: 15px;
        font-size: 11px;
        width: 794px;
        min-height: 1123px;
        height: auto;
        box-sizing: border-box;
        margin: 0 auto;
        background-color: white;
        border: 1px solid #ddd;
        position: relative;">

      <!-- 顶部信息区：左侧FACTURA+INVOICE+DATE，右侧二维码 -->
      <div style="display: flex; align-items: flex-start; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ccc; margin-bottom: 12px;">
        <div style="text-align: left;">
          <div style="font-weight: bold; font-size: 20px; margin: 6px 0 8px 0;">FACTURA:</div>
          <div style="font-size: 14px; margin-bottom: 4px;"><strong>Fecha: </strong> {{date}}</div>
          <div style="font-size: 14px; margin-bottom: 4px;"><strong>Nº Factura: </strong> {{num}}</div>
          <div style="font-size: 14px;"><strong>Forma de Pago: </strong> {{ forma }}</div>
        </div>
        <div style="text-align: right;">
          <div style="width: 40mm; height: 40mm; border: 2px solid #000; box-sizing: border-box; background: #fff; margin: 6px 5px 0 auto; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666;">
            [40x40 mm QR CODE]
          </div>
          <div style="font-size: 12px; margin-top: 6px;">
            Factura verificable en la sede electrónica de la AEAT
          </div>
        </div>
      </div>

      <!-- 公司和客户信息区�?-->
      <div style="border-bottom: 1px solid #ccc; padding-bottom: 20px; margin-bottom: 16px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <!-- 行1：公司与客户名称 -->
          <div style="display: flex;">
            <div style="flex: 1; padding-right: 20px;"><strong>Empresa:</strong> {{ data_empresa.name }}</div>
            <div style="flex: 1;"><strong>Cliente:</strong> {{ data_cliente.name }}</div>
          </div>
          <!-- 行2：NIF -->
          <div style="display: flex;">
            <div style="flex: 1; padding-right: 20px;">NIF: {{ data_empresa.nif }}</div>
            <div style="flex: 1;">NIF: {{ data_cliente.nif }}</div>
          </div>
          <!-- 行3：direccion -->
          <div style="display: flex;">
            <div style="flex: 1; padding-right: 20px;">Dirección: {{ data_empresa.direccion }}</div>
            <div style="flex: 1;">Dirección: {{ data_cliente.direccion }}</div>
          </div>
          <!-- 行4：poblation -->
          <div style="display: flex;">
            <div style="flex: 1; padding-right: 20px;">Localidad: {{ data_empresa.poblation }}</div>
            <div style="flex: 1;">Localidad: {{ data_cliente.poblation }}</div>
          </div>
          <!-- 行5：cp -->
          <div style="display: flex;">
            <div style="flex: 1; padding-right: 20px;">Código Postal: {{ data_empresa.cp }}</div>
            <div style="flex: 1;">Código Postal: {{ data_cliente.cp }}</div>
          </div>
          <!-- 行6：telefone -->
          <div style="display: flex;">
            <div style="flex: 1; padding-right: 20px;">Teléfono: {{ data_empresa.telefono }}</div>
            <div style="flex: 1;">Teléfono: {{ data_cliente.telefono }}</div>
          </div>
          <!-- 行7：预留空行 -->
          <div style="display: flex;">
            <div style="flex: 1; padding-right: 20px;">&nbsp;</div>
            <div style="flex: 1;">&nbsp;</div>
          </div>
        </div>
      </div>

      <!-- 产品表格 -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1px solid #000;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #000; padding: 8px; font-size: 10px; width: 40%; text-align: left;">DESCripción</th>
            <th style="border: 1px solid #000; padding: 8px; font-size: 10px; width: 15%; text-align: center;">CODIGO</th>
            <th style="border: 1px solid #000; padding: 8px; font-size: 10px; width: 10%; text-align: center;">Cant.</th>
            <th style="border: 1px solid #000; padding: 8px; font-size: 10px; width: 15%; text-align: right;">Precio</th>
            <th style="border: 1px solid #000; padding: 8px; font-size: 10px; width: 15%; text-align: right;">Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in firstPageRows" :key="item.key">
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px;">{{ item.articulo }}</td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: center;">{{ item.codigo }}</td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: center;">{{ item.cantidad }}</td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: right;">{{ item.precio }}</td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: right;">{{ item.euros && item.euros.toFixed ? item.euros.toFixed(2) : item.euros }}</td>
          </tr>
        </tbody>
      </table>
      <!-- 合计区域（仅当商品数量≤20时在首页显示�?-->
      <div v-if="showTotalOnFirstPage" style="position: absolute; left: 15px; right: 15px; bottom: 50px; margin-top: 0;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 0;">
          <thead>
            <tr>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">TOTAL BRUTO</th>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">%DTO</th>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">BASE</th>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">21%IVA</th>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">5.2%R.E</th>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">TOTAL EUROS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataSource_final" :key="item.total">
              <td style="border: 0.3px solid #000; padding: 5px;">{{ item.total }}</td>
              <td style="border: 0.3px solid #000; padding: 5px;">{{ item.dto }}</td>
              <td style="border: 0.3px solid #000; padding: 5px;">{{ item.base }}</td>
              <td style="border: 0.3px solid #000; padding: 5px;">{{ item.iva }}</td>
              <td style="border: 0.3px solid #000; padding: 5px;">{{ item.re }}</td>
              <td style="border: 0.3px solid #000; padding: 5px;">{{ sumTotal(item.base, item.iva, item.re) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 页脚（第一页右下角显示页码�?-->
      
    </div>

    <!-- 其他页面 - 仅当商品数量超过20个时显示 -->
    <div v-for="(pageRows, pageIndex) in otherPages" :key="'page-' + (pageIndex + 2)" class="other-page" style="page-break-before: always; margin: 0 auto; padding: 6px 12px 8px 12px; border-left: 1px solid #ddd; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd; border-top: 0; background-color: white; position: relative;">
      <!-- 第二页标题区域：与首页保持一致的垂直布局 -->
      <div style="text-align: left; margin: 6px 0 12px 0; border-bottom: 1px solid #ccc; padding-bottom: 8px;">
        <div style="font-weight: bold; font-size: 20px; margin-bottom: 8px;">FACTURA (Continuación)</div>
        <div style="font-size: 14px; margin-bottom: 4px;"><strong>DATE:</strong> {{date}}</div>
        <div style="font-size: 14px; margin-bottom: 4px;"><strong>INVOICE:</strong> {{num}}</div>
        <div style="font-size: 14px;"><strong>FORMA:</strong> {{ forma }}</div>
      </div>
      
      <!-- 其他页产品表�?-->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1px solid #000;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #000; padding: 8px; font-size: 10px; width: 40%; text-align: left;">DESCripción</th>
            <th style="border: 1px solid #000; padding: 8px; font-size: 10px; width: 15%; text-align: center;">CODIGO</th>
            <th style="border: 1px solid #000; padding: 8px; font-size: 10px; width: 10%; text-align: center;">Cant.</th>
            <th style="border: 1px solid #000; padding: 8px; font-size: 10px; width: 15%; text-align: right;">Precio</th>
            <th style="border: 1px solid #000; padding: 8px; font-size: 10px; width: 15%; text-align: right;">Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pageRows" :key="item.key">
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px;">{{ item.articulo }}</td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: center;">{{ item.codigo }}</td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: center;">{{ item.cantidad }}</td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: right;">{{ item.precio }}</td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: right;">{{ item.euros && item.euros.toFixed ? item.euros.toFixed(2) : item.euros }}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- 合计区域（仅在最后一页显示，且商品数�?20时） -->
      <div v-if="showTotalOnLastPage && pageIndex === otherPages.length - 1" style="position: absolute; left: 15px; right: 15px; bottom: 50px; margin-top: 0;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 0;">
          <thead>
            <tr>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">TOTAL BRUTO</th>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">%DTO</th>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">BASE</th>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">21%IVA</th>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">5.2%R.E</th>
              <th style="border: 0.3px solid #000; padding: 3px; font-size: 9px;">TOTAL EUROS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataSource_final" :key="item.total">
              <td style="border: 0.3px solid #000; padding: 5px;">{{ item.total }}</td>
              <td style="border: 0.3px solid #000; padding: 5px;">{{ item.dto }}</td>
              <td style="border: 0.3px solid #000; padding: 5px;">{{ item.base }}</td>
              <td style="border: 0.3px solid #000; padding: 5px;">{{ item.iva }}</td>
              <td style="border: 0.3px solid #000; padding: 5px;">{{ item.re }}</td>
              <td style="border: 0.3px solid #000; padding: 5px;">{{ sumTotal(item.base, item.iva, item.re) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 页脚 - 其他页（移除HTML页码，改由导出逻辑统一绘制�?-->
    </div>
    </div>

    <div class="actions-fixed">
      <a-button class="btn-export" @click="exportPdf">{{$t('export')}}</a-button>
    </div>
  </div>
</template>


<script lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { export_pdf } from "../util/exportPdf";
import { useStore } from "vuex";
import {
  insertFactura } from "../util/dbLocal"
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
        name: "MODASISI Y XJX SL",
        direccion: "CL/ TORENO 40 LOCAL A",
        nif: "887191698",
        forma: "",
        poblation: "MADRID",
        cp: "28970",
        telefono: "65896670",
      }),
      data_cliente: ref<FormState>({
        name: "MODASISI Y XJX SL",
        direccion: "CL/ TORENO 40 LOCAL A",
        nif: "887191698",
        forma: "",
        poblation: "MADRID",
        cp: "28970",
        telefono: "65896670",
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

    // 预览缩放（手机端适配，仅用于屏幕显示，导出前会暂时关闭）
    const scaleEnabled = ref(true)
    const viewportWidth = ref(window.innerWidth)
    const baseWidth = 794
    const horizontalPadding = 16
    const scaleFactor = computed(() => {
      const available = Math.max(320, viewportWidth.value - horizontalPadding)
      return Math.min(1, available / baseWidth)
    })
    const previewStyle = computed(() => {
      // 导出时禁用缩放但仍固定宽度为A4基准（794px），避免wrapper扩展到视口宽导致整体被缩小
      if (!scaleEnabled.value) {
        return {
          width: `${baseWidth}px`,
          margin: '0 auto'
        }
      }
      const scale = scaleFactor.value
      const scaledWidth = `${baseWidth * scale}px`
      return {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: scaledWidth,
        margin: '0 auto'
      }
    })
    const handleResize = () => { viewportWidth.value = window.innerWidth }
    onMounted(() => { window.addEventListener('resize', handleResize) })
    onUnmounted(() => { window.removeEventListener('resize', handleResize) })
    
    // 分页配置
    // 计算属�?
    const maxRowsFirstPage = 20; // 首页最多显�?0行商�?
    const totalThreshold = 20; // 超过20行时合计表移到第二页�?1行合�?�?1行到第二页）
    const rowsPerOtherPage = 22; // 其他页每页显�?2�?
    
    // 只保留有效商品行（避免空白页�?
    const validRows = computed(() => {
      return data.dataSource.filter((item: any) => {
        if (!item) return false
        const art = String(item.articulo || '').trim()
        const cod = String(item.codigo || '').trim()
        return art.length > 0 || cod.length > 0
      })
    })

    // 首页显示的商品行数（基于有效行）
    const firstPageRows = computed(() => {
      return validRows.value.slice(0, maxRowsFirstPage);
    });
    
    // 其他页面的商品分�?
    const otherPages = computed(() => {
      // 如果商品行数未超过首页容量，但超过合计阈值，则强制添加一个仅显示合计的第二页
      if (validRows.value.length <= maxRowsFirstPage) {
        const needsTotalSecondPage = validRows.value.length > totalThreshold;
        return needsTotalSecondPage ? [[]] : [];
      }
      const remainingRows = validRows.value.slice(maxRowsFirstPage);
      const pages: Array<DataItem[]> = [];
      for (let i = 0; i < remainingRows.length; i += rowsPerOtherPage) {
        pages.push(remainingRows.slice(i, i + rowsPerOtherPage));
      }
      return pages;
    });
    
    // 总页�?
    const totalPages = computed(() => {
      if (validRows.value.length <= maxRowsFirstPage) {
        // 11�?5 行时不再在首页显示合计，强制第二页展示合�?
        return validRows.value.length > totalThreshold ? 2 : 1;
      }
      const remainingRows = validRows.value.length - maxRowsFirstPage;
      const additionalPages = Math.ceil(remainingRows / rowsPerOtherPage);
      return 1 + additionalPages;
    });
    
    // 控制首页是否显示合计表（�?5行时显示�?
    const showTotalOnFirstPage = computed(() => {
      return validRows.value.length <= totalThreshold;
    });
    
    // 控制最后一页是否显示合计表�?15行时显示�?
    const showTotalOnLastPage = computed(() => {
      return validRows.value.length > totalThreshold;
    });

    const goBack = () => {
      router.back();
    }

    const exportPdf = async () => {
      if(data.isHistory == 0){
        savePdf()
      }
      // 导出前关闭预览缩放，保证捕获原始尺寸
      scaleEnabled.value = false
      await nextTick()
      try {
        const htmlElement = document.querySelector('#exportPdf');
        export_pdf(htmlElement, data.num)
      } finally {
        setTimeout(() => { scaleEnabled.value = true }, 100)
      }
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
      //data.data_cliente = store.state.data_cliente;
      //data.data_empresa = store.state.data_empresa;
      data.dataSource_final[0] = store.state.dataFinal;
      data.isHistory = Number(route.params.history)
      console.log("[PagePDF]",store.state.dataFinal);
      console.log("[PagePDF]data_cliente:", data.data_cliente);
    });

    // 计算总计（base + iva + re），兼容字符串与数字
    const sumTotal = (base: any, iva: any, re: any) => {
      const toNum = (v: any) => {
        const n = Number(String(v).replace(',', '.'))
        return isNaN(n) ? 0 : n
      }
      return (toNum(base) + toNum(iva) + toNum(re)).toFixed(2)
    }

    return {
      ...refData,
      previewStyle,
      goBack,
      exportPdf,
      savePdf,
      sumTotal,
      firstPageRows,
      otherPages,
      totalPages,
      showTotalOnFirstPage,
      showTotalOnLastPage
    }
  },
}
</script>
<style scoped>
.actions-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 16px;
  display: flex;
  justify-content: center;
  z-index: 1000;
}
.preview-wrapper {
  will-change: transform;
}
.other-page {
  width: 794px;
  margin: 8px auto;
  position: relative;
  min-height: 1123px;
  box-sizing: border-box;
  padding-bottom: 60px;
}
</style>


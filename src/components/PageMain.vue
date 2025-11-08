<template>
<div class="button-main">
  <a-button @click="goCreate" class="btn-crear">
  <PlusOutlined style="font-size: 50px;" />
</a-button>
<a-button @click="goHistory" class="btn-crear">
  <FileSearchOutlined style="font-size: 50px;" />
</a-button>

</div>
 
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs,
        onMounted,} from 'vue'
import { PlusOutlined, FileSearchOutlined} from '@ant-design/icons-vue'
import { useRouter} from 'vue-router'
import { useStore } from 'vuex'
import { initAllTable } from '../util/dbLocal'
import { useI18n} from "vue-i18n"
import '../css/MainStyle.css';
import { uploadAllTable} from '../util/dbFirebase'
import { message } from 'ant-design-vue'

export default defineComponent({
  components: {
    PlusOutlined,
    FileSearchOutlined,
  },
  setup() {
    initAllTable()

    //store
    const store = useStore()
    if(!store.state.isVisitor){
      uploadAllTable()
    }
    
    const data = reactive({
      error: false,
      isCreate: false,
      
    })
    const refData = toRefs(data)
    const initAndUpload = async () => {
      try {
        // Initialize all tables
        await initAllTable();
  
        // Upload all tables to Firebase
        await uploadAllTable();
      } catch(error) {
        message.error('Error initializing and uploading tables:'+ error);
        console.error('Error initializing and uploading tables:', error);
      }
}

// base de dato
    initAndUpload();

//i18n
    const {t} = useI18n()

//router
    const router = useRouter()



    const goCreate =() => {
      data.isCreate = true
      router.push({
            name: "company",
      })
    }

    const goHistory =() => {
      data.isCreate = true
      router.push({
            name: "history",
      })
    }

    


    onMounted(() => {
     
    })
   

    return {
      ...refData,
      t,
      goCreate,
      goHistory,
    }
  },
});
</script>
<style scoped>


</style>

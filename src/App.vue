<template>
  <div v-if="!store.state.isLogin" class="main_login">
    <div v-if="isLoading" class="loading">
      <LoadingOutlined />
    </div>
    <div v-else>
      <PageLogin />
    </div>
  </div>
  <div v-else>
    <div class="menu-container">
      <a-menu
        style="background-color: #47b28c; padding: 10px 0 0"
        v-model:selectedKeys="current"
        mode="horizontal"
        @click="handleMenu"
        :key="selectedLanguage"
      >
        <a-menu-item key="1">
          {{ $t("factura") }}
        </a-menu-item>
        <a-menu-item key="2">
          {{ $t("clien") }}
        </a-menu-item>
        
      </a-menu>
      <a-button class="btn-calculador" @click="showDrawer"><CalculatorOutlined style="font-size: 25px;" /></a-button>
      <a-dropdown class="btn-lenguage" :trigger="['click']">
        <template #overlay>
          <a-menu @click="handleMenuClick">
            <a-menu-item key="1"> Español </a-menu-item>
            <a-menu-item key="2"> English </a-menu-item>
            <a-menu-item key="3"> 简体中文 </a-menu-item>
          </a-menu>
        </template>
        <a-button class="btn-main">
          {{ $t("lenguage") }}
          <DownOutlined />
        </a-button>
      </a-dropdown>
      <a-dropdown class="btn-lenguage" :trigger="['click']">
        <template #overlay>
          <a-menu @click="handleLogOut">
            <a-menu-item key="1">  {{ $t("logout") }} </a-menu-item>
            <a-menu-item key="2" v-if="store.state.isVisitor">  {{ $t("upload") }} </a-menu-item>
            <!-- <a-menu-item key="3">  验证邮箱 </a-menu-item> -->
            <a-menu-item key="3" v-if="!store.state.isVisitor">  {{ $t("uplocal") }} </a-menu-item>
          </a-menu>
        </template>
        <a-button class="btn-main">
         <LogoutOutlined />
        </a-button>
      </a-dropdown>
    </div>
     
    <a-drawer
      title="Calculador"
      placement="top"
      width=50
      height=350
      :closable="false"
      v-model:visible="visible"
    >
    <calculador />
    </a-drawer>
    
    <div>
      <router-view></router-view>
    </div>
  </div>
    
  </template>
  <script lang="ts">
  import { reactive, toRefs, onMounted, ref } from "vue"
  import { useRouter } from "vue-router"
  import { useI18n } from "vue-i18n"
  import { DownOutlined ,CalculatorOutlined, 
            LogoutOutlined, LoadingOutlined} from "@ant-design/icons-vue"
  import type { MenuProps } from "ant-design-vue"
  import { useStore } from 'vuex'
  import './css/AppStyle.css'
  import Calculador from './components/Calculador.vue'
  import PageLogin from './components/PageLogin.vue'
  import { logOut} from './util/fireBase.js'
  import { getAuth, onAuthStateChanged, sendEmailVerification } from "firebase/auth"
  import { uploadLocal} from './util/dbFirebase.js'
  
  
  export default {
    components: {
      DownOutlined,
      CalculatorOutlined,
      LogoutOutlined,
      LoadingOutlined,
      PageLogin,
      Calculador,
    },
    setup() {
      const data = reactive({
        isCreate: false,
        selectedLanguage:'',
        visible: ref<boolean>(false),
        isLoading: true,
      });
  
      //store
      const store = useStore()
  
      const showDrawer = () => {
        data.visible = true;
      };
  
      const current = ref(["1"]);
      const refData = toRefs(data);
      const router = useRouter();
      //i18n
      const { t, locale } = useI18n();
      const setLocale = (lang: string) => {
        locale.value = lang;
        data.selectedLanguage = lang;
      };
  
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, you can access user.uid here
          console.log("[PageApp] user:",user.uid);
          store.commit("logIn", user)
          
        }
        data.isLoading = false
      });
  
  
      const handleMenuClick: MenuProps["onClick"] = (e) => {
        if (e.key == 1) {
          setLocale("es");
        } else if (e.key == 2) {
          setLocale("en");
        } else if (e.key == 3) {
          setLocale("zh");
        }
      };
  
      const handleLogOut: MenuProps["onClick"] = (e) => {
        if (e.key == 1) {
          logOut().then(() => {
            store.commit("RESET_STATE")
            store.commit("logOut")
          }
        )
        }
        else if(e.key == 2){
          uploadFirebase()
        } 
        else if(e.key == 3){
          //verifyEmail()
          uploadLocal()
        }
      };
  
      const handleMenu: MenuProps["onClick"] = (e) => {
        console.log(e.key);
        console.log(current.value);
        if (e.key == 1) {
          if (current.value[0] == "2") {
            router.back();
          }
        } else if (e.key == 2) {
          goClient();
        } else {
          
        }
      };
  
      const uploadFirebase = () => {
        store.commit('logOut')
      }
  
      //管理客户
      const goClient = () => {
        router.push({
          name: "client",
        });
      };
  
      const verifyEmail = () => {
        const user = getAuth().currentUser;
        console.log("xxx");
        if(user){
          sendEmailVerification(user).then(function() {
        console.log("Verification email sent.");
      })
      .catch((error) => {
        console.error("Error sending verification email: ", error);
      });
        }
      }
  
      onMounted(() => {
        console.log("onMounted");
          router.push({
            name: "main",
          });
      });
  
      
      // onUpdated(() => {
      //   console.log("up")
      //   if(store.state.isLogin){
      //     router.push({
      //       name: "main",
      //     });
      //   }
      // })
     
  
      return {
        ...refData,
        t,
        locale,
        store,
        current,
        handleMenuClick,
        handleLogOut,
        handleMenu,
        showDrawer,
        verifyEmail,
      };
    },
  };
  </script>
  <style scoped>
  </style>
  
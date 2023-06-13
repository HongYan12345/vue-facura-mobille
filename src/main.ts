import { createApp} from 'vue'
import "./style.css"
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import router from './route';
import {store}  from "./store/store";
import VueI18n from './language/index'
import * as firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAxUj6C6LBIzBJ48gLJcQKYx5cB8_ZW1pc",
  authDomain: "vuefactura.firebaseapp.com",
  projectId: "vuefactura",
  storageBucket: "vuefactura.appspot.com",
  messagingSenderId: "43881118264",
  appId: "1:43881118264:web:beff07938c5a3a8fbd84cd",
  measurementId: "G-XH8HMT3M0M"
}

firebase.initializeApp(firebaseConfig);

createApp(App)
  .use(Antd)
  .use(router)
  .use(store)
  .use(VueI18n)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

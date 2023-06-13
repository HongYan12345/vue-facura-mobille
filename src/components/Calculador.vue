<template>
  <div style="width: 90%; border: 5px solid #ccc;">
    <div style="width: 100%; height:45px; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">{{ display }}</div>
    <a-row gutter="10">
      <a-col span="6">
        <a-button style="width: 100%;" @click="clearDisplay">C</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="changeSign">+/-</a-button>
      </a-col>
      <a-col span="6">
        <a-button>%</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="addOperator('/')">/</a-button>
      </a-col>
    </a-row>
    <a-row gutter="10">
      <a-col span="6">
        <a-button @click="appendToDisplay(7)">7</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="appendToDisplay(8)">8</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="appendToDisplay(9)">9</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="addOperator('*')">*</a-button>
      </a-col>
    </a-row>
    <a-row gutter="10">
      <a-col span="6">
        <a-button @click="appendToDisplay(4)">4</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="appendToDisplay(5)">5</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="appendToDisplay(6)">6</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="addOperator('-')">-</a-button>
      </a-col>
    </a-row>
    <a-row gutter="10">
      <a-col span="6">
        <a-button @click="appendToDisplay(1)">1</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="appendToDisplay(2)">2</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="appendToDisplay(3)">3</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="addOperator('+')">+</a-button>
      </a-col>
    </a-row>

    <a-row gutter="10">
      <a-col span="6">
        <a-button @click="appendToDisplay(0)">0</a-button>
      </a-col>
      <a-col span="6">
        <a-button @click="appendToDisplay('.')">.</a-button>
      </a-col>
      <a-col span="12">
        <a-button @click="calculate">=</a-button>
      </a-col>
    </a-row>
  </div>
</template>


<script lang="ts">
import { ref } from 'vue';

export default {
  setup() {
    const display = ref('');
    const operand1 = ref<null | number>(null);
    const operator = ref<null | string>(null);
    const newInput = ref(false);

    const appendToDisplay = (value: number | string) => {
      if (newInput.value) {
        display.value = '';
        newInput.value = false;
      }
      display.value += value;
    };

    const clearDisplay = () => {
      display.value = '';
      operand1.value = null;
      operator.value = null;
    };

    const changeSign = () => {
      if (display.value) {
        display.value = String(Number(display.value) * -1);
      }
    };

    const addOperator = (op: string) => {
      operand1.value = Number(display.value);
      operator.value = op;
      display.value = op;
      newInput.value = true
    };

    const calculate = () => {
      if (operand1.value !== null && operator.value && display.value) {
        const operand2 = Number(display.value);
        let result;

        switch (operator.value) {
          case '+':
            result = operand1.value + operand2;
            break;
          case '-':
            result = operand1.value - operand2;
            break;
          case '*':
            result = operand1.value * operand2;
            break;
          case '/':
            if (operand2 !== 0) {
              result = operand1.value / operand2;
            } else {
              result = 'Error: Division by zero';
            }
            break;
        }

        display.value = String(result);
        operand1.value = null;
        operator.value = null;
        newInput.value = true;
      }
    };

    return { display, appendToDisplay, clearDisplay, changeSign, addOperator, calculate };
  },
};
</script>

<style scoped>
.ant-btn{
  width: 100%;
}
</style>
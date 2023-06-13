export interface DataItem {
    key: string;
    cantidad: string;
    precio: string;
    codigo:string;
    articulo: string;
    euros: number;
  }
  
export interface FormState{
    name: string;
    direccion: string;
    nif: string;
    forma: string;
    cp: string;
    poblation: string;
    telefono: string;
  }

  export interface EuroFinal{
    total: string;
    dto: string;
    base: string;
    iva: string;
    re: string;
    total_final: string;
  }

  export interface FacturaState{
    empresa: string; 
    euro_final: string;
    factura_date: string;
    factura_num: string;
    forma: string;
    id: string;
    item_list: string;
    user: string;
  }
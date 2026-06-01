import React, { createContext, useContext, useReducer, useCallback } from 'react';

export interface Appointment {
  id: string;
  clientId?: string;
  barberId?: string;
  serviceId?: string;
  scheduledAt?: string;
  status?: string;
  client?: {
    id?: string;
    cpf?: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
    price: number;
    duration?: number;
  };
  barber?: {
    id?: string;
    user?: {
      name: string;
    };
  };
}

export interface CortesiaItem {
  productId: string;
  name: string;
  quantity: number;
}

export interface OrderItem {
  itemType: 'service' | 'product';
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  isCourtesy: boolean;
}

interface TotemState {
  cpf: string;
  clientData: any | null;
  clientName: string;
  clientAge: number;
  selectedAppointment: Appointment | null;
  wantsAlcohol: boolean;
  cortesiaItems: CortesiaItem[];
  orderItems: OrderItem[];
  total: number;
  orderId: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  currentStep: 'welcome' | 'cpf' | 'agendamentos' | 'idade' | 'alcool' | 'cortesia' | 'comanda' | 'pagamento' | 'sucesso';
}

type TotemAction =
  | { type: 'SET_CPF'; payload: string }
  | { type: 'SET_CLIENT_DATA'; payload: any }
  | { type: 'SELECT_APPOINTMENT'; payload: Appointment }
  | { type: 'SET_ALCOHOL'; payload: boolean }
  | { type: 'SET_CORTESIA_ITEMS'; payload: CortesiaItem[] }
  | { type: 'SET_ORDER_ID'; payload: string }
  | { type: 'SET_PAYMENT'; payload: { method: string; status: string } }
  | { type: 'SET_STEP'; payload: TotemState['currentStep'] }
  | { type: 'RESET' };

const initialState: TotemState = {
  cpf: '',
  clientData: null,
  clientName: '',
  clientAge: 0,
  selectedAppointment: null,
  wantsAlcohol: false,
  cortesiaItems: [],
  orderItems: [],
  total: 0,
  orderId: null,
  paymentMethod: null,
  paymentStatus: null,
  currentStep: 'welcome',
};

function totemReducer(state: TotemState, action: TotemAction): TotemState {
  switch (action.type) {
    case 'SET_CPF':
      return { ...state, cpf: action.payload };
    case 'SET_CLIENT_DATA':
      return {
        ...state,
        clientData: action.payload.client,
        clientName: action.payload.receita.name,
        clientAge: action.payload.receita.age,
      };
    case 'SELECT_APPOINTMENT':
      return {
        ...state,
        selectedAppointment: action.payload,
        total: action.payload.service.price,
        orderItems: [{
          itemType: 'service',
          itemId: action.payload.service.id,
          name: action.payload.service.name,
          price: action.payload.service.price,
          quantity: 1,
          isCourtesy: false,
        }],
      };
    case 'SET_ALCOHOL':
      return { ...state, wantsAlcohol: action.payload };
    case 'SET_CORTESIA_ITEMS':
      return { ...state, cortesiaItems: action.payload };
    case 'SET_ORDER_ID':
      return { ...state, orderId: action.payload };
    case 'SET_PAYMENT':
      return {
        ...state,
        paymentMethod: action.payload.method,
        paymentStatus: action.payload.status,
      };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface TotemContextType {
  cpf: string;
  clientData: any | null;
  clientName: string;
  clientAge: number;
  selectedAppointment: Appointment | null;
  wantsAlcohol: boolean;
  cortesiaItems: CortesiaItem[];
  orderItems: OrderItem[];
  total: number;
  orderId: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  setCPF: (cpf: string) => void;
  setClientData: (data: any) => void;
  selectAppointment: (appointment: Appointment) => void;
  setAlcohol: (wants: boolean) => void;
  setCortesiaItems: (items: CortesiaItem[]) => void;
  setOrderId: (id: string) => void;
  setPayment: (method: string, status: string) => void;
  setStep: (step: TotemState['currentStep']) => void;
  reset: () => void;
}

const TotemContext = createContext<TotemContextType | undefined>(undefined);

export function TotemProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(totemReducer, initialState);

  const setCPF = useCallback((cpf: string) => {
    dispatch({ type: 'SET_CPF', payload: cpf });
  }, []);

  const setClientData = useCallback((data: any) => {
    dispatch({ type: 'SET_CLIENT_DATA', payload: data });
  }, []);

  const selectAppointment = useCallback((appointment: Appointment) => {
    dispatch({ type: 'SELECT_APPOINTMENT', payload: appointment });
  }, []);

  const setAlcohol = useCallback((wants: boolean) => {
    dispatch({ type: 'SET_ALCOHOL', payload: wants });
  }, []);

  const setCortesiaItems = useCallback((items: CortesiaItem[]) => {
    dispatch({ type: 'SET_CORTESIA_ITEMS', payload: items });
  }, []);

  const setOrderId = useCallback((id: string) => {
    dispatch({ type: 'SET_ORDER_ID', payload: id });
  }, []);

  const setPayment = useCallback((method: string, status: string) => {
    dispatch({ type: 'SET_PAYMENT', payload: { method, status } });
  }, []);

  const setStep = useCallback((step: TotemState['currentStep']) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <TotemContext.Provider
      value={{
        cpf: state.cpf,
        clientData: state.clientData,
        clientName: state.clientName,
        clientAge: state.clientAge,
        selectedAppointment: state.selectedAppointment,
        wantsAlcohol: state.wantsAlcohol,
        cortesiaItems: state.cortesiaItems,
        orderItems: state.orderItems,
        total: state.total,
        orderId: state.orderId,
        paymentMethod: state.paymentMethod,
        paymentStatus: state.paymentStatus,
        setCPF,
        setClientData,
        selectAppointment,
        setAlcohol,
        setCortesiaItems,
        setOrderId,
        setPayment,
        setStep,
        reset,
      }}
    >
      {children}
    </TotemContext.Provider>
  );
}

export function useTotemFlow() {
  const context = useContext(TotemContext);
  if (context === undefined) {
    throw new Error('useTotemFlow must be used within a TotemProvider');
  }
  return context;
}
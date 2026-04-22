import Order from './order';
import Trade from './trade';
export type EngineEvents = {
    trade: (trade: Trade) => void;
    orderAdded: (order: Order) => void;
    orderCancelled: (order: Order) => void;
};
export declare class TypedEventEmitter<TEvents extends Record<string, (...args: any[]) => void>> {
    private listeners;
    on<K extends keyof TEvents>(event: K, listener: TEvents[K]): this;
    off<K extends keyof TEvents>(event: K, listener: TEvents[K]): this;
    once<K extends keyof TEvents>(event: K, listener: TEvents[K]): this;
    emit<K extends keyof TEvents>(event: K, ...args: Parameters<TEvents[K]>): void;
    removeAllListeners<K extends keyof TEvents>(event?: K): this;
}

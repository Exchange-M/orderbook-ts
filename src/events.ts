import Order from './order';
import Trade from './trade';

export type EngineEvents = {
  trade: (trade: Trade) => void;
  orderAdded: (order: Order) => void;
  orderCancelled: (order: Order) => void;
};

export class TypedEventEmitter<TEvents extends Record<string, (...args: any[]) => void>> {
  private listeners: { [K in keyof TEvents]?: Array<TEvents[K]> } = {};

  on<K extends keyof TEvents>(event: K, listener: TEvents[K]): this {
    (this.listeners[event] ??= []).push(listener);
    return this;
  }

  off<K extends keyof TEvents>(event: K, listener: TEvents[K]): this {
    const arr = this.listeners[event];
    if (!arr) return this;
    const i = arr.indexOf(listener);
    if (i >= 0) arr.splice(i, 1);
    return this;
  }

  once<K extends keyof TEvents>(event: K, listener: TEvents[K]): this {
    const wrapper = ((...args: any[]) => {
      this.off(event, wrapper as TEvents[K]);
      (listener as any)(...args);
    }) as TEvents[K];
    return this.on(event, wrapper);
  }

  emit<K extends keyof TEvents>(event: K, ...args: Parameters<TEvents[K]>): void {
    const arr = this.listeners[event];
    if (!arr) return;
    for (const fn of arr.slice()) {
      (fn as any)(...args);
    }
  }

  removeAllListeners<K extends keyof TEvents>(event?: K): this {
    if (event) delete this.listeners[event];
    else this.listeners = {};
    return this;
  }
}

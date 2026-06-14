import { useState, useCallback } from 'react';

export interface CartItem {
  name: string;
  price: string;   // formatted e.g. "$75.00"
  gradient: string;
  qty: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const add = useCallback((item: Omit<CartItem, 'qty'>) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.name === item.name);
      if (idx >= 0) return prev.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const updateQty = useCallback((idx: number, delta: number) => {
    setItems(prev =>
      prev
        .map((item, i) => i === idx ? { ...item, qty: item.qty + delta } : item)
        .filter(item => item.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + parseFloat(i.price.replace(/[^0-9.]/g, '')) * i.qty, 0);

  return { items, open, setOpen, add, remove, updateQty, clear, count, subtotal };
}

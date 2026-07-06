// src/stores/cartStore.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '../utils/api';
import { useUserStore } from './userStore';
import { Dish } from '@types/index';

export interface CartItem {
  dish_id: string;
  dish: Dish;
  quantity: number;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const totalPrice = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + Number(item.dish.price) * item.quantity,
      0
    );
  });

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const addItem = (dish: Dish, quantity: number = 1) => {
    const existing = items.value.find((item) => item.dish_id === dish.dish_id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.value.push({
        dish_id: dish.dish_id,
        dish,
        quantity
      });
    }
  };

  const removeItem = (dish_id: string) => {
    items.value = items.value.filter((item) => item.dish_id !== dish_id);
  };

  const updateQuantity = (dish_id: string, quantity: number) => {
    const item = items.value.find((item) => item.dish_id === dish_id);
    if (item) {
      if (quantity <= 0) {
        removeItem(dish_id);
      } else {
        item.quantity = quantity;
      }
    }
  };

  const clearCart = () => {
    items.value = [];
  };

  const checkout = async () => {
    if (items.value.length === 0) {
      error.value = 'Cart is empty';
      return false;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const userStore = useUserStore();
      const userId = userStore.user?.userId;

      const response = await apiClient.post('/orders', {
        orderId: crypto.randomUUID(),
        userId: userId,
        totalAmount: totalPrice.value,
        deliveryType: 'dine_in',
        deliveryAddress: 'Restaurant',
        specialInstructions: '',
        items: items.value.map((item) => ({
          itemId: item.dish_id,
          quantity: item.quantity,
          priceAtPurchase: Number(item.dish.price)
        }))
      });

      clearCart();
      return response.data.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Checkout failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    items,
    isLoading,
    error,
    totalPrice,
    totalItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    checkout
  };
});

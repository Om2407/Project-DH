import { useCallback } from 'react';
import { paymentsAPI } from '../api';
import toast from 'react-hot-toast';

// Load Razorpay script dynamically
const loadRazorpay = () => {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const useRazorpay = () => {
  const initiateSubscription = useCallback(async (plan, onSuccess) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error('Payment gateway failed to load. Please try again.');
      return;
    }

    try {
      const { data } = await paymentsAPI.createOrder(plan);
      const { order, key, amount, user } = data;

      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'GolfGives',
        description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
        image: '/logo192.png',
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await paymentsAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan
            });
            toast.success('🎉 Subscription activated!');
            if (onSuccess) onSuccess(verifyRes.data);
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#0A8A4A' },
        modal: {
          ondismiss: () => toast('Payment cancelled', { icon: 'ℹ️' })
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    }
  }, []);

  const initiateDonation = useCallback(async (amount, charityId, charityName, onSuccess) => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Payment gateway failed to load.'); return; }

    try {
      const { data } = await paymentsAPI.createDonation({ amount, charityId });
      const { order, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: 'INR',
        name: 'GolfGives',
        description: `Donation to ${charityName}`,
        order_id: order.id,
        handler: async (response) => {
          toast.success(`Thank you for donating to ${charityName}! ❤️`);
          if (onSuccess) onSuccess(response);
        },
        theme: { color: '#C9A84C' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Donation failed');
    }
  }, []);

  return { initiateSubscription, initiateDonation };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements
} from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  loading?: boolean;
}

const PaymentFormInner: React.FC<PaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
  loading = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      onError(error.message || 'Payment failed');
    } else {
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-xl font-bold text-blue-600">{amount.toFixed(3)} $</span>
            </div>
          </div>

          <PaymentElement />

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!stripe || isProcessing || loading}
            className="w-full h-12"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Pay {amount.toFixed(3)} $
              </>
            )}
          </Button>

          <div className="text-center text-xs text-gray-500">
            <Lock className="w-3 h-3 inline mr-1" />
            Your payment information is secure and encrypted
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

interface PaymentFormWrapperProps extends PaymentFormProps {
  stripePromise: Promise<any>;
}

const PaymentForm: React.FC<PaymentFormWrapperProps> = ({
  stripePromise,
  clientSecret,
  ...props
}) => {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormInner clientSecret={clientSecret} {...props} />
    </Elements>
  );
};

export default PaymentForm;
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Declare PayPal on window
declare global {
  interface Window {
    paypal: any;
  }
}

interface Notification {
  id: number;
  type: "success" | "error";
  title: string;
  message: string;
}

const NotificationPopup = ({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-right-full duration-300">
      <div
        className={`p-4 rounded-lg border-l-4 shadow-xl backdrop-blur-md ${
          notification.type === "success"
            ? "bg-slate-800/95 border-l-emerald-500 border border-slate-700/50"
            : "bg-slate-800/95 border-l-red-500 border border-slate-700/50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="text-xl">
            {notification.type === "success" ? "✅" : "❌"}
          </div>
          <div className="flex-1">
            <div
              className={`font-semibold text-sm ${
                notification.type === "success"
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {notification.title}
            </div>
            <div
              className={`text-xs mt-1 ${
                notification.type === "success"
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              {notification.message}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`text-lg font-bold leading-none transition-colors ${
              notification.type === "success"
                ? "text-emerald-400 hover:text-emerald-300"
                : "text-red-400 hover:text-red-300"
            }`}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CombinedGeneratorApp() {
  // Number generator state
  const [allNumbers, setAllNumbers] = useState<number[]>([]);
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [shadedNumbers, setShadedNumbers] = useState<Set<number>>(new Set());
  const [selectedNumber, setSelectedNumber] = useState<string>("");

  // Date generator state
  const [allDates, setAllDates] = useState<string[]>([]);
  const [currentDates, setCurrentDates] = useState<string[]>([]);
  const [shadedDates, setShadedDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // PayPal payment state
  const [isPayPalLoaded, setIsPayPalLoaded] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("10.00");
  const paypalRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationId, setNotificationId] = useState(0);

  const numberGenerateAll = () => {
    const numbers = [];
    for (let i = 100; i <= 999; i++) {
      numbers.push(i);
    }
    setAllNumbers(numbers);
    setCurrentNumbers([...numbers]);
  };

  const dateGenerateAll = () => {
    const dates = [];
    for (let year = 2026; year <= 2030; year++) {
      for (let month = 1; month <= 12; month++) {
        dates.push(
          `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`
        );
      }
    }
    setAllDates(dates);
    setCurrentDates([...dates]);
  };

  const numberShuffleAndSelect = () => {
    if (shadedNumbers.size === currentNumbers.length) {
      setShadedNumbers(new Set());
      setSelectedNumber("");
      return;
    }
    const unshadedNumbers = currentNumbers.filter(
      (num) => !shadedNumbers.has(num)
    );
    const randomIndex = Math.floor(Math.random() * unshadedNumbers.length);
    const selected = unshadedNumbers[randomIndex];
    setShadedNumbers((prev) => new Set([...prev, selected]));
    setSelectedNumber(selected.toString());
    updateExternalInputs(selected.toString(), selectedDate);
  };

  const dateShuffleAndSelect = () => {
    if (shadedDates.size === currentDates.length) {
      setShadedDates(new Set());
      setSelectedDate("");
      return;
    }
    const unshadedDates = currentDates.filter((date) => !shadedDates.has(date));
    const randomIndex = Math.floor(Math.random() * unshadedDates.length);
    const selected = unshadedDates[randomIndex];
    setShadedDates((prev) => new Set([...prev, selected]));
    setSelectedDate(selected);
    updateExternalInputs(selectedNumber, selected);
  };

  const masterShuffle = () => {
    numberShuffleAndSelect();
    dateShuffleAndSelect();
  };

  const updateExternalInputs = (number: string, date: string) => {
    if (number) {
      setCvv(number.slice(-3));
    }
    if (date) {
      setExpiryDate(date);
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits

    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }

    setExpiryDate(value);
  };

  const numberExportCSV = () => {
    const csv = currentNumbers.join(",");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "numbers_123_to_999.csv";
    a.click();
  };

  const dateExportCSV = () => {
    const csv = currentDates.join(",");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "months_2026_to_2030.csv";
    a.click();
  };

  const validateCardNumber = (
    cardNumber: string
  ): { isValid: boolean; cardType: string } => {
    const cleanNumber = cardNumber.replace(/\s/g, "");

    // Check if it's all digits
    if (!/^\d+$/.test(cleanNumber)) {
      return { isValid: false, cardType: "Unknown" };
    }

    // Card type patterns
    const cardPatterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    };

    let cardType = "Unknown";
    for (const [type, pattern] of Object.entries(cardPatterns)) {
      if (pattern.test(cleanNumber)) {
        cardType = type.charAt(0).toUpperCase() + type.slice(1);
        break;
      }
    }

    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(cleanNumber.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }

    return { isValid: sum % 10 === 0, cardType };
  };

  const validateExpiryDate = (expiry: string): boolean => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

    const [month, year] = expiry
      .split("/")
      .map((num) => Number.parseInt(num, 10));
    if (month < 1 || month > 12) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  };

  const validateCVV = (cvv: string, cardType: string): boolean => {
    if (!/^\d+$/.test(cvv)) return false;

    if (cardType === "Amex") {
      return cvv.length === 4;
    } else {
      return cvv.length === 3;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];

    // Validate cardholder name
    if (!cardName.trim()) {
      errors.push("Cardholder name is required");
    }

    // Validate card number
    const cardValidation = validateCardNumber(cardNumber);
    if (!cardValidation.isValid) {
      errors.push("Invalid card number");
    }

    // Validate expiry date
    if (!validateExpiryDate(expiryDate)) {
      errors.push("Invalid or expired date");
    }

    // Validate CVV
    if (!validateCVV(cvv, cardValidation.cardType)) {
      errors.push(
        `Invalid CVV (${
          cardValidation.cardType === "Amex" ? "4" : "3"
        } digits required)`
      );
    }

    if (errors.length > 0) {
      showNotification(
        "error",
        "Payment Failed",
        `Validation failed: ${errors.join(", ")}`
      );
      setResult(null);
    } else {
      showNotification(
        "success",
        "Validation Successful",
        `${cardValidation.cardType} card ending in ${cardNumber.slice(
          -4
        )} is valid for transactions`
      );
      setResult(null);
    }
  };

  const showNotification = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    const id = notificationId + 1;
    setNotificationId(id);
    setNotifications((prev) => [...prev, { id, type, title, message }]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    numberGenerateAll();
    dateGenerateAll();
  }, []);

  useEffect(() => {
    updateExternalInputs(selectedNumber, selectedDate);
  }, [selectedNumber, selectedDate]);

  useEffect(() => {
    const checkPayPal = () => {
      if (window.paypal && paypalRef.current) {
        setIsPayPalLoaded(true);
        window.paypal
          .Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: paymentAmount,
                    },
                    description: "Number Generator Premium Access",
                  },
                ],
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const order = await actions.order.capture();
                console.log("[v0] PayPal payment successful:", order);
                showNotification(
                  "success",
                  "Payment Successful!",
                  `Transaction ID: ${order.id}. Premium access activated!`
                );
                setResult(null);
                masterShuffle();
              } catch (error: unknown) {
                console.error("[v0] PayPal payment capture error:", error);

                let errorMessage = "Payment failed. ";
                if (typeof error === "object" && error !== null) {
                  const paypalError = error as {
                    details?: Array<{ description?: string; issue?: string }>;
                    message?: string;
                  };

                  if (paypalError.details && paypalError.details.length > 0) {
                    errorMessage += `Reason: ${
                      paypalError.details[0].description ||
                      paypalError.details[0].issue
                    }`;
                  } else if (paypalError.message) {
                    errorMessage += `Error: ${paypalError.message}`;
                  } else {
                    errorMessage +=
                      "Please check your payment method and try again.";
                  }
                } else if (typeof error === "string") {
                  errorMessage += error;
                }

                showNotification("error", "Payment Failed", errorMessage);
                setResult(null);
              }
            },
            onError: (err: unknown) => {
              console.error("[v0] PayPal error:", err);

              let errorMessage = "Payment error occurred. ";
              if (typeof err === "object" && err !== null) {
                const paypalError = err as { message?: string };
                if (paypalError.message) {
                  errorMessage += `Details: ${paypalError.message}`;
                }
              } else if (typeof err === "string") {
                errorMessage += `Details: ${err}`;
              } else {
                errorMessage += "Please try a different payment method.";
              }

              showNotification("error", "Payment Error", errorMessage);
              setResult(null);
            },
          })
          .render(paypalRef.current);
      } else {
        setTimeout(checkPayPal, 100);
      }
    };
    checkPayPal();
  }, [paymentAmount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {notifications.map((notification) => (
        <NotificationPopup
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            B-2
          </h1>
        </div>

        <div className="text-center mb-12">
          <Button
            onClick={masterShuffle}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            🎲 Master Shuffle
          </Button>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-t-lg border-b border-border/50">
            <CardTitle className="text-3xl font-bold text-card-foreground flex items-center gap-3">
              💳 Card Simulator
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Complete your payment to unlock premium number generation features
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-card-foreground">
                    Card Number
                  </label>
                  <Input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="h-12 text-lg bg-input border-border/50 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-card-foreground">
                    Cardholder Name
                  </label>
                  <Input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="h-12 text-lg bg-input border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-card-foreground">
                    (MM/YY)
                  </label>
                  <Input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="02/25"
                    maxLength={5}
                    className="h-12 text-lg font-mono bg-input border-border/50 focus:border-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-card-foreground">
                    CVV (GDP)
                  </label>
                  <Input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    maxLength={3}
                    className="h-12 text-lg font-mono bg-input border-border/50 focus:border-secondary/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              >
                🔍 Validate Card Information
              </Button>
            </form>

            <div className="mt-10 border-t border-border/50 pt-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">
                  💰 Complete Payment
                </h3>
                <p className="text-muted-foreground">
                  Secure payment processing via PayPal
                </p>
              </div>

              <div className="max-w-md mx-auto mb-6">
                <label className="block text-sm font-semibold text-card-foreground mb-2">
                  Payment Amount (USD)
                </label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="10.00"
                  step="0.01"
                  min="0.01"
                  className="h-12 text-xl font-bold text-center bg-input border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="max-w-md mx-auto">
                <div
                  ref={paypalRef}
                  className="min-h-[60px] rounded-lg overflow-hidden"
                ></div>
                {!isPayPalLoaded && (
                  <div className="text-center text-muted-foreground py-4 bg-muted/30 rounded-lg">
                    <div className="animate-pulse">🔄 Loading PayPal...</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                🔢 3-Digit Numbers
                <span className="text-sm font-normal text-muted-foreground">
                  (100-999)
                </span>
              </CardTitle>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={numberExportCSV}
                  variant="outline"
                  size="sm"
                  className="border-primary/20 hover:bg-primary/10 hover:border-primary/40 bg-transparent"
                >
                  📊 Export CSV
                </Button>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 mt-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg text-primary">
                      {currentNumbers.length}
                    </div>
                    <div className="text-muted-foreground">Total Numbers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-destructive">
                      {shadedNumbers.size}
                    </div>
                    <div className="text-muted-foreground">Used Numbers</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="max-h-80 overflow-y-auto border border-border/50 rounded-lg p-4 mb-6 bg-muted/20">
                <div className="flex flex-wrap gap-2">
                  {currentNumbers.map((num) => (
                    <span
                      key={num}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        shadedNumbers.has(num)
                          ? "bg-destructive text-destructive-foreground shadow-md"
                          : "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30"
                      }`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Input
                  value={selectedNumber}
                  placeholder="Selected number will appear here"
                  readOnly
                  className="text-2xl font-bold text-center bg-primary/5 border-primary/20 focus:border-primary/40 h-14"
                />
                {selectedNumber && (
                  <div className="absolute -top-2 left-4 bg-background px-2 text-xs text-primary font-medium">
                    Current Selection
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                📅 Month/Year Dates
                <span className="text-sm font-normal text-muted-foreground">
                  (01/26-12/30)
                </span>
              </CardTitle>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={dateExportCSV}
                  variant="outline"
                  size="sm"
                  className="border-secondary/20 hover:bg-secondary/10 hover:border-secondary/40 bg-transparent"
                >
                  📊 Export CSV
                </Button>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 mt-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg text-secondary">
                      {currentDates.length}
                    </div>
                    <div className="text-muted-foreground">Total Dates</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-destructive">
                      {shadedDates.size}
                    </div>
                    <div className="text-muted-foreground">Used Dates</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="max-h-80 overflow-y-auto border border-border/50 rounded-lg p-4 mb-6 bg-muted/20">
                <div className="flex flex-wrap gap-2">
                  {currentDates.map((date) => (
                    <span
                      key={date}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        shadedDates.has(date)
                          ? "bg-destructive text-destructive-foreground shadow-md"
                          : "bg-primary/20 text-primary-foreground hover:bg-primary/30"
                      }`}
                    >
                      {date}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Input
                  value={selectedDate}
                  placeholder="Selected date will appear here"
                  readOnly
                  className="text-2xl font-bold text-center bg-secondary/5 border-secondary/20 focus:border-secondary/40 h-14"
                />
                {selectedDate && (
                  <div className="absolute -top-2 left-4 bg-background px-2 text-xs text-secondary font-medium">
                    Current Selection
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-t border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                Premium Generator
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Professional number and date generation with secure payment
                processing for premium users.
              </p>
            </div>

            <div className="flex flex-col gap-8 lg:gap-12">
              <div className="text-center">
                <h4 className="font-semibold text-card-foreground mb-4 text-lg">
                  Security
                </h4>
                <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-primary">🔒</span> SSL Encrypted
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-secondary">🛡️</span> PayPal Protected
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-primary">✅</span> Card Validation
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/30 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                © 2025 Daysman Gad. All rights reserved.
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Privacy
                </span>
                <span className="hover:text-secondary transition-colors cursor-pointer">
                  Terms
                </span>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

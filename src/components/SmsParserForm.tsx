import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, MessageSquare } from "lucide-react";
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/types/finance";

interface SmsParserFormProps {
  onSubmit: (transaction: Omit<Transaction, "id">) => void;
  onCancel: () => void;
}

// Simple M-Pesa SMS parser function
function parseMpesaSms(smsText: string): Partial<Transaction> | null {
  const sms = smsText.toLowerCase();
  
  // Look for amount pattern (e.g., "ksh1,200.00" or "ksh 1200")
  const amountMatch = sms.match(/ksh\s?([0-9,]+\.?[0-9]*)/);
  if (!amountMatch) return null;
  
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  
  // Determine if it's sent money (expense) or received money (income)
  const isSent = sms.includes('sent to') || sms.includes('pay bill') || sms.includes('buy goods');
  const isReceived = sms.includes('received') || sms.includes('you have received');
  
  // Extract recipient/sender name for description
  let description = "M-Pesa transaction";
  const sentToMatch = sms.match(/sent to ([^.]+)/);
  const receivedFromMatch = sms.match(/received[^from]*from ([^.]+)/);
  const paybillMatch = sms.match(/pay bill for ([^.]+)/);
  
  if (sentToMatch) {
    description = `Sent to ${sentToMatch[1].trim()}`;
  } else if (receivedFromMatch) {
    description = `Received from ${receivedFromMatch[1].trim()}`;
  } else if (paybillMatch) {
    description = `Pay bill: ${paybillMatch[1].trim()}`;
  }
  
  return {
    amount: isReceived ? amount : -amount,
    description,
    payment_method: "M-Pesa" as const,
    date: new Date().toISOString()
  };
}

export default function SmsParserForm({ onSubmit, onCancel }: SmsParserFormProps) {
  const [smsText, setSmsText] = useState("");
  const [parsedTransaction, setParsedTransaction] = useState<Partial<Transaction> | null>(null);
  const [category, setCategory] = useState("");

  const handleParse = () => {
    const parsed = parseMpesaSms(smsText);
    setParsedTransaction(parsed);
    
    // Auto-suggest category based on description
    if (parsed?.description) {
      const desc = parsed.description.toLowerCase();
      if (desc.includes('food') || desc.includes('restaurant') || desc.includes('hotel')) {
        setCategory('Food');
      } else if (desc.includes('transport') || desc.includes('matatu') || desc.includes('uber')) {
        setCategory('Transport');
      } else if (desc.includes('airtime') || desc.includes('bundle')) {
        setCategory('Airtime');
      } else {
        setCategory('Other');
      }
    }
  };

  const handleSubmit = () => {
    if (!parsedTransaction || !category) return;
    
    const transaction: Omit<Transaction, "id"> = {
      amount: parsedTransaction.amount!,
      category: parsedTransaction.amount! > 0 ? category : category,
      description: parsedTransaction.description!,
      date: parsedTransaction.date!,
      payment_method: "M-Pesa"
    };
    
    onSubmit(transaction);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Parse M-Pesa SMS
              </CardTitle>
              <CardDescription>Paste your M-Pesa SMS to automatically extract transaction details</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sms">M-Pesa SMS Text</Label>
            <Textarea
              id="sms"
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Paste your M-Pesa SMS here... e.g., 'RAK1234567 Confirmed. Ksh1,200.00 sent to JOHN DOE...'"
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <Button 
            onClick={handleParse} 
            className="w-full"
            disabled={!smsText.trim()}
          >
            Parse SMS
          </Button>

          {parsedTransaction && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <h4 className="font-medium text-sm">Parsed Transaction:</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className={`font-medium ${parsedTransaction.amount! > 0 ? 'text-success' : 'text-destructive'}`}>
                    KSh {Math.abs(parsedTransaction.amount!).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{parsedTransaction.amount! > 0 ? 'Income' : 'Expense'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="text-right">{parsedTransaction.description}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Transaction Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {parsedTransaction?.amount && parsedTransaction.amount > 0 ? (
                      INCOME_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))
                    ) : (
                      EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1 bg-gradient-to-r from-primary to-primary-dark"
                  disabled={!category}
                >
                  Add Transaction
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-warning-light p-2 rounded">
            <strong>Example M-Pesa SMS:</strong><br/>
            "RAK1234567 Confirmed. Ksh1,200.00 sent to JOHN DOE 0722123456 on 8/1/24 at 2:30 PM. New M-PESA balance is Ksh5,800.00."
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
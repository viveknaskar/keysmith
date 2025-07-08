"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PasswordConfigProps {
  canvasEntropy: number[];
  onPasswordGenerated: (password: string) => void;
}

export function PasswordConfig({ canvasEntropy, onPasswordGenerated }: PasswordConfigProps) {
  const [passwordLength, setPasswordLength] = useState([16]);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    special: true
  });

  // Get weather data for additional entropy
  const getWeatherEntropy = async () => {
    try {
      // Using a free weather API - this is a simplified example
      const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo');
      const data = await response.json();
      return data.main?.temp || Math.random() * 1000;
    } catch {
      // Fallback to random if API fails
      return Math.random() * 1000;
    }
  };

  const generatePassword = async () => {
    let charset = '';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.numbers) charset += '0123456789';
    if (options.special) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      alert('Please select at least one character type');
      return;
    }

    // Combine entropy sources
    const timingEntropy = Date.now();
    const weatherEntropy = await getWeatherEntropy();
    const canvasEntropySum = canvasEntropy.reduce((a, b) => a + b, 0);
    
    // Simple entropy mixing (in production, use proper cryptographic functions)
    const combinedEntropy = timingEntropy + weatherEntropy + canvasEntropySum;
    
    let password = '';
    for (let i = 0; i < passwordLength[0]; i++) {
      const randomIndex = Math.floor((Math.random() * combinedEntropy * (i + 1)) % charset.length);
      password += charset[randomIndex];
    }

    onPasswordGenerated(password);
  };

  return (
    <Card className="bg-slate-800 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          Password Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-300">
              Password Length
            </Label>
            <span className="text-sm text-slate-400 font-mono">
              {passwordLength[0]}
            </span>
          </div>
          <Slider
            value={passwordLength}
            onValueChange={setPasswordLength}
            min={8}
            max={64}
            step={1}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="lowercase"
              checked={options.lowercase}
              onCheckedChange={(checked) => 
                setOptions(prev => ({ ...prev, lowercase: checked }))
              }
            />
            <Label htmlFor="lowercase" className="text-sm text-slate-300">
              Lowercase (a-z)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="uppercase"
              checked={options.uppercase}
              onCheckedChange={(checked) => 
                setOptions(prev => ({ ...prev, uppercase: checked }))
              }
            />
            <Label htmlFor="uppercase" className="text-sm text-slate-300">
              Uppercase (A-Z)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="numbers"
              checked={options.numbers}
              onCheckedChange={(checked) => 
                setOptions(prev => ({ ...prev, numbers: checked }))
              }
            />
            <Label htmlFor="numbers" className="text-sm text-slate-300">
              Numbers (0-9)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="special"
              checked={options.special}
              onCheckedChange={(checked) => 
                setOptions(prev => ({ ...prev, special: checked }))
              }
            />
            <Label htmlFor="special" className="text-sm text-slate-300">
              Special Characters
            </Label>
          </div>
        </div>

        <Button 
          onClick={generatePassword}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          Generate Secure Password
        </Button>
      </CardContent>
    </Card>
  );
}